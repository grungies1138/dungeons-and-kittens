import { openRollDialog } from "./apps/roll-dialog.mjs";
import { castSpell } from "./spells.mjs";
import { ABILITY_KEYS } from "./content.mjs";
import { SKILLS } from "./skills.mjs";
import { awardExperience } from "./experience.mjs";
import * as rest from "./rest.mjs";

const SCOPE = "dungeons-and-kittens";
const DIFFICULTY_KEYS = ["DNK.DifficultyNone", "DNK.DifficultyEasy", "DNK.DifficultyMedium", "DNK.DifficultyDifficult", "DNK.DifficultyLegendary"];

/**
 * Table-side automation in the spirit of the big systems (dnd5e and friends): inline test links
 * in journals and chat, GM "request a test" cards, hotbar macros dragged off the sheet, item chat
 * cards, /award and /rest chat commands, sensible Kitten token defaults, and a Party Overview.
 */

function abilityLabel(key) {
  return game.i18n.localize(`DNK.Ability${key.charAt(0).toUpperCase()}${key.slice(1)}`);
}

/** Who a click on a test link rolls for: selected tokens, else the user's own character. */
function rollingActors() {
  const controlled = canvas?.tokens?.controlled?.map(t => t.actor).filter(Boolean) ?? [];
  if (controlled.length) return Array.from(new Set(controlled));
  return game.user.character ? [game.user.character] : [];
}

/* -------------------------------------------- */
/*  Inline test links: @Test[smart difficulty=2 skill=seeAndSearch]{Spot the trap}           */
/* -------------------------------------------- */

function parseTestConfig(text) {
  const config = { ability: null, difficulty: 0, skill: null };
  for (const part of text.trim().split(/\s+/)) {
    const [key, value] = part.includes("=") ? part.split("=") : [null, part];
    if (!key && ABILITY_KEYS.includes(value.toLowerCase())) config.ability = value.toLowerCase();
    else if (key === "difficulty" || key === "dc") config.difficulty = Math.min(Math.max(Number(value) || 0, 0), 4);
    else if (key === "skill" && SKILLS.includes(value)) config.skill = value;
    else if (!key && SKILLS.includes(value)) config.skill = value;
  }
  return config;
}

/** The link's HTML, shared by the enricher and the "request a test" chat card. */
export function testLinkHTML({ ability, difficulty = 0, skill = null }, label = null) {
  const parts = [ability ? abilityLabel(ability) : game.i18n.localize("DNK.AnyAbility")];
  if (skill) parts.push(game.i18n.localize(`DNK.Skill.${skill}`));
  let text = label || parts.join(" + ");
  if (!label && difficulty) text += ` (${game.i18n.localize(DIFFICULTY_KEYS[difficulty])})`;
  return `<a class="dnk-test-link" data-ability="${ability ?? ""}" data-difficulty="${difficulty}" data-skill="${skill ?? ""}"
    data-tooltip="${game.i18n.localize("DNK.TestLinkTooltip")}"><i class="fas fa-dice-d6"></i> ${text}</a>`;
}

function registerEnricher() {
  CONFIG.TextEditor.enrichers.push({
    pattern: /@Test\[([^\]]*)\](?:\{([^}]*)\})?/gi,
    enricher: (match) => {
      const span = document.createElement("span");
      span.innerHTML = testLinkHTML(parseTestConfig(match[1]), match[2]);
      return span.firstElementChild;
    }
  });
}

async function onTestLink(event) {
  event.preventDefault();
  const { ability, difficulty, skill } = event.currentTarget.dataset;
  const actors = rollingActors();
  if (!actors.length) return ui.notifications.warn(game.i18n.localize("DNK.SelectACharacter"));
  for (const actor of actors) {
    await openRollDialog(actor, {
      ability: ability || "strong",
      lockAbility: !!ability,
      difficulty: Number(difficulty) || 0,
      skill: skill || null,
      fastForward: event.shiftKey
    });
  }
}

