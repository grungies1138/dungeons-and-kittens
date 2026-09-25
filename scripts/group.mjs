import { rollAbilityTest, totalSuccesses } from "./dice.mjs";
import { ABILITY_KEYS } from "./content.mjs";

const SCOPE = "dungeons-and-kittens";

/**
 * Group, opposed, and long tests (pp.50-52), run by the Storyteller from the GM Tools macros.
 */

function abilityLabel(key) {
  return game.i18n.localize(`DNK.Ability${key.charAt(0).toUpperCase()}${key.slice(1)}`);
}

function abilityOptions(selected = "strong") {
  return ABILITY_KEYS.map(k => `<option value="${k}" ${k === selected ? "selected" : ""}>${abilityLabel(k)}</option>`).join("");
}

function difficultyOptions(selected = 2) {
  return [1, 2, 3, 4].map(d => `<option value="${d}" ${d === selected ? "selected" : ""}>${
    game.i18n.localize(["", "DNK.DifficultyEasy", "DNK.DifficultyMedium", "DNK.DifficultyDifficult", "DNK.DifficultyLegendary"][d])}</option>`).join("");
}

function partyActors() {
  const controlled = canvas?.tokens?.controlled?.map(t => t.actor).filter(Boolean) ?? [];
  if (controlled.length) return Array.from(new Set(controlled));
  return game.actors.filter(a => a.type === "kitten");
}

async function ask(title, content) {
  return new Promise(resolve => {
    let resolved = false;
    new Dialog({
      title, content,
      buttons: {
        ok: { icon: '<i class="fas fa-dice"></i>', label: game.i18n.localize("DNK.Roll"),
          callback: html => { resolved = true; resolve(new FormData(html[0].querySelector("form"))); } }
      },
      default: "ok",
      close: () => { if (!resolved) resolve(null); }
    }).render(true);
  });
}

async function postSummary(html) {
  return ChatMessage.create({ content: `<div class="dnk-chat-card dnk-notice">${html}</div>`, speaker: { alias: game.i18n.localize("DNK.Storyteller") } });
}

/**
 * Group action (p.52): everyone rolls the same ability against the same difficulty; if most of
 * them succeed, they all succeed together. Acts on selected tokens, or every Kitten.
 */
export async function groupTest({ actors = partyActors(), ability, difficulty } = {}) {
  if (!actors.length) throw new Error(game.i18n.localize("DNK.NoPartyFound"));
  if (!ability) {
    const form = await ask(game.i18n.localize("DNK.GroupTest"), `<form class="dnk-roll-dialog">
      <p class="hint">${game.i18n.format("DNK.GroupTestHint", { names: actors.map(a => a.name).join(", ") })}</p>
      <div class="form-group"><label>${game.i18n.localize("DNK.Ability")}</label><select name="ability">${abilityOptions()}</select></div>
      <div class="form-group"><label>${game.i18n.localize("DNK.Difficulty")}</label><select name="difficulty">${difficultyOptions()}</select></div>
    </form>`);
    if (!form) return null;
    ability = form.get("ability");
    difficulty = Number(form.get("difficulty"));
  }
  const rows = [];
  let passed = 0;
  for (const actor of actors) {
    const message = await rollAbilityTest(actor, { ability, difficulty, flavor: game.i18n.localize("DNK.GroupTest") });
    const successes = totalSuccesses(message.flags[SCOPE].roll);
    const ok = successes >= difficulty;
    if (ok) passed++;
    rows.push(`<li>${actor.name}: ${successes} ${ok ? "✓" : "✗"}</li>`);
  }
  const groupOk = passed > actors.length / 2;
  await postSummary(`<strong>${game.i18n.localize("DNK.GroupTest")}</strong> - ${abilityLabel(ability)}, ${game.i18n.format("DNK.Needs", { n: difficulty })}
    <ul>${rows.join("")}</ul>
    <strong>${game.i18n.format(groupOk ? "DNK.GroupSucceeds" : "DNK.GroupFails", { passed, total: actors.length })}</strong>
    <p class="hint">${game.i18n.localize("DNK.GroupTestNote")}</p>`);
  return { passed, total: actors.length, success: groupOk };
}

/**
 * Opposed action (p.50): each side rolls an appropriate ability; most successes wins. Uses the
 * controlled token against the targeted one.
 */
