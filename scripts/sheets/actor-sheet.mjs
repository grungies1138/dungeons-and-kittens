import { SKILLS } from "../skills.mjs";
import { openRollDialog } from "../apps/roll-dialog.mjs";
import { openImageCropDialog } from "../apps/image-crop.mjs";
import { castSpell } from "../spells.mjs";
import { postItemCard } from "../automation.mjs";
import { applyNightRestToActor } from "../rest.mjs";
import { openImproveDialog } from "../experience.mjs";
import { openChildhoodDialog, randomTrait, randomName } from "../childhood.mjs";
import {
  COMBAT_PRESETS, cedeInitiative, isInClawCatfight, enterClawCatfight, leaveClawCatfight,
  helpTargets, concede, pamper, useTrait
} from "../catfight.mjs";
import { SPELL_PATHS, CREATION_POINTS, ABILITY_MIN, ABILITY_MAX, ABILITY_KEYS } from "../content.mjs";

const SCOPE = "dungeons-and-kittens";

export class DnkActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnk", "sheet", "actor"],
      width: 720,
      height: 840,
      submitOnChange: true,
      closeOnSubmit: false,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }],
      dragDrop: [{ dragSelector: ".item-row, .ability-roll, .skill-roll", dropSelector: null }]
    });
  }

  /** @override */
  get template() {
    return `systems/dungeons-and-kittens/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /** @override Self-service "Night's Rest" header button for Kittens (the GM has a party-wide macro). */
  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
    if (this.isEditable && this.actor.type === "kitten") {
      buttons.unshift({
        label: game.i18n.localize("DNK.NightRestButton"),
        class: "dnk-night-rest",
        icon: "fas fa-moon",
        onclick: () => this._run(() => applyNightRestToActor(this.actor))
      });
    }
    return buttons;
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    const system = context.actor.system;
    context.system = system;

    context.skills = SKILLS.map(key => ({
      key,
      label: game.i18n.localize(`DNK.Skill.${key}`),
      description: game.i18n.localize(`DNK.SkillDescription.${key}`),
      trained: system.skills?.[key]?.trained ?? false
    }));

    context.spells = this.actor.items.filter(i => i.type === "spell").sort((a, b) => a.sort - b.sort);
    for (const spell of context.spells) {
      spell.usedToday = spell.getFlag(SCOPE, "usedToday") ?? false;
      spell.pathLabel = SPELL_PATHS[spell.system.path]?.label ?? "";
    }
    context.gear = this.actor.items.filter(i => i.type === "gear").sort((a, b) => a.sort - b.sort);

    /** Purr-ecious items that take up a backpack slot (p.23) against this Kitten's limit. */
    const used = context.gear.filter(i => i.system.purrecious && !i.system.slotFree).length;
    context.purrecious = { used, slots: system.purreciousSlots ?? used, over: used > (system.purreciousSlots ?? used) };

    /** Kitten creation (p.14): 8 points across the abilities, each 1-5. Shown as a gentle check. */
    const spent = ABILITY_KEYS.reduce((sum, key) => sum + system.abilities[key].value, 0);
    const outOfRange = ABILITY_KEYS.some(key => system.abilities[key].value < ABILITY_MIN || system.abilities[key].value > ABILITY_MAX);
    context.creation = { spent, target: CREATION_POINTS, ok: spent === CREATION_POINTS && !outOfRange, outOfRange };

    context.inClaw = isInClawCatfight(this.actor);
    context.traitPositiveUsed = !!this.actor.getFlag(SCOPE, "traitPositiveUsed");
    context.traitNegativeUsed = !!this.actor.getFlag(SCOPE, "traitNegativeUsed");
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    const on = (selector, fn) => html.find(selector).on("click", ev => { ev.preventDefault(); return fn(ev); });
    on(".portrait-crop-btn", () => openImageCropDialog(this.actor, "img"));
    on(".ability-roll", ev => openRollDialog(this.actor, { ability: ev.currentTarget.dataset.ability, lockAbility: true, fastForward: ev.shiftKey }));
    on(".skill-roll", ev => openRollDialog(this.actor, { skill: ev.currentTarget.dataset.skill, fastForward: ev.shiftKey }));
    on(".combat-action", ev => this._run(() => this._onCombatAction(ev.currentTarget.dataset.action, ev.shiftKey)));
    on(".claw-enter", () => this._run(() => enterClawCatfight(this.actor)));
    on(".claw-leave", () => this._run(() => leaveClawCatfight(this.actor)));
    on(".concede", () => this._run(() => concede(this.actor)));
    on(".pamper", () => this._run(() => pamper(this.actor)));
    on(".trait-use", ev => this._run(() => useTrait(this.actor, ev.currentTarget.dataset.mode)));
    on(".improve", () => openImproveDialog(this.actor));
    on(".choose-childhood", () => openChildhoodDialog(this.actor));
    on(".random-trait", () => this.actor.update({ "system.details.characterTrait.name": randomTrait() }));
    on(".random-name", () => this.actor.update({ name: randomName() }));
    on(".resource-adjust", ev => this.actor.adjustResource(ev.currentTarget.dataset.resource, Number(ev.currentTarget.dataset.delta)));
    on(".item-create", ev => this._onItemCreate(ev.currentTarget.dataset.type));
    on(".item-edit", ev => this._getItemFromEvent(ev)?.sheet.render(true));
    on(".item-delete", ev => this._getItemFromEvent(ev)?.delete());
    on(".item-roll", ev => {
      const item = this._getItemFromEvent(ev);
      if (item?.type === "spell") return this._run(() => castSpell(this.actor, item, { fastForward: ev.shiftKey }));
      if (item?.type === "gear") return postItemCard(item);
    });
  }

  /** Run an action, surfacing its localized error as a warning instead of an uncaught rejection. */
  async _run(fn) {
    try {
      return await fn();
    } catch (err) {
      ui.notifications.warn(err.message);
    }
  }

  /** @override Route newly-picked portraits through the crop tool before they're assigned. */
  _onEditImage(event) {
    const attr = event.currentTarget.dataset.edit;
    if (attr !== "img") return super._onEditImage(event);
    event.preventDefault();
    const fp = new FilePicker({
      current: foundry.utils.getProperty(this.actor, attr),
      type: "image",
      callback: path => openImageCropDialog(this.actor, attr, path),
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    return fp.browse();
  }

  /** @override Drag abilities and skills (as roll macros) and items off the sheet onto the hotbar. */
  _onDragStart(event) {
    const el = event.currentTarget;
    if (el.classList.contains("ability-roll") || el.classList.contains("skill-roll")) {
      const data = { type: "DnkRoll", actorUuid: this.actor.uuid, ability: el.dataset.ability ?? null, skill: el.dataset.skill ?? null };
      return event.dataTransfer.setData("text/plain", JSON.stringify(data));
    }
    const item = this.actor.items.get(el.closest(".item-row")?.dataset.itemId);
    if (item) return event.dataTransfer.setData("text/plain", JSON.stringify(item.toDragData()));
    return super._onDragStart(event);
  }

  async _onCombatAction(key, fastForward = false) {
    const preset = COMBAT_PRESETS[key];
    if (!preset) return;
    if (preset.auto) return helpTargets(this.actor);
    if (preset.claw && !isInClawCatfight(this.actor)) await enterClawCatfight(this.actor);
    if (preset.aggressive) await cedeInitiative(this.actor);
    return openRollDialog(this.actor, {
      ability: preset.abilities[0],
      abilityChoices: preset.abilities,
      flavor: game.i18n.localize(preset.flavorKey),
      skill: preset.skills?.find(k => this.actor.system.skills?.[k]?.trained) ?? null,
      fastForward,
      isDefend: preset.isDefend,
      isHeal: preset.isHeal,
      isHinder: preset.isHinder
    });
  }

  async _onItemCreate(type) {
    const name = game.i18n.format("DOCUMENT.New", { type: game.i18n.localize(`TYPES.Item.${type}`) ?? type });
    return this.actor.createEmbeddedDocuments("Item", [{ name, type }]);
  }

  _getItemFromEvent(event) {
    const itemId = event.currentTarget.closest(".item-row")?.dataset.itemId;
    return this.actor.items.get(itemId);
  }
}
