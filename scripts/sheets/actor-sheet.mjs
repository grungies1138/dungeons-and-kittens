import { SKILLS } from "../skills.mjs";
import { openRollDialog } from "../apps/roll-dialog.mjs";
import { openImageCropDialog } from "../apps/image-crop.mjs";

export const COMBAT_PRESETS = {
  fangAttack: { ability: "strong", flavorKey: "DNK.FangAttack" },
  clawAttack: { ability: "strong", flavorKey: "DNK.ClawAttack" },
  defend: { ability: "strong", flavorKey: "DNK.Defend" },
  help: { ability: "cute", flavorKey: "DNK.Help" },
  hinder: { ability: "smart", flavorKey: "DNK.Hinder" },
  move: { ability: "strong", flavorKey: "DNK.Move" }
};

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
    return openRollDialog(this.actor, { ability: preset.ability, flavor: game.i18n.localize(preset.flavorKey) });
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
    return openRollDialog(this.actor, {
      ability: item.system.ability,
      flavor: item.name,
      difficulty: item.system.successes
    });
  }
}