/** GM: post a test for the players to roll, each with their own Kitten. */
export async function requestTest() {
  if (!game.user.isGM) throw new Error(game.i18n.localize("DNK.GMOnly"));
  const abilities = ABILITY_KEYS.map(k => `<option value="${k}">${abilityLabel(k)}</option>`).join("");
  const difficulties = DIFFICULTY_KEYS.map((k, i) => `<option value="${i}" ${i === 2 ? "selected" : ""}>${game.i18n.localize(k)}</option>`).join("");
  const skills = SKILLS.map(k => `<option value="${k}">${game.i18n.localize(`DNK.Skill.${k}`)}</option>`).join("");
  const form = await new Promise(resolve => {
    let resolved = false;
    new Dialog({
      title: game.i18n.localize("DNK.RequestTest"),
      content: `<form class="dnk-roll-dialog">
        <div class="form-group"><label>${game.i18n.localize("DNK.Ability")}</label><select name="ability">${abilities}</select></div>
        <div class="form-group"><label>${game.i18n.localize("DNK.Difficulty")}</label><select name="difficulty">${difficulties}</select></div>
        <div class="form-group"><label>${game.i18n.localize("DNK.SkillUsed")}</label><select name="skill"><option value="">${game.i18n.localize("DNK.NoSkill")}</option>${skills}</select></div>
        <div class="form-group"><label>${game.i18n.localize("DNK.RequestReason")}</label><input type="text" name="reason"/></div>
      </form>`,
      buttons: {
        ok: { icon: '<i class="fas fa-bullhorn"></i>', label: game.i18n.localize("DNK.RequestTest"),
          callback: html => { resolved = true; resolve(new FormData(html[0].querySelector("form"))); } }
      },
      default: "ok",
      close: () => { if (!resolved) resolve(null); }
    }).render(true);
  });
  if (!form) return null;
  const config = { ability: form.get("ability"), difficulty: Number(form.get("difficulty")), skill: form.get("skill") || null };
  const reason = form.get("reason")?.trim();
  return ChatMessage.create({
    speaker: { alias: game.i18n.localize("DNK.Storyteller") },
    content: `<div class="dnk-chat-card dnk-notice">
      <strong>${game.i18n.localize("DNK.TestRequested")}</strong>${reason ? `<p>${reason}</p>` : ""}
      <p>${testLinkHTML(config)}</p>
      <p class="hint">${game.i18n.localize("DNK.TestRequestedHint")}</p>
    </div>`
  });
}

/* -------------------------------------------- */
/*  Item chat cards and hotbar macros            */
/* -------------------------------------------- */

/** Show a backpack item (or spell) in chat with its description, like dnd5e's item cards. */
export async function postItemCard(item) {
  const description = await TextEditor.enrichHTML(item.system.description ?? "", { async: true });
  const tags = [];
  if (item.type === "gear") {
    if (item.system.purrecious) tags.push(game.i18n.localize("DNK.PurreciousTag"));
    if (item.system.quantity > 1) tags.push(`x${item.system.quantity}`);
  }
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: item.actor }),
    content: `<div class="dnk-chat-card dnk-item-card">
      <header class="card-header"><img src="${item.img}" width="32" height="32"/><strong>${item.name}</strong></header>
      ${tags.length ? `<p class="hint">${tags.join(" · ")}</p>` : ""}
      ${description ? `<div class="card-description">${description}</div>` : ""}
    </div>`
  });
}

/** Use an owned item from a macro: spells are cast, gear is shown in chat. */
export async function useItem(uuid, { fastForward = false } = {}) {
  const item = await fromUuid(uuid);
  if (!item?.actor) return ui.notifications.warn(game.i18n.localize("DNK.ItemNotFound"));
  if (!item.actor.isOwner) return ui.notifications.warn(game.i18n.localize("DNK.NotYourItem"));
  try {
    if (item.type === "spell") return await castSpell(item.actor, item, { fastForward });
    return await postItemCard(item);
  } catch (err) {
    ui.notifications.warn(err.message);
  }
}

/** Roll an ability (optionally with a skill) from a macro. */
export async function rollFor(actorUuid, { ability = null, skill = null, fastForward = false } = {}) {
  const actor = await fromUuid(actorUuid);
  if (!actor?.isOwner) return ui.notifications.warn(game.i18n.localize("DNK.SelectACharacter"));
  return openRollDialog(actor, { ability: ability ?? "strong", lockAbility: !!ability, skill, fastForward });
}

