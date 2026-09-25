import { CLAW_INJURIES, ABILITY_KEYS } from "./content.mjs";

const SCOPE = "dungeons-and-kittens";
export const CLAW_STATUS = "dnk-claw-catfight";

/**
 * Catfight tactical actions (pp.58-59). `abilities` are the ones the book allows (the first is
 * the default in the roll dialog). `aggressive` actions pass the initiative to the other side.
 * Help needs no roll at all; Claw Attack requires being in a Claw Catfight (entering costs
 * 1 Furr-endship, once - p.56); Flee and Surrender are the ways out of a Claw Catfight (p.59).
 * `skills` are the ones the quick reference (p.281) pairs with the action; the first one the
 * actor has is pre-selected for its advantage.
 */
export const COMBAT_PRESETS = {
  fangAttack: { abilities: ["strong", "cute"], flavorKey: "DNK.FangAttack", aggressive: true },
  clawAttack: { abilities: ["strong", "smart"], flavorKey: "DNK.ClawAttack", aggressive: true, claw: true, skills: ["scratch"] },
  defend: { abilities: ["strong", "smart"], flavorKey: "DNK.Defend", isDefend: true, skills: ["keepCalmAndCarryOn", "shakeYourBooty"] },
  help: { flavorKey: "DNK.Help", auto: true },
  hinder: { abilities: ["smart", "strong", "cute"], flavorKey: "DNK.Hinder", aggressive: true, isHinder: true },
  move: { abilities: ["strong", "smart"], flavorKey: "DNK.Move", skills: ["shakeYourBooty"] },
  interact: { abilities: ["smart", "strong", "cute"], flavorKey: "DNK.Interact" },
  healAlly: { abilities: ["smart"], flavorKey: "DNK.HealAlly", isHeal: true, skills: ["healWoundsAndDiseases"] },
  flee: { abilities: ["smart"], flavorKey: "DNK.Flee" },
  surrender: { abilities: ["cute"], flavorKey: "DNK.Surrender" }
};

/**
 * Acting aggressively hands the initiative to the other side (p.58): drop this actor's
 * combatant below the flat-0 tie everyone starts a round at. Silently skipped without a
 * combat, a combatant, or permission to update it - a roll should never be blocked on this.
 */
export async function cedeInitiative(actor) {
  const combatant = game.combat?.combatants.find(c => c.actor?.id === actor.id);
  if (!combatant) return;
  try {
    await combatant.update({ initiative: -1 });
  } catch (_err) { /* no permission to update the Combat - ignore */ }
}

/**
 * Help, Hinder, and a character trait played helpfully each affect only the target's next
 * roll (pp.24, 58). They're shown as the Advantage/Disadvantage token status, flagged as
 * one-shot so the roll dialog removes them once used. A status someone toggles by hand (say, for
 * a lasting condition) has no flag and stays until they remove it.
 */
export async function grantOneShot(actor, kind) {
  const status = kind === "advantage" ? "dnk-advantage" : "dnk-disadvantage";
  if (!actor.statuses?.has(status)) await actor.toggleStatusEffect(status, { active: true });
  await actor.setFlag(SCOPE, `oneShot.${kind}`, true);
}

export async function consumeOneShots(actor) {
  const oneShot = actor.getFlag(SCOPE, "oneShot") ?? {};
  for (const kind of ["advantage", "disadvantage"]) {
    if (!oneShot[kind]) continue;
    const status = kind === "advantage" ? "dnk-advantage" : "dnk-disadvantage";
    if (actor.statuses?.has(status)) await actor.toggleStatusEffect(status, { active: false });
  }
  if (oneShot.advantage || oneShot.disadvantage) await actor.unsetFlag(SCOPE, "oneShot");
}

export function isInClawCatfight(actor) {
  return !!actor?.statuses?.has(CLAW_STATUS);
}

/**
 * Entering a Claw Catfight is so stressful the Kitten immediately loses 1 Furr-endship; with
 * none left, he must run instead (p.56). Extras don't track Furr-endship this way.
 */
export async function enterClawCatfight(actor) {
  if (isInClawCatfight(actor)) return false;
  if (actor.type === "kitten") {
    if ((actor.system.resources?.furrendship?.value ?? 0) < 1) throw new Error(game.i18n.localize("DNK.MustFlee"));
    await actor.adjustResource("furrendship", -1);
  }
  await actor.toggleStatusEffect(CLAW_STATUS, { active: true });
  await postNotice(actor, game.i18n.format("DNK.EnteredClaw", { name: actor.name }));
  return true;
}

export async function leaveClawCatfight(actor) {
  if (!isInClawCatfight(actor)) return;
  await actor.toggleStatusEffect(CLAW_STATUS, { active: false });
  await postNotice(actor, game.i18n.format("DNK.LeftClaw", { name: actor.name }));
}

/** Help (p.58) is automatically successful: give each targeted comrade an Advantage. */
export async function helpTargets(actor) {
  const names = [];
  for (const token of game.user.targets) {
    if (!token.actor) continue;
    await grantOneShot(token.actor, "advantage");
    names.push(token.actor.name);
  }
  const text = names.length
    ? game.i18n.format("DNK.HelpApplied", { name: actor.name, names: names.join(", ") })
    : game.i18n.format("DNK.HelpNoTarget", { name: actor.name });
  await postNotice(actor, text);
}

/** Conceding a Fang Catfight (p.59) ends the fight for that character without the defeat's consequences. */
export async function concede(actor) {
  const combatant = game.combat?.combatants.find(c => c.actor?.id === actor.id);
  if (combatant) {
    try { await combatant.update({ defeated: true }); } catch (_err) { /* no permission */ }
  }
  await postNotice(actor, game.i18n.format("DNK.Conceded", { name: actor.name }));
}

