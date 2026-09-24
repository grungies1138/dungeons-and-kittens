import { SKILLS } from "./skills.mjs";
import { SPELLS, SPELL_PATHS, XP_COSTS, ABILITY_KEYS, ABILITY_MAX, spellItemData } from "./content.mjs";

/**
 * Experience (p.42): +1 at the end of every session, +1 more for completing an adventure or
 * reaching a goal. `current` is unspent experience; `total` is everything ever earned.
 */
export async function awardExperience(actors, amount) {
  for (const actor of actors) {
    const xp = actor.system.experience;
    await actor.update({
      "system.experience.current": xp.current + amount,
      "system.experience.total": xp.total + amount
    });
  }
}

function abilityLabel(key) {
  return game.i18n.localize(`DNK.Ability${key.charAt(0).toUpperCase()}${key.slice(1)}`);
}

/** Every purchase this Kitten can currently make, with its cost. */
function improvementOptions(actor) {
  const sys = actor.system;
  const knownSpells = new Set(actor.items.filter(i => i.type === "spell").map(i => i.name.toLowerCase()));
  return {
    abilities: ABILITY_KEYS.map(key => {
      const value = sys.abilities[key].value;
      return {
        key,
        label: `${abilityLabel(key)} ${value} → ${value + 1}`,
        cost: XP_COSTS.ability(value + 1),
        maxed: value >= ABILITY_MAX
      };
    }),
    skills: SKILLS.filter(key => !sys.skills[key]?.trained)
      .map(key => ({ key, label: game.i18n.localize(`DNK.Skill.${key}`) })),
    spells: SPELLS.filter(s => !knownSpells.has(s.name.toLowerCase()))
      .map(s => ({ key: s.name, label: `${s.name} (${SPELL_PATHS[s.path].label}, ${s.level})` }))
  };
}

async function spend(actor, cost, update, label) {
  const current = actor.system.experience.current;
  if (current < cost) throw new Error(game.i18n.format("DNK.NotEnoughXP", { cost, current }));
  await actor.update({ "system.experience.current": current - cost, ...update });
  ui.notifications.info(game.i18n.format("DNK.Improved", { name: actor.name, label, cost }));
}

/** Buy one improvement. Shared by the dialog and the Companion API. */
export async function buyImprovement(actor, kind, key) {
  const sys = actor.system;
  if (kind === "ability") {
    const value = sys.abilities[key]?.value;
    if (value === undefined) throw new Error(game.i18n.localize("DNK.InvalidChoice"));
    if (value >= ABILITY_MAX) throw new Error(game.i18n.format("DNK.AbilityMaxed", { max: ABILITY_MAX }));
    return spend(actor, XP_COSTS.ability(value + 1), { [`system.abilities.${key}.value`]: value + 1 },
      `${abilityLabel(key)} ${value + 1}`);
  }
  if (kind === "skill") {
    if (!SKILLS.includes(key) || sys.skills[key]?.trained) throw new Error(game.i18n.localize("DNK.InvalidChoice"));
    return spend(actor, XP_COSTS.skill, { [`system.skills.${key}.trained`]: true }, game.i18n.localize(`DNK.Skill.${key}`));
  }
  if (kind === "spell") {
    const spell = SPELLS.find(s => s.name === key);
    if (!spell) throw new Error(game.i18n.localize("DNK.InvalidChoice"));
    await spend(actor, XP_COSTS.spell, {}, spell.name);
    return actor.createEmbeddedDocuments("Item", [spellItemData(spell)]);
  }
  if (kind === "slot") {
    return spend(actor, XP_COSTS.purreciousSlot, { "system.purreciousBonus": sys.purreciousBonus + 1 },
      game.i18n.localize("DNK.PurreciousSlot"));
  }
  throw new Error(game.i18n.localize("DNK.InvalidChoice"));
}

/** The sheet's "Improve" dialog. */
export async function openImproveDialog(actor) {
  const options = improvementOptions(actor);
  const content = await renderTemplate("systems/dungeons-and-kittens/templates/apps/improve-dialog.html", {
    current: actor.system.experience.current,
    ...options,
    costs: XP_COSTS,
    slotCost: XP_COSTS.purreciousSlot,
    slots: actor.system.purreciousSlots
  });

  const dialog = new Dialog({
    title: game.i18n.format("DNK.ImproveTitle", { name: actor.name }),
    content,
    buttons: { close: { label: game.i18n.localize("DNK.Close") } },
    default: "close",
    render: html => {
      html.find("[data-buy]").on("click", async ev => {
        ev.preventDefault();
        const kind = ev.currentTarget.dataset.buy;
        const key = ev.currentTarget.dataset.key ?? html.find(`select[name="${kind}"]`).val();
        try {
          await buyImprovement(actor, kind, key);
          dialog.close();
        } catch (err) {
          ui.notifications.warn(err.message);
        }
      });
    }
  }, { width: 460 });
  dialog.render(true);
}