async function macroFor(name, img, command) {
  const existing = game.macros.find(m => m.name === name && m.command === command && m.isOwner);
  return existing ?? Macro.create({ name, type: "script", img, command, flags: { [SCOPE]: { hotbar: true } } });
}

function onHotbarDrop(bar, data, slot) {
  if (data.type === "Item") {
    (async () => {
      const item = await fromUuid(data.uuid);
      if (!item?.actor) return ui.notifications.warn(game.i18n.localize("DNK.OwnedItemsOnly"));
      const macro = await macroFor(`${item.actor.name}: ${item.name}`, item.img, `game.dnk.useItem("${item.uuid}", { fastForward: event?.shiftKey });`);
      game.user.assignHotbarMacro(macro, slot);
    })();
    return false;
  }
  if (data.type === "DnkRoll") {
    (async () => {
      const actor = await fromUuid(data.actorUuid);
      const label = data.skill ? game.i18n.localize(`DNK.Skill.${data.skill}`) : abilityLabel(data.ability);
      const opts = JSON.stringify({ ability: data.ability, skill: data.skill });
      const macro = await macroFor(`${actor.name}: ${label}`, actor.img,
        `game.dnk.rollFor("${data.actorUuid}", { ...${opts}, fastForward: event?.shiftKey });`);
      game.user.assignHotbarMacro(macro, slot);
    })();
    return false;
  }
}

/* -------------------------------------------- */
/*  Chat commands: /award, /rest                 */
/* -------------------------------------------- */

function kittensNamed(names) {
  if (!names.length) return canvas?.tokens?.controlled?.length
    ? Array.from(new Set(canvas.tokens.controlled.map(t => t.actor).filter(a => a?.type === "kitten")))
    : game.actors.filter(a => a.type === "kitten" && a.hasPlayerOwner);
  return names.map(n => game.actors.find(a => a.type === "kitten" && a.name.toLowerCase() === n.toLowerCase())).filter(Boolean);
}

function onChatMessage(_log, content) {
  const match = content.trim().match(/^\/(award|rest)\b\s*(.*)$/i);
  if (!match) return;
  const [, command, args] = match;
  if (!game.user.isGM) {
    ui.notifications.warn(game.i18n.localize("DNK.GMOnly"));
    return false;
  }
  (async () => {
    try {
      if (command.toLowerCase() === "award") {
        const [amountText, ...rest] = args.split(/\s+/).filter(Boolean);
        const amount = Number(amountText);
        if (!Number.isInteger(amount) || amount === 0) throw new Error(game.i18n.localize("DNK.AwardUsage"));
        const names = rest.join(" ").split(",").map(s => s.trim()).filter(Boolean);
        const kittens = kittensNamed(names);
        if (!kittens.length) throw new Error(game.i18n.localize("DNK.NoPartyFound"));
        await awardExperience(kittens, amount);
        await ChatMessage.create({
          speaker: { alias: game.i18n.localize("DNK.Storyteller") },
          content: `<div class="dnk-chat-card dnk-notice">${game.i18n.format("DNK.AwardedXP", { amount, names: kittens.map(a => a.name).join(", ") })}</div>`
        });
      } else {
        const kind = args.trim().toLowerCase();
        if (!["lunch", "night"].includes(kind)) throw new Error(game.i18n.localize("DNK.RestUsage"));
        await rest.applyPartyRest(kind);
      }
    } catch (err) {
      ui.notifications.warn(err.message);
    }
  })();
  return false;
}

/* -------------------------------------------- */
/*  Party Overview                               */
/* -------------------------------------------- */

