/**
 * The "GM Tools" macro pack: one-click party-wide actions wrapping rest.mjs, so a GM doesn't
 * have to click +1 Heart / clear a flag on every character individually. Same
 * ensure*Compendium/version-bump pattern as pregens.mjs, journals.mjs, and macros.mjs.
 */

/** Bump this whenever GM_MACROS changes so existing worlds get the refreshed macros. */
export const GM_TOOLS_DATA_VERSION = 1;

const GM_MACROS = [
  {
    name: "DNK: Apply Lunch Rest",
    img: "icons/svg/sun.svg",
    command: `return await game.dnk.rest.applyPartyRest("lunch");`
  },
  {
    name: "DNK: Apply Night's Rest",
    img: "icons/svg/moon.svg",
    command: `return await game.dnk.rest.applyPartyRest("night");`
  },
  {
    name: "DNK: Grant Party Furr-endship",
    img: "icons/svg/heart.svg",
    command: `return await game.dnk.rest.grantPartyFurrendship(1);`
  }
];

function macroData({ name, img, command }) {
  return { name, type: "script", scope: "global", img, command };
}

const GM_TOOLS_PACK_NAME = "dnk-gm-tools";
const VERSION_SETTING = "gmToolsMacroVersion";

/**
 * Make sure the "GM Tools" macro compendium exists for this world, is populated, and matches
 * the current GM_TOOLS_DATA_VERSION.
 */
export async function ensureGmToolsCompendium() {
  if (!game.user.isGM) return;

  let pack = game.packs.get(`world.${GM_TOOLS_PACK_NAME}`);
  if (!pack) {
    pack = await CompendiumCollection.createCompendium({
      type: "Macro",
      name: GM_TOOLS_PACK_NAME,
      label: "Dungeons & Kittens: GM Tools"
    });
  }

  const storedVersion = game.settings.get("dungeons-and-kittens", VERSION_SETTING);
  if (storedVersion >= GM_TOOLS_DATA_VERSION) return;

  const index = await pack.getIndex();
  if (index.size > 0) {
    await Macro.deleteDocuments(Array.from(index.keys()), { pack: pack.collection });
  }

  await Macro.createDocuments(GM_MACROS.map(macroData), { pack: pack.collection });
  await game.settings.set("dungeons-and-kittens", VERSION_SETTING, GM_TOOLS_DATA_VERSION);
  ui.notifications.info("Dungeons & Kittens: refreshed the GM Tools macro compendium.");
}
