import { rollAbilityTest } from "../dice.mjs";

/**
 * Open a small dialog to confirm advantage/disadvantage/difficulty before rolling an ability test.
 * @param {Actor} actor
 * @param {object} presets  Same shape as rollAbilityTest options.
 */
export async function openRollDialog(actor, presets = {}) {
  const ability = presets.ability ?? "strong";
  const flavor = presets.flavor ?? "";
  const abilityLabel = game.i18n.localize(`DNK.Ability${ability.charAt(0).toUpperCase()}${ability.slice(1)}`);
  const flavorHint = flavor ? `${flavor} — ${abilityLabel}` : abilityLabel;

  /** Default the dialog's advantage/disadvantage from the actor's token status icons, so
   *  toggling "Advantage"/"Disadvantage" on a token before rolling pre-fills the count -
   *  an explicit preset (e.g. a combat action) still wins over the status. */
  const statusAdvantage = actor.statuses?.has("dnk-advantage") ? 1 : 0;
  const statusDisadvantage = actor.statuses?.has("dnk-disadvantage") ? 1 : 0;

  const content = await renderTemplate("systems/dungeons-and-kittens/templates/apps/roll-dialog.html", {
    flavorHint,
    advantage: presets.advantage ?? statusAdvantage,
    disadvantage: presets.disadvantage ?? statusDisadvantage,
    difficulty: presets.difficulty ?? 0
  });

  return new Promise(resolve => {
    /**
     * Foundry's Dialog calls the "close" option right after a button's own callback fires,
     * without waiting for that callback's async work to finish - so close's resolve(null) can
     * win the race against the button callback's resolve(message) if it isn't guarded. Marking
     * `resolved` synchronously, as the very first line of the button callback (before any
     * await), closes that race: it's set before Foundry's close() runs its finally-block check.
     */
    let resolved = false;
    new Dialog({
      title: `${game.i18n.localize("DNK.RollDialogTitle")}: ${flavorHint}`,
      content,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice"></i>',
          label: game.i18n.localize("DNK.Roll"),
          callback: async html => {
            resolved = true;
            const form = html[0].querySelector("form");
            const advantage = Number(form.advantage.value) || 0;
            const disadvantage = Number(form.disadvantage.value) || 0;
            const difficulty = Number(form.difficulty.value) || 0;
            const message = await rollAbilityTest(actor, {
              ability, flavor, advantage, disadvantage, difficulty,
              isDefend: presets.isDefend, isHeal: presets.isHeal
            });
            resolve(message);
          }
        }
      },
      default: "roll",
      close: () => { if (!resolved) resolve(null); }
    }).render(true);
  });
}
