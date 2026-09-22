const DIFFICULTIES = {
  0: null,
  1: "DNK.DifficultyEasy",
  2: "DNK.DifficultyMedium",
  3: "DNK.DifficultyDifficult",
  4: "DNK.DifficultyLegendary"
};

/** Number of d6 to roll given net advantage/disadvantage, per the Quick Reference:
 *  ties cancel to 3d6, net advantage rolls 4d6, net disadvantage rolls 2d6 - never more, never less. */
function diceCountFor(advantage, disadvantage) {
  if (advantage > disadvantage) return 4;
  if (disadvantage > advantage) return 2;
  return 3;
}

function hasTriple(results) {
  const counts = {};
  for (const r of results) counts[r] = (counts[r] ?? 0) + 1;
  return Object.values(counts).some(c => c >= 3);
}

function countSuccesses(results, abilityValue) {
  return results.filter(r => r <= abilityValue).length;
}

/**
 * Roll an ability test for an actor and post an interactive chat card.
 * @param {Actor} actor
 * @param {object} options
 * @param {"strong"|"smart"|"cute"} options.ability
 * @param {string} [options.flavor]      Label shown on the card, e.g. a spell or catfight action name.
 * @param {number} [options.advantage]   Count of advantage sources.
 * @param {number} [options.disadvantage] Count of disadvantage sources.
 * @param {number} [options.difficulty]  Successes required (0 = none), 1-4.
 */
export async function rollAbilityTest(actor, { ability, flavor = "", advantage = 0, disadvantage = 0, difficulty = 0, isDefend = false, isHeal = false } = {}) {
  const abilityValue = Number(actor.system.abilities?.[ability]?.value ?? 0);
  const diceCount = diceCountFor(advantage, disadvantage);

  const roll = new Roll(`${diceCount}d6`);
  await roll.evaluate();
  const results = roll.terms[0].results.map(r => r.result);

  const rollData = {
    actorId: actor.id,
    tokenId: actor.token?.id ?? actor.getActiveTokens()[0]?.id ?? null,
    sceneId: actor.token?.parent?.id ?? canvas?.scene?.id ?? null,
    ability,
    abilityValue,
    results,
    difficulty: Number(difficulty) || 0,
    furrendshipSpent: 0,
    rerolled: false,
    isDefend: !!isDefend,
    isHeal: !!isHeal
  };

  const content = await renderRollCard(actor, rollData, flavor);

  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    rolls: [roll],
    flags: { "dungeons-and-kittens": { roll: rollData, flavor } }
  });
}

async function renderRollCard(actor, rollData, flavor) {
  const successes = countSuccesses(rollData.results, rollData.abilityValue) + rollData.furrendshipSpent;
  const triple = hasTriple(rollData.results);
  const difficultyLabel = rollData.difficulty ? game.i18n.localize(DIFFICULTIES[rollData.difficulty]) : null;
  const passed = rollData.difficulty ? successes >= rollData.difficulty : null;
  const hasPurrecious = actor.items.some(i => i.type === "gear" && i.system.purrecious);

  return renderTemplate("systems/dungeons-and-kittens/templates/chat/roll-card.html", {
    actorName: actor.name,
    actorImg: actor.img,
    abilityLabel: game.i18n.localize(`DNK.Ability${rollData.ability.charAt(0).toUpperCase()}${rollData.ability.slice(1)}`),
    flavor,
    results: rollData.results,
    abilityValue: rollData.abilityValue,
    successes,
    triple,
    difficultyLabel,
    passed,
    canSpendFurrendship: (actor.system.resources?.furrendship?.value ?? 0) > 0 && rollData.furrendshipSpent < 4,
    canReroll: !rollData.rerolled && hasPurrecious && rollData.results.some(r => r > rollData.abilityValue),
    canSetBlock: rollData.isDefend && successes > 0,
    canHealTarget: rollData.isHeal && successes > 0,
    isGM: game.user.isGM
  });
}

