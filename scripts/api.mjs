import {
  rollAbilityTest, spendFurrendshipOnMessage, rerollOnMessage, setBlockOnMessage,
  healTargetsFromMessage, applyHinderFromMessage, forceSpellOnMessage
} from "./dice.mjs";
import { COMBAT_PRESETS, cedeInitiative, isInClawCatfight, enterClawCatfight, leaveClawCatfight, helpTargets } from "./catfight.mjs";
import { castSpellForActor } from "./spells.mjs";
import { buyImprovement } from "./experience.mjs";

/**
 * Actor-id-based entry points mirroring the actor sheet's buttons, for callers that only have
 * an id to work with (the Companion API macros in macros.mjs, and through them external tools)
 * rather than a live Actor reference from the current canvas/sheet.
 */

function requireActor(actorId) {
  const actor = game.actors.get(actorId);
  if (!actor) throw new Error(`Dungeons & Kittens API: no actor found for id "${actorId}"`);
  return actor;
}

function summarize(message) {
  return { messageId: message.id, roll: message.flags["dungeons-and-kittens"].roll };
}

/** Roll a raw ability test for an actor by id - mirrors the sheet's ability-score roll buttons. */
export async function rollAbilityTestForActor(actorId, { ability, flavor = "", advantage = 0, disadvantage = 0, difficulty = 0 } = {}) {
  const actor = requireActor(actorId);
  return summarize(await rollAbilityTest(actor, { ability, flavor, advantage, disadvantage, difficulty }));
}

/**
 * Take one of the sheet's Catfight actions (fangAttack/clawAttack/defend/help/hinder/move/
 * interact/healAlly/flee/surrender). `ability` picks among the abilities the action allows.
 * Help needs no roll and returns null; Claw Attack enters a Claw Catfight first if needed.
 */
export async function rollCombatActionForActor(actorId, presetKey, { ability, advantage = 0, disadvantage = 0, difficulty = 0 } = {}) {
  const preset = COMBAT_PRESETS[presetKey];
  if (!preset) throw new Error(`Dungeons & Kittens API: unknown combat action "${presetKey}"`);
  const actor = requireActor(actorId);
  if (preset.auto) {
    await helpTargets(actor);
    return null;
  }
  if (ability && !preset.abilities.includes(ability)) {
    throw new Error(`Dungeons & Kittens API: "${presetKey}" can't use ${ability} (allowed: ${preset.abilities.join(", ")})`);
  }
  if (preset.claw && !isInClawCatfight(actor)) await enterClawCatfight(actor);
  if (preset.aggressive) await cedeInitiative(actor);
  return summarize(await rollAbilityTest(actor, {
    ability: ability ?? preset.abilities[0],
    flavor: game.i18n.localize(preset.flavorKey),
    advantage, disadvantage, difficulty,
    isDefend: preset.isDefend, isHeal: preset.isHeal, isHinder: preset.isHinder
  }));
}

/** Cast a spellbook item, applying the same free-first-cast/recast-cost rule as the sheet button. */
export async function rollSpellForActor(actorId, itemId, { advantage = 0, disadvantage = 0 } = {}) {
  const actor = requireActor(actorId);
  const item = actor.items.get(itemId);
  if (!item || item.type !== "spell") throw new Error(`Dungeons & Kittens API: no spell "${itemId}" on actor "${actorId}"`);
  return summarize(await castSpellForActor(actor, item, { advantage, disadvantage }));
}

/** Adjust a clamped resource (heart or furrendship) by a delta; negative Heart applies damage. */
export async function adjustActorResource(actorId, resource, delta) {
  const actor = requireActor(actorId);
  await actor.adjustResource(resource, Number(delta) || 0);
  return actor.system.resources[resource];
}

/** Spend experience: kind is ability/skill/spell/slot; key is the ability key, skill key, or spell name. */
export async function improveActor(actorId, kind, key) {
  const actor = requireActor(actorId);
  await buyImprovement(actor, kind, key);
  return actor.system.experience;
}

export async function setClawCatfight(actorId, inClaw) {
  const actor = requireActor(actorId);
  if (inClaw) await enterClawCatfight(actor);
  else await leaveClawCatfight(actor);
  return isInClawCatfight(actor);
}

export {
  spendFurrendshipOnMessage, rerollOnMessage, setBlockOnMessage, healTargetsFromMessage,
  applyHinderFromMessage, forceSpellOnMessage
};
