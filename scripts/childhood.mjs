import { CHILDHOODS, CHILDHOOD_CATEGORIES, CHARACTER_TRAITS, KITTEN_NAMES } from "./content.mjs";

/**
 * Creating a Kitten starts with a Childhood (p.14), which sets their Cattribute and the five
 * Purr-ecious items in their backpack. Applying one replaces the Cattribute and adds the items.
 */
export async function applyChildhood(actor, name) {
  const childhood = CHILDHOODS.find(c => c.name === name);
  if (!childhood) throw new Error(game.i18n.localize("DNK.InvalidChoice"));

  const update = {
    "system.details.childhood": childhood.name,
    "system.details.cattribute.name": childhood.cattribute,
    "system.details.cattribute.description": childhood.cattributeText
  };
  if (childhood.extraSlots) {
    update["system.purreciousBonus"] = Math.max(actor.system.purreciousBonus, childhood.extraSlots);
  }
  await actor.update(update);

  await actor.createEmbeddedDocuments("Item", childhood.items.map(item => ({
    name: item,
    type: "gear",
    img: "icons/svg/chest.svg",
    system: { description: "", quantity: 1, purrecious: true }
  })));

  if (childhood.note) ui.notifications.info(`${childhood.name}: ${childhood.note}`);
  return childhood;
}

export async function openChildhoodDialog(actor) {
  const groups = Object.entries(CHILDHOOD_CATEGORIES).map(([key, label]) => ({
    label,
    options: CHILDHOODS.filter(c => c.category === key)
  }));
  const content = await renderTemplate("systems/dungeons-and-kittens/templates/apps/childhood-dialog.html", {
    groups,
    childhoods: CHILDHOODS
  });

  new Dialog({
    title: game.i18n.format("DNK.ChooseChildhoodTitle", { name: actor.name }),
    content,
    buttons: {
      apply: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("DNK.Apply"),
        callback: async html => {
          try {
            await applyChildhood(actor, html.find('select[name="childhood"]').val());
          } catch (err) {
            ui.notifications.warn(err.message);
          }
        }
      }
    },
    default: "apply",
    render: html => {
      const select = html.find('select[name="childhood"]');
      const preview = html.find(".childhood-preview");
      const show = () => {
        const c = CHILDHOODS.find(x => x.name === select.val());
        preview.find("[data-field=description]").text(c.description);
        preview.find("[data-field=cattribute]").text(`${c.cattribute}: ${c.cattributeText}`);
        preview.find("[data-field=items]").text(c.items.join("; "));
      };
      select.on("change", show);
      show();
    }
  }, { width: 480 }).render(true);
}

/** Roll a Character Trait on the p.24 table (1d6 column x 1d6 row = 18 equally likely results). */
export function randomTrait() {
  return CHARACTER_TRAITS[Math.floor(Math.random() * CHARACTER_TRAITS.length)];
}

export function randomName() {
  return KITTEN_NAMES[Math.floor(Math.random() * KITTEN_NAMES.length)];
}
