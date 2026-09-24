import { SKILLS } from "../skills.mjs";
import { openRollDialog } from "../apps/roll-dialog.mjs";
import { openImageCropDialog } from "../apps/image-crop.mjs";
import { castSpell } from "../spells.mjs";
import { applyNightRestToActor } from "../rest.mjs";

/**
 * `aggressive` mirrors the Quick Reference's Catfight table: Kittens keep the initiative as
 * long as they don't make an aggressive action. Fang/Claw Attack and Hinder are listed under
 * "Aggressive actions" there; Defend, Help, and Move are not.
 *
 * `isDefend`/`isHeal` flag the roll so the chat card can offer its "Set as Block" / "Heal
 * target(s)" buttons (see dice.mjs) - Defend's successes cancel a later hit, and Heal Ally
 * applies the "another character's successful Smart test" Heart regain from the Quick
 * Reference, once per half-day per recipient.
 *
 * `furrendshipCost` mirrors the Quick Reference's Furr-endship entry: "Must spend 1 point to
 * start a Claw Catfight."
 */
export const COMBAT_PRESETS = {
  fangAttack: { ability: "strong", flavorKey: "DNK.FangAttack", aggressive: true },
  clawAttack: { ability: "strong", flavorKey: "DNK.ClawAttack", aggressive: true, furrendshipCost: 1 },
  defend: { ability: "strong", flavorKey: "DNK.Defend", isDefend: true },
  help: { ability: "cute", flavorKey: "DNK.Help" },
  hinder: { ability: "smart", flavorKey: "DNK.Hinder", aggressive: true },
  move: { ability: "strong", flavorKey: "DNK.Move" },
  healAlly: { ability: "smart", flavorKey: "DNK.HealAlly", isHeal: true }
};

/** Whether an actor has enough Furr-endship to cover a combat preset's cost (0 if it has none). */
export function canAffordCombatCost(actor, preset) {
  const cost = preset.furrendshipCost ?? 0;
  return cost <= 0 || (actor.system.resources?.furrendship?.value ?? 0) >= cost;
}

/** Deduct a combat preset's Furr-endship cost, if any. Call only once the action is actually taken. */
export async function chargeCombatCost(actor, preset) {
  const cost = preset.furrendshipCost ?? 0;
  if (cost > 0) await actor.adjustResource("furrendship", -cost);
}

/**
 * Acting aggressively cedes the initiative: drop this actor's combatant below the flat-0
 * tie everyone starts a round at. Silently does nothing without an active combat, without a
 * combatant for this actor, or without permission to update it (e.g. a player without control
 * over the Combat document) - this is a bonus nudge to the tracker, not something a roll
 * should ever be blocked on.
 */
export async function cedeInitiative(actor) {
  const combatant = game.combat?.combatants.find(c => c.actor?.id === actor.id);
  if (!combatant) return;
  try {
    await combatant.update({ initiative: -1 });
  } catch (_err) { /* no permission to update the Combat - ignore */ }
}

