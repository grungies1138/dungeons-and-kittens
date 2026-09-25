import { spellIcon, gearIcon } from "../icons.mjs";

/**
 * The Dungeons & Kittens Item document (spells and backpack gear).
 */
export class DnkItem extends Item {
  /** New items without a picture get one from the core icon library that fits their name. */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;
    if (!data.img || data.img === Item.DEFAULT_ICON) {
      this.updateSource({ img: this.type === "spell" ? spellIcon(data.name) : gearIcon(data.name) });
    }
  }
}
