import { awardExperience } from "./experience.mjs";

const SCOPE = "dungeons-and-kittens";

/**
 * Rests and campaign milestones. Heart comes back 1 at lunch and 1 after a night's sleep (p.53),
 * which also clears the half-day cap on healing a comrade with a Smart test and ends a minor
 * Claw injury (p.60). A night's sleep resets spells cast that day (p.38) and counts down days of
 * incapacitation. Sessions and adventures award experience (p.42).
 */

/** Selected tokens' actors if any are controlled, otherwise every Kitten actor in the world. */
function resolveTargetActors() {
  const controlled = canvas?.tokens?.controlled?.map(t => t.actor).filter(Boolean) ?? [];
  if (controlled.length) return Array.from(new Set(controlled));
  return game.actors.filter(a => a.type === "kitten");
}

function requireGMTargets(actors) {
  if (!game.user.isGM) throw new Error(game.i18n.localize("DNK.GMOnly"));
  const targets = actors ?? resolveTargetActors();
  if (!targets.length) throw new Error(game.i18n.localize("DNK.NoPartyFound"));
  return targets;
}

async function clearStatus(actor, status) {
  if (actor.statuses?.has(status)) await actor.toggleStatusEffect(status, { active: false });
}

/** Per-actor rest shared by the party-wide GM macro and the sheet's Night's Rest button. */
async function applyRestToActor(actor, kind) {
  await actor.adjustResource("heart", 1);
  await actor.unsetFlag(SCOPE, "healedHalfDay");
  await clearStatus(actor, "dnk-injured");
  await clearStatus(actor, "dnk-claw-catfight");
  if (kind !== "night") return;

  for (const item of actor.items.filter(i => i.type === "spell" && i.getFlag(SCOPE, "usedToday"))) {
    await item.unsetFlag(SCOPE, "usedToday");
  }
  const days = actor.getFlag(SCOPE, "incapacitatedDays");
  if (days) {
    if (days <= 1) {
      await actor.unsetFlag(SCOPE, "incapacitatedDays");
      await clearStatus(actor, "dnk-incapacitated");
    } else {
      await actor.setFlag(SCOPE, "incapacitatedDays", days - 1);
    }
  }
}

/**
 * Apply a lunch or night's rest to the whole party - GM-only, since it can reach every Kitten.
 * @param {"lunch"|"night"} kind
 * @param {object} [options]
 * @param {Actor[]} [options.actors]  Explicit actor list, overriding the selected-tokens/whole-party default.
 */
export async function applyPartyRest(kind, { actors } = {}) {
  const targets = requireGMTargets(actors);
  for (const actor of targets) await applyRestToActor(actor, kind);
  ui.notifications.info(game.i18n.format(
    kind === "night" ? "DNK.NightRestApplied" : "DNK.LunchRestApplied",
    { count: targets.length }
  ));
  return targets.map(a => a.id);
}

/**
 * A single Kitten's night's rest - the sheet's own header button. Not GM-gated: it only touches
 * the actor whose sheet it's on, which the user can already edit.
 */
export async function applyNightRestToActor(actor) {
  await applyRestToActor(actor, "night");
  ui.notifications.info(game.i18n.format("DNK.NightRestApplied", { count: 1 }));
}

/** Grant Furr-endship to the party for a good evening with friends or a moving moment (p.54). */
export async function grantPartyFurrendship(amount = 1, { actors } = {}) {
  const targets = requireGMTargets(actors);
  for (const actor of targets) await actor.adjustResource("furrendship", amount);
  ui.notifications.info(game.i18n.format("DNK.FurrendshipGranted", { amount, count: targets.length }));
  return targets.map(a => a.id);
}

/** End of session: +1 experience each (p.42), and character traits can be used again (p.24). */
export async function endSession({ actors } = {}) {
  const targets = requireGMTargets(actors).filter(a => a.type === "kitten");
  await awardExperience(targets, 1);
  for (const actor of targets) {
    await actor.unsetFlag(SCOPE, "traitPositiveUsed");
    await actor.unsetFlag(SCOPE, "traitNegativeUsed");
  }
  ui.notifications.info(game.i18n.format("DNK.SessionEnded", { count: targets.length }));
  return targets.map(a => a.id);
}

/**
 * An adventure completed or a goal reached: +1 experience each (p.42). Completing an adventure
 * also ends injuries that last "until the end of the adventure" (p.60).
 */
export async function completeAdventure({ actors, endsAdventure = true } = {}) {
  const targets = requireGMTargets(actors).filter(a => a.type === "kitten");
  await awardExperience(targets, 1);
  if (endsAdventure) {
    for (const actor of targets) {
      await clearStatus(actor, "dnk-injured-major");
      await clearStatus(actor, "dnk-no-meowgic");
    }
  }
  ui.notifications.info(game.i18n.format(endsAdventure ? "DNK.AdventureCompleted" : "DNK.GoalReached", { count: targets.length }));
  return targets.map(a => a.id);
}