export async function opposedTest() {
  const a = canvas?.tokens?.controlled?.[0]?.actor;
  const b = Array.from(game.user.targets)[0]?.actor;
  if (!a || !b) throw new Error(game.i18n.localize("DNK.OpposedNeedsTokens"));
  const form = await ask(game.i18n.localize("DNK.OpposedTest"), `<form class="dnk-roll-dialog">
    <div class="form-group"><label>${a.name}</label><select name="a">${abilityOptions()}</select></div>
    <div class="form-group"><label>${b.name}</label><select name="b">${abilityOptions()}</select></div>
  </form>`);
  if (!form) return null;
  const flavor = game.i18n.format("DNK.OpposedFlavor", { a: a.name, b: b.name });
  const ma = await rollAbilityTest(a, { ability: form.get("a"), flavor });
  const mb = await rollAbilityTest(b, { ability: form.get("b"), flavor });
  const sa = totalSuccesses(ma.flags[SCOPE].roll);
  const sb = totalSuccesses(mb.flags[SCOPE].roll);
  const verdict = sa === sb ? game.i18n.localize("DNK.OpposedTie")
    : game.i18n.format("DNK.OpposedWinner", { name: sa > sb ? a.name : b.name });
  await postSummary(`<strong>${flavor}</strong><p>${a.name} ${sa} - ${b.name} ${sb}</p><strong>${verdict}</strong>`);
  return { [a.name]: sa, [b.name]: sb };
}

/* -------------------------------------------- */
/*  Long tasks (p.51)                           */
/* -------------------------------------------- */

function longTaskHtml(task) {
  const pct = Math.min(100, Math.round((task.total / task.target) * 100));
  const log = task.log.map(l => `<li>${l}</li>`).join("");
  return `<div class="dnk-chat-card dnk-long-task">
    <strong>${game.i18n.localize("DNK.LongTask")}: ${task.name}</strong>
    <p>${game.i18n.format("DNK.LongTaskProgress", { total: task.total, target: task.target, rolls: task.log.length, interval: task.interval })}</p>
    <div class="dnk-progress"><div style="width:${pct}%"></div></div>
    ${task.done ? `<p><strong>${game.i18n.localize("DNK.LongTaskDone")}</strong></p>` : ""}
    <ol>${log}</ol>
    ${task.done ? "" : `<div class="dnk-chat-actions"><button type="button" class="dnk-long-task-roll">${game.i18n.localize("DNK.LongTaskRoll")}</button></div>`}
  </div>`;
}

/** Start a long task: a target number of successes gathered over repeated rolls (4 to 20). */
export async function startLongTask() {
  const form = await ask(game.i18n.localize("DNK.LongTask"), `<form class="dnk-roll-dialog">
    <div class="form-group"><label>${game.i18n.localize("Name")}</label><input type="text" name="name" value="${game.i18n.localize("DNK.LongTask")}"/></div>
    <div class="form-group"><label>${game.i18n.localize("DNK.LongTaskTarget")}</label><input type="number" name="target" value="8" min="1" max="40"/></div>
    <div class="form-group"><label>${game.i18n.localize("DNK.LongTaskInterval")}</label><input type="text" name="interval" value="${game.i18n.localize("DNK.LongTaskHour")}"/></div>
    <div class="form-group"><label>${game.i18n.localize("DNK.Ability")}</label><select name="ability">${abilityOptions("smart")}</select></div>
    <p class="hint">${game.i18n.localize("DNK.LongTaskHint")}</p>
  </form>`);
  if (!form) return null;
  const task = {
    name: form.get("name"), target: Number(form.get("target")) || 8, interval: form.get("interval"),
    ability: form.get("ability"), total: 0, log: [], done: false
  };
  return ChatMessage.create({ content: longTaskHtml(task), speaker: { alias: game.i18n.localize("DNK.Storyteller") }, flags: { [SCOPE]: { longTask: task } } });
}

/** A character works on the task: roll the task's ability and add the successes to the tally. */
async function onLongTaskRoll(event) {
  event.preventDefault();
  const message = game.messages.get(event.currentTarget.closest(".chat-message")?.dataset.messageId);
  const task = message?.flags?.[SCOPE]?.longTask;
  if (!task || task.done) return;
  const actor = canvas?.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor) return ui.notifications.warn(game.i18n.localize("DNK.SelectACharacter"));
  const roll = await rollAbilityTest(actor, { ability: task.ability, flavor: `${game.i18n.localize("DNK.LongTask")}: ${task.name}` });
  const successes = totalSuccesses(roll.flags[SCOPE].roll);
  task.total += successes;
  task.log.push(`${actor.name}: +${successes}`);
  task.done = task.total >= task.target;
  if (game.user.isGM || message.isOwner) {
    await message.update({ content: longTaskHtml(task), [`flags.${SCOPE}.longTask`]: task });
  } else {
    ui.notifications.info(game.i18n.format("DNK.LongTaskAskGM", { successes }));
  }
}

export function activateGroupChatListeners(html) {
  const el = html[0];
  if (el?.dataset?.dnkGroupBound) return;
  if (el?.dataset) el.dataset.dnkGroupBound = "1";
  html.on("click", ".dnk-long-task-roll", onLongTaskRoll);
}
