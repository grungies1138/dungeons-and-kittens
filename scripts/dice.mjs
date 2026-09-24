import { MEOWGIC_ACCIDENTS } from "./content.mjs";

const SCOPE = "dungeons-and-kittens";

const DIFFICULTIES = {
  0: null,
  1: "DNK.DifficultyEasy",
  2: "DNK.DifficultyMedium",
  3: "DNK.DifficultyDifficult",
  4: "DNK.DifficultyLegendary"
};

/** Ties cancel to 3d6, net advantage rolls 4d6, net disadvantage rolls 2d6 - never more, never less (p.46). */
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

export function totalSuccesses(rollData) {
  return countSuccesses(rollData.results, rollData.abilityValue) + rollData.furrendshipSpent;
}

/**
 * Success and failure (p.49): meeting the difficulty is a clean success; falling short with at
 * least one success lets the player choose between failing cleanly or succeeding with
 * complications; no successes at all is a total failure.
 */
export function outcomeOf(rollData) {
  const successes = totalSuccesses(rollData);
  if (successes === 0) return "failure";
  if (!rollData.difficulty) return null;
  return successes >= rollData.difficulty ? "success" : "partial";
}

function rerollsOf(rollData) {
  return rollData.rerolls ?? { item: rollData.rerolled ? 1 : 0, cattribute: 0, idea: 0 };
}

function purreciousCount(actor) {
  return actor.items.filter(i => i.type === "gear" && i.system.purrecious).length;
}

/** Kittens re-roll from their Cattribute (p.47); Extras from their description when it fits (p.65). */
function hasCattributeSource(actor) {
  if (actor.type === "kitten") return !!actor.system.details?.cattribute?.name;
  return !!actor.system.details?.role;
}

/**
 * Roll an ability test for an actor and post an interactive chat card.
 * @param {Actor} actor
 * @param {object} options
 * @param {"strong"|"smart"|"cute"} options.ability
 * @param {string} [options.flavor]       Label shown on the card, e.g. a spell or catfight action name.
 * @param {number} [options.advantage]    Count of advantage sources.
 * @param {number} [options.disadvantage] Count of disadvantage sources.
 * @param {number} [options.difficulty]   Successes required (0 = open action), 1-4.
 * @param {string} [options.spellId]      Set when this roll casts a Spellbook item.
 */
export async function rollAbilityTest(actor, {
  ability, flavor = "", advantage = 0, disadvantage = 0, difficulty = 0,
  isDefend = false, isHeal = false, isHinder = false, spellId = null
} = {}) {
  const abilityValue = Number(actor.system.abilities?.[ability]?.value ?? 0);
  const roll = new Roll(`${diceCountFor(advantage, disadvantage)}d6`);
  await roll.evaluate();

  const rollData = {
    actorId: actor.id,
    tokenId: actor.token?.id ?? actor.getActiveTokens()[0]?.id ?? null,
    sceneId: actor.token?.parent?.id ?? canvas?.scene?.id ?? null,
    ability,
    abilityValue,
    results: roll.terms[0].results.map(r => r.result),
    difficulty: Number(difficulty) || 0,
    furrendshipSpent: 0,
    rerolls: { item: 0, cattribute: 0, idea: 0 },
    isDefend: !!isDefend,
    isHeal: !!isHeal,
    isHinder: !!isHinder,
    spellId,
    accident: null
  };

  const content = await renderRollCard(actor, rollData, flavor);
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    rolls: [roll],
    flags: { [SCOPE]: { roll: rollData, flavor } }
  });
}

