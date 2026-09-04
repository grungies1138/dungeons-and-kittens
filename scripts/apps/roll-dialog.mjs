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

  const content = await renderTemplate("systems/dungeons-and-kittens/templates/apps/roll-dialog.html", {
    flavorHint,
    advantage: presets.advantage ?? 0,
    disadvantage: presets.disadvantage ?? 0,
    difficulty: presets.difficulty ?? 0
  });

  return new Promise(resolve => {
    new Dialog({
      title: `${game.i18n.localize("DNK.RollDialogTitle")}: ${flavorHint}`,
      content,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice"></i>',
          label: game.i18n.localize("DNK.Roll"),
          callback: async html => {
            const form = html[0].querySelector("form");
            const advantage = Number(form.advantage.value) || 0;
            const disadvantage = Number(form.disadvantage.value) || 0;
            const difficulty = Number(form.difficulty.value) || 0;
            const message = await rollAbilityTest(actor, { ability, flavor, advantage, disadvantage, difficulty });
            resolve(message);
          }
        }
      },
      default: "roll",
      close: () => resolve(null)
    }).render(true);
  });
}
