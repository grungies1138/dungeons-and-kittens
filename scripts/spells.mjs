import { rollAbilityTest } from "./dice.mjs";
import { openRollDialog } from "./apps/roll-dialog.mjs";

/**
 * Casting (p.38): the first cast of a spell each day is free. Whether it succeeds or fails, the
 * spell is then spent until a good night's rest; recasting it sooner costs 1 Heart (the item's
 * recastCost). A failed cast can be forced through on the Meowgic accident table from the chat card.
 */
function resolveCost(item) {
  const usedToday = item.getFlag("dungeons-and-kittens", "usedToday") ?? false;
  const cost = usedToday ? (Number(item.system.recastCost) || 0) : 0;
  return { usedToday, cost };
}

function checkCastable(actor, cost) {
  if (actor.statuses?.has("dnk-no-meowgic")) throw new Error(game.i18n.localize("DNK.NoMeowgicAllowed"));
  if (cost <= 0) return;
  const heart = actor.system.resources?.heart?.value ?? 0;
  if (cost > heart) throw new Error(game.i18n.format("DNK.NotEnoughHeartToRecast", { cost }));
}

async function finalizeSpellCast(actor, item, { usedToday, cost }) {
  if (cost > 0) await actor.adjustResource("heart", -cost);
  if (!usedToday) await item.setFlag("dungeons-and-kittens", "usedToday", true);
}

function castFlavor(item, cost) {
  return cost > 0 ? game.i18n.format("DNK.RecastFlavor", { name: item.name, cost }) : item.name;
}

/**
 * Cast through the roll dialog so advantage/disadvantage can still be set. The cost is only
 * charged, and the spell only marked as used, once the player actually confirms a roll.
 */
export async function castSpell(actor, item, { fastForward = false } = {}) {
  const { usedToday, cost } = resolveCost(item);
  checkCastable(actor, cost);

  const message = await openRollDialog(actor, {
    ability: item.system.ability,
    flavor: castFlavor(item, cost),
    difficulty: item.system.successes,
    spellId: item.id,
    lockAbility: true,
    fastForward
  });
  if (!message) return null;

  await finalizeSpellCast(actor, item, { usedToday, cost });
  return message;
}

/** Cast without a dialog - for the Companion API, which supplies its own advantage/disadvantage. */
export async function castSpellForActor(actor, item, { advantage = 0, disadvantage = 0 } = {}) {
  const { usedToday, cost } = resolveCost(item);
  checkCastable(actor, cost);

  const message = await rollAbilityTest(actor, {
    ability: item.system.ability,
    flavor: castFlavor(item, cost),
    difficulty: item.system.successes,
    advantage, disadvantage,
    spellId: item.id
  });

  await finalizeSpellCast(actor, item, { usedToday, cost });
  return message;
}