async function renderRollCard(actor, rollData, flavor) {
  const successes = totalSuccesses(rollData);
  const outcome = outcomeOf(rollData);
  const rerolls = rerollsOf(rollData);
  const hasFailingDie = rollData.results.some(r => r > rollData.abilityValue);
  const spell = rollData.spellId ? actor.items.get(rollData.spellId) : null;

  return renderTemplate("systems/dungeons-and-kittens/templates/chat/roll-card.html", {
    actorName: actor.name,
    actorImg: actor.img,
    abilityLabel: game.i18n.localize(`DNK.Ability${rollData.ability.charAt(0).toUpperCase()}${rollData.ability.slice(1)}`),
    flavor,
    results: rollData.results,
    abilityValue: rollData.abilityValue,
    successes,
    triple: hasTriple(rollData.results),
    difficultyLabel: rollData.difficulty ? game.i18n.localize(DIFFICULTIES[rollData.difficulty]) : null,
    outcome,
    outcomeLabel: outcome ? game.i18n.localize(`DNK.Outcome.${outcome}`) : null,
    outcomeHint: outcome ? game.i18n.localize(`DNK.OutcomeHint.${outcome}`) : null,
    accident: rollData.accident,
    canSpendFurrendship: (actor.system.resources?.furrendship?.value ?? 0) > 0 && rollData.furrendshipSpent < 4,
    canRerollItem: hasFailingDie && rerolls.item < purreciousCount(actor),
    canRerollCattribute: hasFailingDie && rerolls.cattribute < 1 && hasCattributeSource(actor),
    canRerollIdea: hasFailingDie && game.user.isGM,
    cattributeLabel: actor.type === "kitten" ? game.i18n.localize("DNK.RerollCattribute") : game.i18n.localize("DNK.RerollDescription"),
    canSetBlock: rollData.isDefend && successes > 0,
    canHealTarget: rollData.isHeal && successes > 0,
    canApplyHinder: rollData.isHinder && successes > 0,
    canForceSpell: !!spell && outcome !== "success" && !rollData.accident,
    isGM: game.user.isGM
  });
}

/** Re-render a roll card in place after a button interaction. */
async function refreshChatCard(message, actor, rollData) {
  const flavor = message.flags?.[SCOPE]?.flavor ?? "";
  const content = await renderRollCard(actor, rollData, flavor);
  await message.update({ content, [`flags.${SCOPE}.roll`]: rollData });
}

function loadMessage(messageId) {
  const message = game.messages.get(messageId);
  const rollData = message?.flags?.[SCOPE]?.roll;
  const actor = rollData && game.actors.get(rollData.actorId);
  if (!message || !rollData || !actor) throw new Error(game.i18n.localize("DNK.InvalidRollMessage"));
  return { message, rollData, actor };
}

/**
 * dnk.mjs calls this from both "renderChatMessageHTML" (v13+) and the legacy "renderChatMessage"
 * hook, both of which fire on current Foundry versions for the same message element - without
 * this guard, every listener below gets bound twice, so a single click silently applies twice.
 */
export function activateChatListeners(html) {
  const el = html[0];
  if (el?.dataset?.dnkListenersBound) return;
  if (el?.dataset) el.dataset.dnkListenersBound = "1";

  html.on("click", ".dnk-dice-row .die", onSelectDie);
  html.on("click", ".dnk-spend-furrendship", ev => runAction(ev, spendFurrendshipOnMessage));
  html.on("click", ".dnk-reroll", ev => runAction(ev, (id, btn) => rerollOnMessage(id, btn.dataset.source, selectedDieIndex(btn))));
  html.on("click", ".dnk-apply-damage", onApplyDamage);
  html.on("click", ".dnk-set-block", ev => runAction(ev, setBlockOnMessage));
  html.on("click", ".dnk-heal-target", ev => runAction(ev, healTargetsFromMessage));
  html.on("click", ".dnk-apply-hinder", ev => runAction(ev, applyHinderFromMessage));
  html.on("click", ".dnk-force-spell", ev => runAction(ev, forceSpellOnMessage));
}

/** Wraps a chat-card button: resolve its message id, run the shared action, surface errors. */
async function runAction(event, fn) {
  event.preventDefault();
  const button = event.currentTarget;
  const messageId = button.closest(".chat-message")?.dataset.messageId;
  if (!messageId) return;
  try {
    await fn(messageId, button);
  } catch (err) {
    ui.notifications.warn(err.message);
  }
}

/** Clicking a die marks it as the one to re-roll ("re-roll dice of her choice", p.47). */
function onSelectDie(event) {
  const die = event.currentTarget;
  const row = die.closest(".dnk-dice-row");
  const wasSelected = die.classList.contains("selected");
  row.querySelectorAll(".die").forEach(d => d.classList.remove("selected"));
  if (!wasSelected) die.classList.add("selected");
}