/** Re-render a roll card in place after a button interaction (spend Furr-endship / reroll). */
async function refreshChatCard(message, actor, rollData) {
  const flavor = message.flags?.["dungeons-and-kittens"]?.flavor ?? "";
  const content = await renderRollCard(actor, rollData, flavor);
  await message.update({ content, "flags.dungeons-and-kittens.roll": rollData });
}

/**
 * dnk.mjs calls this from both "renderChatMessageHTML" (v13+) and the legacy "renderChatMessage"
 * hook, both of which fire on current Foundry versions for the same message element - without
 * this guard, every listener below gets bound twice, so a single click on e.g. "Apply Heart
 * damage" silently applies it twice. Dedupe by marking the element the first time it's bound.
 */
export function activateChatListeners(html) {
  const el = html[0];
  if (el?.dataset?.dnkListenersBound) return;
  if (el?.dataset) el.dataset.dnkListenersBound = "1";

  html.on("click", ".dnk-spend-furrendship", onSpendFurrendship);
  html.on("click", ".dnk-reroll", onReroll);
  html.on("click", ".dnk-apply-damage", onApplyDamage);
  html.on("click", ".dnk-set-block", onSetBlock);
  html.on("click", ".dnk-heal-target", onHealTarget);
}

async function getMessageAndRoll(event) {
  const li = event.currentTarget.closest(".chat-message");
  const message = game.messages.get(li?.dataset.messageId);
  const rollData = message?.flags?.["dungeons-and-kittens"]?.roll;
  if (!message || !rollData) return {};
  const actor = game.actors.get(rollData.actorId);
  return { message, rollData, actor };
}

/**
 * Spend 1 Furr-endship on a roll's chat card for an automatic extra success.
 * Shared by the chat-card button and the Companion API (see api.mjs) so both paths
 * stay in sync. Throws a localized error message on failure instead of warning directly,
 * so callers (DOM handler or macro) can decide how to surface it.
 */
export async function spendFurrendshipOnMessage(messageId) {
  const message = game.messages.get(messageId);
  const rollData = message?.flags?.["dungeons-and-kittens"]?.roll;
  const actor = rollData && game.actors.get(rollData.actorId);
  if (!message || !rollData || !actor) throw new Error(game.i18n.localize("DNK.InvalidRollMessage"));

  const points = actor.system.resources?.furrendship?.value ?? 0;
  if (points <= 0) throw new Error(game.i18n.localize("DNK.NoFurrendship"));
  if (rollData.furrendshipSpent >= 4) throw new Error(game.i18n.localize("DNK.MaxFurrendshipReached"));

  await actor.adjustResource("furrendship", -1);
  rollData.furrendshipSpent += 1;
  await refreshChatCard(message, actor, rollData);
  return rollData;
}

/** Reroll one failing die on a roll's chat card. Shared by the chat-card button and the Companion API. */
export async function rerollOnMessage(messageId) {
  const message = game.messages.get(messageId);
  const rollData = message?.flags?.["dungeons-and-kittens"]?.roll;
  const actor = rollData && game.actors.get(rollData.actorId);
  if (!message || !rollData || !actor) throw new Error(game.i18n.localize("DNK.InvalidRollMessage"));

  if (!actor.items.some(i => i.type === "gear" && i.system.purrecious)) {
    throw new Error(game.i18n.localize("DNK.NoPurrecious"));
  }

  const idx = rollData.results.findIndex(r => r > rollData.abilityValue);
  if (idx === -1) throw new Error(game.i18n.localize("DNK.NoFailingDie"));

  const roll = new Roll("1d6");
  await roll.evaluate();
  rollData.results[idx] = roll.terms[0].results[0].result;
  rollData.rerolled = true;

  await refreshChatCard(message, actor, rollData);
  return rollData;
}

async function onSpendFurrendship(event) {
  event.preventDefault();
  const { message } = await getMessageAndRoll(event);
  if (!message) return;
  try {
    await spendFurrendshipOnMessage(message.id);
  } catch (err) {
    ui.notifications.warn(err.message);
  }
}

