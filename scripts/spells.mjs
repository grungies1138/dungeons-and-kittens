import { rollAbilityTest } from "./dice.mjs";
import { openRollDialog } from "./apps/roll-dialog.mjs";

/**
 * The first cast of a given spell "today" is free; casting the same spell again before the
 * recast flag is cleared (see rest.mjs's night's-rest action) costs the item's recastCost in
 * Heart - matching the item sheet's own tooltip on that field.
 */
function resolveCost(item) {
  const usedToday = item.getFlag("dungeons-and-kittens", "usedToday") ?? false;
  const cost = usedToday ? (Number(item.system.recastCost) || 0) : 0;
  return { usedToday, cost };
}

function checkAffordable(actor, cost) {
  if (cost <= 0) return;
  const heart = actor.system.resources?.heart?.value ?? 0;
  if (cost > heart) throw new Error(game.i18n.format("DNK.NotEnoughHeartToRecast", { cost }));
}

async function finalizeSpellCast(actor, item, { usedToday, cost }) {
  if (cost > 0) await actor.adjustResource("heart", -cost);
  if (!usedToday) await item.setFlag("dungeons-and-kittens", "usedToday", true);
}

/**
 * Cast a Spellbook item through the normal roll dialog, so advantage/disadvantage can still
 * be set interactively. The cost is only charged, and the "used today" flag only set, once
 * the player actually confirms a roll (not on a cancelled dialog). Used by the sheet's own
 * spell-roll button.
 */
export async function castSpell(actor, item) {
  const { usedToday, cost } = resolveCost(item);
  checkAffordable(actor, cost);

  const flavor = cost > 0 ? game.i18n.format("DNK.RecastFlavor", { name: item.name, cost }) : item.name;
  const message = await openRollDialog(actor, { ability: item.system.ability, flavor, difficulty: item.system.successes });
  if (!message) return null;

  await finalizeSpellCast(actor, item, { usedToday, cost });
  return message;
}

/**
 * Cast a Spellbook item without a dialog - for the Companion API, which supplies its own
 * advantage/disadvantage and can't depend on a GM/player interacting with a Foundry Dialog.
 */
export async function castSpellForActor(actor, item, { advantage = 0, disadvantage = 0 } = {}) {
  const { usedToday, cost } = resolveCost(item);
  checkAffordable(actor, cost);

  const flavor = cost > 0 ? game.i18n.format("DNK.RecastFlavor", { name: item.name, cost }) : item.name;
  const message = await rollAbilityTest(actor, {
    ability: item.system.ability, flavor, difficulty: item.system.successes, advantage, disadvantage
  });

  await finalizeSpellCast(actor, item, { usedToday, cost });
  return message;
}