export class PartyOverview extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "dnk-party-overview",
      classes: ["dnk", "party-overview"],
      title: game.i18n.localize("DNK.PartyOverview"),
      template: "systems/dungeons-and-kittens/templates/apps/party-overview.html",
      width: 560,
      height: "auto",
      resizable: true
    });
  }

  static show() {
    const existing = Object.values(ui.windows).find(w => w instanceof PartyOverview);
    return (existing ?? new PartyOverview()).render(true);
  }

  getData() {
    const kittens = game.actors.filter(a => a.type === "kitten" && (a.hasPlayerOwner || game.user.isGM) && a.testUserPermission(game.user, "OBSERVER"));
    return {
      isGM: game.user.isGM,
      kittens: kittens.map(a => ({
        id: a.id, name: a.name, img: a.img,
        heart: a.system.resources.heart, furr: a.system.resources.furrendship,
        xp: a.system.experience?.current ?? 0,
        statuses: Array.from(a.statuses ?? []).map(id => CONFIG.statusEffects.find(s => s.id === id))
          .filter(Boolean).map(s => ({ img: s.img, name: game.i18n.localize(s.name) })),
        owner: a.isOwner
      }))
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    const run = fn => async ev => {
      ev.preventDefault();
      try { await fn(ev); } catch (err) { ui.notifications.warn(err.message); }
      this.render();
    };
    html.on("click", ".party-adjust", run(ev => {
      const { actorId, resource, delta } = ev.currentTarget.dataset;
      return game.actors.get(actorId)?.adjustResource(resource, Number(delta));
    }));
    html.on("click", ".party-open", ev => game.actors.get(ev.currentTarget.dataset.actorId)?.sheet.render(true));
    html.on("click", ".party-lunch", run(() => rest.applyPartyRest("lunch", { actors: game.actors.filter(a => a.type === "kitten" && a.hasPlayerOwner) })));
    html.on("click", ".party-night", run(() => rest.applyPartyRest("night", { actors: game.actors.filter(a => a.type === "kitten" && a.hasPlayerOwner) })));
    html.on("click", ".party-furr", run(() => rest.grantPartyFurrendship(1, { actors: game.actors.filter(a => a.type === "kitten" && a.hasPlayerOwner) })));
    html.on("click", ".party-xp", run(async () => {
      const kittens = game.actors.filter(a => a.type === "kitten" && a.hasPlayerOwner);
      await awardExperience(kittens, 1);
      ui.notifications.info(game.i18n.format("DNK.AwardedXP", { amount: 1, names: kittens.map(a => a.name).join(", ") }));
    }));
    html.on("click", ".party-request", run(() => requestTest()));
  }
}

/** Keep an open Party Overview live as Kittens change. */
function refreshPartyOverview(actor) {
  if (actor.type !== "kitten") return;
  const app = Object.values(ui.windows).find(w => w instanceof PartyOverview);
  app?.render();
}

/* -------------------------------------------- */
/*  Registration                                 */
/* -------------------------------------------- */

export function registerAutomation() {
  registerEnricher();

  Hooks.on("hotbarDrop", onHotbarDrop);
  Hooks.on("chatMessage", onChatMessage);
  Hooks.on("updateActor", refreshPartyOverview);
  Hooks.on("createActiveEffect", effect => effect.parent instanceof Actor && refreshPartyOverview(effect.parent));
  Hooks.on("deleteActiveEffect", effect => effect.parent instanceof Actor && refreshPartyOverview(effect.parent));

  /** Test links can appear anywhere enriched text is shown: journals, chat, item descriptions. */
  document.addEventListener("click", event => {
    const link = event.target.closest?.(".dnk-test-link");
    if (!link) return;
    onTestLink({ preventDefault: () => event.preventDefault(), currentTarget: link, shiftKey: event.shiftKey });
  });

  /** A Party Overview button at the top of the Actors sidebar. */
  const addButton = (_app, html) => {
    const root = html instanceof HTMLElement ? html : html[0];
    if (!root || root.querySelector(".dnk-party-button")) return;
    const header = root.querySelector(".header-actions, .directory-header .action-buttons");
    if (!header) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dnk-party-button";
    button.innerHTML = `<i class="fas fa-paw"></i> ${game.i18n.localize("DNK.PartyOverview")}`;
    button.addEventListener("click", () => PartyOverview.show());
    header.append(button);
  };
  Hooks.on("renderActorDirectory", addButton);
}
