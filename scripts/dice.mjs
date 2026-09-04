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
export async function rollAbilityTest(actor, { ability, flavor = "", advantage = 0, disadvantage = 0, difficulty = 0 } = {}) {
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
    rerolled: false
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

  return renderTemplate("systems/dungeons-and-kittens/templates/chat/roll-card.html", {
    actorName: actor.name,
    abilityLabel: game.i18n.localize(`DNK.Ability${rollData.ability.charAt(0).toUpperCase()}${rollData.ability.slice(1)}`),
    flavor,
    results: rollData.results,
    abilityValue: rollData.abilityValue,
    successes,
    triple,
    difficultyLabel,
    passed,
    canSpendFurrendship: (actor.system.resources?.furrendship?.value ?? 0) > 0 && rollData.furrendshipSpent < 4,
    canReroll: !rollData.rerolled && rollData.results.some(r => r > rollData.abilityValue),
    isGM: game.user.isGM
  });
}

/** Re-render a roll card in place after a button interaction (spend Furr-endship / reroll). */
async function refreshChatCard(message, actor, rollData) {
  const flavor = message.flags?.["dungeons-and-kittens"]?.flavor ?? "";
  const content = await renderRollCard(actor, rollData, flavor);
  await message.update({ content, "flags.dungeons-and-kittens.roll": rollData });
}

export function activateChatListeners(html) {
  html.on("click", ".dnk-spend-furrendship", onSpendFurrendship);
  html.on("click", ".dnk-reroll", onReroll);
  html.on("click", ".dnk-apply-damage", onApplyDamage);
}

async function getMessageAndRoll(event) {
  const li = event.currentTarget.closest(".chat-message");
  const message = game.messages.get(li?.dataset.messageId);
  const rollData = message?.flags?.["dungeons-and-kittens"]?.roll;
  if (!message || !rollData) return {};
  const actor = game.actors.get(rollData.actorId);
  return { message, rollData, actor };
}

async function onSpendFurrendship(event) {
  event.preventDefault();
  const { message, rollData, actor } = await getMessageAndRoll(event);
  if (!actor) return;
  const points = actor.system.resources?.furrendship?.value ?? 0;
  if (points <= 0) return ui.notifications.warn(game.i18n.localize("DNK.NoFurrendship"));
  if (rollData.furrendshipSpent >= 4) return ui.notifications.warn(game.i18n.localize("DNK.MaxFurrendshipReached"));

  await actor.adjustResource("furrendship", -1);
  rollData.furrendshipSpent += 1;
  await refreshChatCard(message, actor, rollData);
}

async function onReroll(event) {
  event.preventDefault();
  const { message, rollData, actor } = await getMessageAndRoll(event);
  if (!actor) return;

  const idx = rollData.results.findIndex(r => r > rollData.abilityValue);
  if (idx === -1) return ui.notifications.warn(game.i18n.localize("DNK.NoFailingDie"));

  const roll = new Roll("1d6");
  await roll.evaluate();
  rollData.results[idx] = roll.terms[0].results[0].result;
  rollData.rerolled = true;

  await refreshChatCard(message, actor, rollData);
}

async function onApplyDamage(event) {
  event.preventDefault();
  const amount = Number(event.currentTarget.dataset.amount) || 0;
  const targets = Array.from(game.user.targets);
  if (!targets.length) return ui.notifications.warn(game.i18n.localize("DNK.NoTarget"));
  for (const token of targets) {
    const targetActor = token.actor;
    if (targetActor) await targetActor.adjustResource("heart", -amount);
  }
}