/** Pampering (p.53): 1 Furr-endship gives a friend 1 Heart - but not in the middle of a Catfight. */
export async function pamper(actor) {
  if (game.combat?.started && game.combat.combatants.some(c => c.actor?.id === actor.id)) {
    throw new Error(game.i18n.localize("DNK.NotDuringCatfight"));
  }
  if ((actor.system.resources?.furrendship?.value ?? 0) < 1) throw new Error(game.i18n.localize("DNK.NoFurrendship"));
  const target = Array.from(game.user.targets)[0]?.actor;
  if (!target) throw new Error(game.i18n.localize("DNK.NoTarget"));
  if (target.id === actor.id) throw new Error(game.i18n.localize("DNK.PamperSelf"));

  await actor.adjustResource("furrendship", -1);
  await target.adjustResource("heart", 1);
  await postNotice(actor, game.i18n.format("DNK.Pampered", { name: actor.name, target: target.name }));
}

/**
 * Character trait (p.24), each once per session: played helpfully it grants an Advantage;
 * played against the Kitten, one comrade recovers 1 Furr-endship (p.54). Reset at End Session.
 */
export async function useTrait(actor, mode) {
  const flag = mode === "positive" ? "traitPositiveUsed" : "traitNegativeUsed";
  if (actor.getFlag(SCOPE, flag)) throw new Error(game.i18n.localize("DNK.TraitAlreadyUsed"));
  const trait = actor.system.details?.characterTrait?.name || game.i18n.localize("DNK.CharacterTrait");

  if (mode === "positive") {
    await grantOneShot(actor, "advantage");
    await postNotice(actor, game.i18n.format("DNK.TraitPositive", { name: actor.name, trait }));
  } else {
    const target = Array.from(game.user.targets)[0]?.actor;
    if (!target || target.id === actor.id) throw new Error(game.i18n.localize("DNK.TraitNeedsComrade"));
    await target.adjustResource("furrendship", 1);
    await postNotice(actor, game.i18n.format("DNK.TraitNegative", { name: actor.name, trait, target: target.name }));
  }
  await actor.setFlag(SCOPE, flag, true);
}

/* -------------------------------------------- */
/*  Claw Catfight injuries (p.60)               */
/* -------------------------------------------- */

/**
 * A Kitten dropped to 0 Heart during a Claw Catfight rolls on the injury table. Called from the
 * GM-side updateActor hook in dnk.mjs. The injury leaves the fight, so the Claw status clears.
 */
export async function rollClawInjury(actor) {
  const roll = new Roll("1d6");
  await roll.evaluate();
  const injury = CLAW_INJURIES[roll.total - 1];

  for (const status of injury.statuses) await actor.toggleStatusEffect(status, { active: true });
  await actor.toggleStatusEffect(CLAW_STATUS, { active: false });

  let days = null;
  if (injury.rollDays) {
    const dayRoll = new Roll("1d6");
    await dayRoll.evaluate();
    days = dayRoll.total;
  } else if (injury.statuses.includes("dnk-incapacitated")) {
    days = 1;
  }
  /** Night's rests count these days down (rest.mjs); the status clears when they run out. */
  if (days) await actor.setFlag(SCOPE, "incapacitatedDays", days);

  const loseButtons = injury.loseAbility
    ? `<div class="dnk-chat-actions">${ABILITY_KEYS.map(key =>
        `<button type="button" class="dnk-lose-ability" data-actor-id="${actor.id}" data-ability="${key}">${
          game.i18n.format("DNK.LoseAbility", { ability: game.i18n.localize(`DNK.Ability${key.charAt(0).toUpperCase()}${key.slice(1)}`) })
        }</button>`).join("")}</div>`
    : "";
  const daysLine = days ? `<p>${game.i18n.format("DNK.InjuryDays", { days })}</p>` : "";

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    rolls: [roll],
    content: `<div class="dnk-chat-card dnk-injury">
      <strong>${game.i18n.format("DNK.ClawInjuryTitle", { name: actor.name })} (${roll.total}): ${injury.name}</strong>
      <p>${injury.text}</p>${daysLine}${loseButtons}</div>`,
    flags: { [SCOPE]: { injury: { roll: roll.total, actorId: actor.id, abilityLost: false } } }
  });
}

/** Critical injury: the player permanently loses 1 point in the ability of their choice. */
async function onLoseAbility(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const message = game.messages.get(button.closest(".chat-message")?.dataset.messageId);
  const actor = game.actors.get(button.dataset.actorId);
  const injury = message?.flags?.[SCOPE]?.injury;
  if (!message || !actor || !injury) return;
  if (injury.abilityLost) return ui.notifications.warn(game.i18n.localize("DNK.AbilityAlreadyLost"));
  if (!actor.isOwner) return ui.notifications.warn(game.i18n.localize("DNK.NotOwner"));

  const key = button.dataset.ability;
  const current = actor.system.abilities[key].value;
  await actor.update({ [`system.abilities.${key}.value`]: Math.max(1, current - 1) });
  await message.update({
    [`flags.${SCOPE}.injury.abilityLost`]: true,
    content: message.content.replace(
      /<div class="dnk-chat-actions">[\s\S]*?<\/div>/,
      `<p class="hint">${game.i18n.format("DNK.AbilityLost", { name: actor.name, ability: button.textContent })}</p>`
    )
  });
}

export function activateCatfightChatListeners(html) {
  const el = html[0];
  if (el?.dataset?.dnkCatfightBound) return;
  if (el?.dataset) el.dataset.dnkCatfightBound = "1";
  html.on("click", ".dnk-lose-ability", onLoseAbility);
}

async function postNotice(actor, text) {
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="dnk-chat-card dnk-notice">${text}</div>`
  });
}
