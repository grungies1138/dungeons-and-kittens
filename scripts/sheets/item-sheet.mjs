import { SPELL_PATHS } from "../content.mjs";

export class DnkItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnk", "sheet", "item"],
      width: 480,
      height: 420,
      submitOnChange: true,
      closeOnSubmit: false
    });
  }

  /** @override */
  get template() {
    return `systems/dungeons-and-kittens/templates/item/item-${this.item.type}-sheet.html`;
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.system = context.item.system;
    context.spellPaths = SPELL_PATHS;
    return context;
  }
}
