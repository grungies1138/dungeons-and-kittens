import { rollAbilityTest, spendFurrendshipOnMessage, rerollOnMessage, setBlockOnMessage, healTargetsFromMessage } from "./dice.mjs";
import { COMBAT_PRESETS, cedeInitiative } from "./sheets/actor-sheet.mjs";
import { castSpellForActor } from "./spells.mjs";

/**
 * Actor-id-based entry points mirroring the actor sheet's buttons, for callers that only have
 * an id to work with (the Companion API macros in macros.mjs, and through them the mobile app's
 * REST/relay bridge) rather than a live Actor reference from the current canvas/sheet.
 */

function requireActor(actorId) {
  const actor = game.actors.get(actorId);
  if (!actor) throw new Error(`Dungeons & Kittens API: no actor found for id "${actorId}"`);
  return actor;
}

/** Roll a raw ability test for an actor by id — mirrors the sheet's ability-score roll buttons. */
export async function rollAbilityTestForActor(actorId, { ability, flavor = "", advantage = 0, disadvantage = 0, difficulty = 0 } = {}) {
  const actor = requireActor(actorId);
  const message = await rollAbilityTest(actor, { ability, flavor, advantage, disadvantage, difficulty });
  return { messageId: message.id, roll: message.flags["dungeons-and-kittens"].roll };
}

/** Roll one of the sheet's catfight combat presets (fangAttack/clawAttack/defend/help/hinder/move/healAlly). */
export async function rollCombatActionForActor(actorId, presetKey, { advantage = 0, disadvantage = 0, difficulty = 0 } = {}) {
  const preset = COMBAT_PRESETS[presetKey];
  if (!preset) throw new Error(`Dungeons & Kittens API: unknown combat action "${presetKey}"`);
  const actor = requireActor(actorId);
  if (preset.aggressive) await cedeInitiative(actor);
  const message = await rollAbilityTest(actor, {
    ability: preset.ability,
    flavor: game.i18n.localize(preset.flavorKey),
    advantage, disadvantage, difficulty,
    isDefend: preset.isDefend, isHeal: preset.isHeal
  });
  return { messageId: message.id, roll: message.flags["dungeons-and-kittens"].roll };
}

/** Roll a spellbook item on an actor's sheet, applying the same free-first-cast/recast-cost rule as the sheet button. */
export async function rollSpellForActor(actorId, itemId, { advantage = 0, disadvantage = 0 } = {}) {
  const actor = requireActor(actorId);
  const item = actor.items.get(itemId);
  if (!item || item.type !== "spell") throw new Error(`Dungeons & Kittens API: no spell "${itemId}" on actor "${actorId}"`);
  const message = await castSpellForActor(actor, item, { advantage, disadvantage });
  return { messageId: message.id, roll: message.flags["dungeons-and-kittens"].roll };
}

/**
 * Adjust a clamped resource (heart or furrendship) by a delta.
 * Also how the app applies Heart damage — call with resource "heart" and a negative delta.
 */
export async function adjustActorResource(actorId, resource, delta) {
  const actor = requireActor(actorId);
  await actor.adjustResource(resource, Number(delta) || 0);
  return actor.system.resources[resource];
}

export { spendFurrendshipOnMessage, rerollOnMessage, setBlockOnMessage, healTargetsFromMessage };
