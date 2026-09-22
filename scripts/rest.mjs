/**
 * Party-wide rest actions for the GM: the Quick Reference gives Heart back "1 at lunch, 1
 * after a night's sleep", and caps the ally-heals-1-Heart-via-a-successful-Smart-test option
 * at once per half-day per recipient (see healTargetsFromMessage in dice.mjs, which sets the
 * "healedHalfDay" flag this clears). A night's sleep is also when a recast spell resets to
 * free again (see spells.mjs).
 */

/** Selected tokens' actors if any are controlled, otherwise every Kitten actor in the world. */
function resolveTargetActors() {
  const controlled = canvas?.tokens?.controlled?.map(t => t.actor).filter(Boolean) ?? [];
  if (controlled.length) return Array.from(new Set(controlled));
  return game.actors.filter(a => a.type === "kitten");
}

/**
 * The actual per-actor adjustment shared by the party-wide GM macro and the single-actor sheet
 * button: +1 Heart and clear the half-day heal cooldown; a night's rest additionally resets
 * every spell's recast-used flag.
 */
async function applyRestToActor(actor, kind) {
  await actor.adjustResource("heart", 1);
  await actor.unsetFlag("dungeons-and-kittens", "healedHalfDay");
  if (kind === "night") {
    for (const item of actor.items.filter(i => i.type === "spell" && i.getFlag("dungeons-and-kittens", "usedToday"))) {
      await item.unsetFlag("dungeons-and-kittens", "usedToday");
    }
  }
}

/**
 * Apply a lunch or night's rest to the whole party at once - a GM-only action, since it can
 * reach every Kitten in the world regardless of who owns them.
 * @param {"lunch"|"night"} kind
 * @param {object} [options]
 * @param {Actor[]} [options.actors]  Explicit actor list, overriding the selected-tokens/whole-party default.
 */
export async function applyPartyRest(kind, { actors } = {}) {
  if (!game.user.isGM) throw new Error(game.i18n.localize("DNK.GMOnly"));
  const targets = actors ?? resolveTargetActors();
  if (!targets.length) throw new Error(game.i18n.localize("DNK.NoPartyFound"));

  for (const actor of targets) await applyRestToActor(actor, kind);

  ui.notifications.info(game.i18n.format(
    kind === "night" ? "DNK.NightRestApplied" : "DNK.LunchRestApplied",
    { count: targets.length }
  ));
  return targets.map(a => a.id);
}

/**
 * Apply a night's rest to a single Kitten - the sheet's own "Night's Rest" header button.
 * Unlike applyPartyRest this isn't GM-gated: it only ever touches the actor the button lives
 * on, and the sheet already only renders for someone with edit permission on that actor (the
 * player themselves, or the GM) - the same permission a player already has to move their own
 * Heart/Furr-endship sliders.
 */
export async function applyNightRestToActor(actor) {
  await applyRestToActor(actor, "night");
  ui.notifications.info(game.i18n.format("DNK.NightRestApplied", { count: 1 }));
}

/**
 * Grant Furr-endship to the whole party at once, for the "good evening with friends" /
 * "something genuinely moving" narrative triggers the Quick Reference calls for.
 * @param {number} [amount]
 * @param {object} [options]
 * @param {Actor[]} [options.actors]
 */
export async function grantPartyFurrendship(amount = 1, { actors } = {}) {
  if (!game.user.isGM) throw new Error(game.i18n.localize("DNK.GMOnly"));
  const targets = actors ?? resolveTargetActors();
  if (!targets.length) throw new Error(game.i18n.localize("DNK.NoPartyFound"));

  for (const actor of targets) await actor.adjustResource("furrendship", amount);

  ui.notifications.info(game.i18n.format("DNK.FurrendshipGranted", { amount, count: targets.length }));
  return targets.map(a => a.id);
}