export class DnkActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnk", "sheet", "actor"],
      width: 700,
      height: 820,
      submitOnChange: true,
      closeOnSubmit: false,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  /** @override */
  get template() {
    return `systems/dungeons-and-kittens/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /**
   * @override Add a self-service "Night's Rest" header button for Kittens, next to Foundry's
   * own "Prototype Token"/"Close" buttons - +1 Heart, clears the half-day heal cooldown, and
   * resets any recast spells. Kitten-only: Extras are GM-controlled, and the GM already has
   * the whole-party version of this in the GM Tools macro compendium (see rest.mjs).
   */
  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
    if (this.isEditable && this.actor.type === "kitten") {
      buttons.unshift({
        label: game.i18n.localize("DNK.NightRestButton"),
        class: "dnk-night-rest",
        icon: "fas fa-moon",
        onclick: () => this._onNightRest()
      });
    }
    return buttons;
  }

  async _onNightRest() {
    try {
      await applyNightRestToActor(this.actor);
    } catch (err) {
      ui.notifications.warn(err.message);
    }
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.system = context.actor.system;
    context.config = { skills: SKILLS };

    context.skills = SKILLS.map(key => ({
      key,
      label: game.i18n.localize(`DNK.Skill.${key}`),
      description: game.i18n.localize(`DNK.SkillDescription.${key}`),
      trained: context.system.skills?.[key]?.trained ?? false
    }));

    context.spells = this.actor.items.filter(i => i.type === "spell").sort((a, b) => a.sort - b.sort);
    for (const spell of context.spells) spell.usedToday = spell.getFlag("dungeons-and-kittens", "usedToday") ?? false;
    context.gear = this.actor.items.filter(i => i.type === "gear").sort((a, b) => a.sort - b.sort);

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    html.find(".portrait-crop-btn").click(this._onCropPortrait.bind(this));
    html.find(".ability-roll").click(this._onAbilityRoll.bind(this));
    html.find(".combat-action").click(this._onCombatAction.bind(this));
    html.find(".resource-adjust").click(this._onResourceAdjust.bind(this));
    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
    html.find(".item-roll").click(this._onItemRoll.bind(this));
  }

  /** Re-crop the portrait that's already set, without picking a new file. */
  async _onCropPortrait(event) {
    event.preventDefault();
    return openImageCropDialog(this.actor, "img");
  }

  /** @override Route newly-picked portraits through the crop tool before they're assigned. */
  _onEditImage(event) {
    const attr = event.currentTarget.dataset.edit;
    if (attr !== "img") return super._onEditImage(event);
    event.preventDefault();
    const current = foundry.utils.getProperty(this.actor, attr);
    const fp = new FilePicker({
      current,
      type: "image",
      callback: path => openImageCropDialog(this.actor, attr, path),
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    return fp.browse();
  }

  async _onAbilityRoll(event) {
    event.preventDefault();
    const ability = event.currentTarget.dataset.ability;
    return openRollDialog(this.actor, { ability });
  }

  async _onCombatAction(event) {
    event.preventDefault();
    const key = event.currentTarget.dataset.action;
    const preset = COMBAT_PRESETS[key];
    if (!preset) return;
    if (!canAffordCombatCost(this.actor, preset)) {
      return ui.notifications.warn(game.i18n.format("DNK.NotEnoughFurrendshipForAction", { cost: preset.furrendshipCost }));
    }
    if (preset.aggressive) await cedeInitiative(this.actor);
    const message = await openRollDialog(this.actor, {
      ability: preset.ability,
      flavor: game.i18n.localize(preset.flavorKey),
      isDefend: preset.isDefend,
      isHeal: preset.isHeal
    });
    if (message) await chargeCombatCost(this.actor, preset);
    return message;
  }

  async _onResourceAdjust(event) {
    event.preventDefault();
    const { resource, delta } = event.currentTarget.dataset;
    return this.actor.adjustResource(resource, Number(delta));
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    const name = game.i18n.format("DOCUMENT.New", { type: game.i18n.localize(`TYPES.Item.${type}`) ?? type });
    return this.actor.createEmbeddedDocuments("Item", [{ name, type }]);
  }

  _getItemFromEvent(event) {
    const itemId = event.currentTarget.closest(".item-row")?.dataset.itemId;
    return this.actor.items.get(itemId);
  }

  async _onItemEdit(event) {
    event.preventDefault();
    this._getItemFromEvent(event)?.sheet.render(true);
  }

  async _onItemDelete(event) {
    event.preventDefault();
    return this._getItemFromEvent(event)?.delete();
  }

  async _onItemRoll(event) {
    event.preventDefault();
    const item = this._getItemFromEvent(event);
    if (!item || item.type !== "spell") return;
    try {
      return await castSpell(this.actor, item);
    } catch (err) {
      ui.notifications.warn(err.message);
    }
  }
}