function selectedDieIndex(button) {
  const selected = button.closest(".dnk-chat-card")?.querySelector(".dnk-dice-row .die.selected");
  return selected ? Number(selected.dataset.index) : null;
}

/** Spend 1 Furr-endship on a roll for an automatic extra success, max 4 per test (p.54). */
export async function spendFurrendshipOnMessage(messageId) {
  const { message, rollData, actor } = loadMessage(messageId);
  if ((actor.system.resources?.furrendship?.value ?? 0) <= 0) throw new Error(game.i18n.localize("DNK.NoFurrendship"));
  if (rollData.furrendshipSpent >= 4) throw new Error(game.i18n.localize("DNK.MaxFurrendshipReached"));

  await actor.adjustResource("furrendship", -1);
  rollData.furrendshipSpent += 1;
  await refreshChatCard(message, actor, rollData);
  return rollData;
}

/**
 * Re-roll one die (p.47). Each relevant Purr-ecious item, the Cattribute, and the Storyteller
 * rewarding a good idea are separate sources, so one throw can get several re-rolls.
 * @param {"item"|"cattribute"|"idea"} source
 * @param {number|null} dieIndex  The die the player picked; defaults to the first failing die.
 */
export async function rerollOnMessage(messageId, source = "item", dieIndex = null) {
  const { message, rollData, actor } = loadMessage(messageId);
  const rerolls = rerollsOf(rollData);

  if (source === "item" && rerolls.item >= purreciousCount(actor)) throw new Error(game.i18n.localize("DNK.NoPurrecious"));
  if (source === "cattribute" && (rerolls.cattribute >= 1 || !hasCattributeSource(actor))) throw new Error(game.i18n.localize("DNK.CattributeUsed"));
  if (source === "idea" && !game.user.isGM) throw new Error(game.i18n.localize("DNK.GMOnly"));

  let idx = Number.isInteger(dieIndex) && dieIndex >= 0 && dieIndex < rollData.results.length ? dieIndex : -1;
  if (idx === -1) idx = rollData.results.findIndex(r => r > rollData.abilityValue);
  if (idx === -1) throw new Error(game.i18n.localize("DNK.NoFailingDie"));

  const roll = new Roll("1d6");
  await roll.evaluate();
  rollData.results[idx] = roll.terms[0].results[0].result;
  rerolls[source] = (rerolls[source] ?? 0) + 1;
  rollData.rerolls = rerolls;
  delete rollData.rerolled;

  await refreshChatCard(message, actor, rollData);
  return rollData;
}

/**
 * Force a failed spell to work anyway by rolling on the Meowgic accident table (p.38). The
 * spell is spent either way; a 2 lets it be recast for free, a 4 costs the caster 1 Heart.
 */
export async function forceSpellOnMessage(messageId) {
  const { message, rollData, actor } = loadMessage(messageId);
  const spell = rollData.spellId ? actor.items.get(rollData.spellId) : null;
  if (!spell) throw new Error(game.i18n.localize("DNK.InvalidRollMessage"));
  if (rollData.accident) throw new Error(game.i18n.localize("DNK.AccidentAlreadyRolled"));

  const roll = new Roll("1d6");
  await roll.evaluate();
  const entry = MEOWGIC_ACCIDENTS[roll.total - 1];
  rollData.accident = { roll: roll.total, effect: entry.effect, text: entry.text };

  if (entry.effect === "freeRecast") await spell.unsetFlag(SCOPE, "usedToday");
  if (entry.effect === "loseHeart") await actor.adjustResource("heart", -1);

  await refreshChatCard(message, actor, rollData);
  return rollData.accident;
}

/** Tokens targeted by the current user, or a localized error if there are none. */
function requireTargets() {
  const targets = Array.from(game.user.targets);
  if (!targets.length) throw new Error(game.i18n.localize("DNK.NoTarget"));
  return targets;
}