async function onReroll(event) {
  event.preventDefault();
  const { message } = await getMessageAndRoll(event);
  if (!message) return;
  try {
    await rerollOnMessage(message.id);
  } catch (err) {
    ui.notifications.warn(err.message);
  }
}

async function onApplyDamage(event) {
  event.preventDefault();
  const amount = Number(event.currentTarget.dataset.amount) || 0;
  const targets = Array.from(game.user.targets);
  if (!targets.length) return ui.notifications.warn(game.i18n.localize("DNK.NoTarget"));
  for (const token of targets) {
    const targetActor = token.actor;
    if (!targetActor) continue;
    const block = Number(targetActor.getFlag("dungeons-and-kittens", "block")) || 0;
    const finalAmount = Math.max(0, amount - block);
    if (block > 0) {
      await targetActor.unsetFlag("dungeons-and-kittens", "block");
      ui.notifications.info(game.i18n.format("DNK.BlockAbsorbed", { name: targetActor.name, block, remaining: finalAmount }));
    }
    if (finalAmount > 0) await targetActor.adjustResource("heart", -finalAmount);
  }
}

/** Lock in a Defend roll's current successes as a Block that cancels that much of the next hit against this actor. */
export async function setBlockOnMessage(messageId) {
  const message = game.messages.get(messageId);
  const rollData = message?.flags?.["dungeons-and-kittens"]?.roll;
  const actor = rollData && game.actors.get(rollData.actorId);
  if (!message || !rollData || !actor) throw new Error(game.i18n.localize("DNK.InvalidRollMessage"));

  const successes = countSuccesses(rollData.results, rollData.abilityValue) + rollData.furrendshipSpent;
  if (successes <= 0) throw new Error(game.i18n.localize("DNK.NoBlockSuccesses"));

  await actor.setFlag("dungeons-and-kittens", "block", successes);
  ui.notifications.info(game.i18n.format("DNK.BlockSet", { name: actor.name, amount: successes }));
  return successes;
}

/**
 * Heal 1 Heart on each currently targeted token, from a successful Heal Ally (Smart) roll.
 * Enforces "once per half-day" per recipient (see rest.mjs for how that cooldown clears).
 */
export async function healTargetsFromMessage(messageId) {
  const message = game.messages.get(messageId);
  const rollData = message?.flags?.["dungeons-and-kittens"]?.roll;
  if (!message || !rollData) throw new Error(game.i18n.localize("DNK.InvalidRollMessage"));

  const targets = Array.from(game.user.targets);
  if (!targets.length) throw new Error(game.i18n.localize("DNK.NoTarget"));

  const healed = [];
  const skipped = [];
  for (const token of targets) {
    const targetActor = token.actor;
    if (!targetActor) continue;
    if (targetActor.getFlag("dungeons-and-kittens", "healedHalfDay")) {
      skipped.push(targetActor.name);
      continue;
    }
    await targetActor.adjustResource("heart", 1);
    await targetActor.setFlag("dungeons-and-kittens", "healedHalfDay", true);
    healed.push(targetActor.name);
  }

  if (healed.length) ui.notifications.info(game.i18n.format("DNK.HealedTargets", { names: healed.join(", ") }));
  if (skipped.length) ui.notifications.warn(game.i18n.format("DNK.AlreadyHealedHalfDay", { names: skipped.join(", ") }));
  return { healed, skipped };
}

async function onSetBlock(event) {
  event.preventDefault();
  const { message } = await getMessageAndRoll(event);
  if (!message) return;
  try {
    await setBlockOnMessage(message.id);
  } catch (err) {
    ui.notifications.warn(err.message);
  }
}

async function onHealTarget(event) {
  event.preventDefault();
  const { message } = await getMessageAndRoll(event);
  if (!message) return;
  try {
    await healTargetsFromMessage(message.id);
  } catch (err) {
    ui.notifications.warn(err.message);
  }
}
