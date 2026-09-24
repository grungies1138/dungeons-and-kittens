import { SPELLS, spellItemData } from "./content.mjs";
import { ensureWorldPack } from "./packs.mjs";

/** Bump whenever the spell list or wording changes so existing worlds get the refresh. */
export const SPELLS_DATA_VERSION = 1;

/** "Dungeons & Kittens: Spells" - all 36 spells (pp.39-41), ready to drag onto a Kitten. */
export function ensureSpellsCompendium() {
  return ensureWorldPack({
    name: "dnk-spells",
    label: "Dungeons & Kittens: Spells",
    type: "Item",
    version: SPELLS_DATA_VERSION,
    setting: "spellsDataVersion",
    build: () => SPELLS.map(spellItemData)
  });
}
