import { rollAbilityTest } from "../dice.mjs";
import { ABILITY_KEYS } from "../content.mjs";
import { consumeOneShots } from "../catfight.mjs";
import { rules } from "../rules-level.mjs";

/** Statuses that impose a disadvantage on every roll: the Disadvantage toggle and Claw injuries (p.60). */
const DISADVANTAGE_STATUSES = ["dnk-disadvantage", "dnk-injured", "dnk-injured-major"];
/** Statuses under which the character can't act at all (0 Heart, p.53; serious injuries, p.60). */
const CANNOT_ACT_STATUSES = ["dnk-outofscene", "dnk-incapacitated"];

function abilityLabel(key) {
  return game.i18n.localize(`DNK.Ability${key.charAt(0).toUpperCase()}${key.slice(1)}`);
}

/**
 * Open a small dialog to confirm ability/advantage/disadvantage/difficulty before rolling.
 * @param {Actor} actor
 * @param {object} presets  rollAbilityTest options, plus:
 * @param {string[]} [presets.abilityChoices]  Abilities offered in the picker (defaults to all three).
 * @param {boolean}  [presets.lockAbility]     Hide the picker (e.g. a spell's ability is fixed by its path).
 */
export async function openRollDialog(actor, presets = {}) {
  const ability = presets.ability ?? "strong";
  const flavor = presets.flavor ?? "";
  const choices = presets.lockAbility ? [ability] : (presets.abilityChoices ?? ABILITY_KEYS);

  if (CANNOT_ACT_STATUSES.some(s => actor.statuses?.has(s))) {
    ui.notifications.warn(game.i18n.format("DNK.CannotAct", { name: actor.name }));
  }

  /** Token status icons pre-fill the counts; an explicit preset still wins over the status. */
  const statusAdvantage = actor.statuses?.has("dnk-advantage") ? 1 : 0;
  const statusDisadvantage = DISADVANTAGE_STATUSES.some(s => actor.statuses?.has(s)) ? 1 : 0;

  const content = await renderTemplate("systems/dungeons-and-kittens/templates/apps/roll-dialog.html", {
    flavor,
    abilities: choices.map(key => ({
      key, label: `${abilityLabel(key)} (${actor.system.abilities?.[key]?.value ?? 0})`, selected: key === ability
    })),
    showAbility: choices.length > 1,
    fixedAbility: abilityLabel(ability),
    advantage: presets.advantage ?? statusAdvantage,
    disadvantage: presets.disadvantage ?? statusDisadvantage,
    difficulty: presets.difficulty ?? 0,
    showDifficulty: rules().difficulty,
    showAdvantages: rules().advantages
  });

  const title = flavor ? `${game.i18n.localize("DNK.RollDialogTitle")}: ${flavor}` : game.i18n.localize("DNK.RollDialogTitle");

  return new Promise(resolve => {
    /**
     * Foundry's Dialog calls "close" right after a button's callback starts, without waiting for
     * its async work - so mark `resolved` synchronously before any await, or close's
     * resolve(null) wins the race and callers think the roll was cancelled.
     */
    let resolved = false;
    new Dialog({
      title,
      content,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice"></i>',
          label: game.i18n.localize("DNK.Roll"),
          callback: async html => {
            resolved = true;
            const form = html[0].querySelector("form");
            const message = await rollAbilityTest(actor, {
              ability: form.ability?.value || ability,
              flavor,
              advantage: Number(form.advantage?.value) || 0,
              disadvantage: Number(form.disadvantage?.value) || 0,
              difficulty: Number(form.difficulty?.value) || 0,
              isDefend: presets.isDefend,
              isHeal: presets.isHeal,
              isHinder: presets.isHinder,
              spellId: presets.spellId ?? null
            });
            await consumeOneShots(actor);
            resolve(message);
          }
        }
      },
      default: "roll",
      close: () => { if (!resolved) resolve(null); }
    }).render(true);
  });
}