/** Hinder (p.58): at least one success gives the targeted opponent a disadvantage. */
export async function applyHinderFromMessage(messageId) {
  loadMessage(messageId);
  const names = [];
  for (const token of requireTargets()) {
    if (!token.actor) continue;
    await token.actor.toggleStatusEffect("dnk-disadvantage", { active: true });
    names.push(token.actor.name);
  }
  ui.notifications.info(game.i18n.format("DNK.HinderApplied", { names: names.join(", ") }));
  return names;
}

/* -------------------------------------------- */
/*  Defend (p.59)                               */
/* -------------------------------------------- */

/**
 * A Defend's successes cancel opponent successes on any attack that turn - against the defender
 * or their comrades. In a combat the pool lasts for the current round; outside one, until used.
 */
function activeBlock(actor) {
  const block = actor?.getFlag(SCOPE, "block");
  if (!block || typeof block !== "object" || !(block.amount > 0)) return null;
  if (block.combatId) {
    const combat = game.combat;
    if (!combat || combat.id !== block.combatId || combat.round !== block.round) return null;
  }
  return block;
}

export async function setBlockOnMessage(messageId) {
  const { rollData, actor } = loadMessage(messageId);
  const successes = totalSuccesses(rollData);
  if (successes <= 0) throw new Error(game.i18n.localize("DNK.NoBlockSuccesses"));

  const combat = game.combat;
  const inCombat = combat?.combatants.some(c => c.actor?.id === actor.id);
  await actor.setFlag(SCOPE, "block", {
    amount: successes,
    combatId: inCombat ? combat.id : null,
    round: inCombat ? combat.round : null
  });
  ui.notifications.info(game.i18n.format("DNK.BlockSet", { name: actor.name, amount: successes }));
  return successes;
}

/** The target first, then allies on the same side of the scene who have a live Defend pool. */
function defendersFor(targetToken) {
  const defenders = [targetToken.actor];
  const disposition = targetToken.document?.disposition;
  for (const token of canvas?.tokens?.placeables ?? []) {
    if (token === targetToken || !token.actor || token.document.disposition !== disposition) continue;
    if (activeBlock(token.actor) && !defenders.includes(token.actor)) defenders.push(token.actor);
  }
  return defenders;
}

/** Apply an attack's successes as Heart damage to each target, after any Defend pools absorb some. */
export async function applyDamageToTargets(amount, targets = requireTargets()) {
  for (const token of targets) {
    const target = token.actor;
    if (!target) continue;
    let remaining = amount;
    let absorbed = 0;
    for (const defender of defendersFor(token)) {
      const block = activeBlock(defender);
      if (!block || remaining <= 0) continue;
      const used = Math.min(block.amount, remaining);
      remaining -= used;
      absorbed += used;
      if (block.amount - used > 0) await defender.setFlag(SCOPE, "block", { ...block, amount: block.amount - used });
      else await defender.unsetFlag(SCOPE, "block");
    }
    if (absorbed > 0) {
      ui.notifications.info(game.i18n.format("DNK.BlockAbsorbed", { name: target.name, block: absorbed, remaining }));
    }
    if (remaining > 0) await target.adjustResource("heart", -remaining);
  }
}

async function onApplyDamage(event) {
  event.preventDefault();
  try {
    await applyDamageToTargets(Number(event.currentTarget.dataset.amount) || 0);
  } catch (err) {
    ui.notifications.warn(err.message);
  }
}

/**
 * Heal 1 Heart on each targeted token from a successful Smart test (p.53), once per half-day
 * per recipient (see rest.mjs for how that cooldown clears).
 */
export async function healTargetsFromMessage(messageId) {
  loadMessage(messageId);
  const healed = [];
  const skipped = [];
  for (const token of requireTargets()) {
    const target = token.actor;
    if (!target) continue;
    if (target.getFlag(SCOPE, "healedHalfDay")) {
      skipped.push(target.name);
      continue;
    }
    await target.adjustResource("heart", 1);
    await target.setFlag(SCOPE, "healedHalfDay", true);
    healed.push(target.name);
  }
  if (healed.length) ui.notifications.info(game.i18n.format("DNK.HealedTargets", { names: healed.join(", ") }));
  if (skipped.length) ui.notifications.warn(game.i18n.format("DNK.AlreadyHealedHalfDay", { names: skipped.join(", ") }));
  return { healed, skipped };
}
