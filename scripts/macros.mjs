/**
 * The "Companion API" macro pack: thin script macros wrapping game.dnk.api, so external tools
 * (the mobile character-sheet app, via a Foundry REST API relay module executing macros with
 * a scope object) can drive rolls and resource changes without duplicating any game logic.
 * Each macro just reads its arguments off `scope` and calls straight into game.dnk.api.
 */

/** Bump this whenever COMPANION_MACROS changes so existing worlds get the refreshed macros. */
export const MACRO_DATA_VERSION = 1;

const COMPANION_MACROS = [
  {
    name: "DNK API: Roll Ability Test",
    img: "icons/svg/d6-grey.svg",
    command: `
      return await game.dnk.api.rollAbilityTestForActor(scope.actorId, {
        ability: scope.ability,
        flavor: scope.flavor ?? "",
        advantage: scope.advantage ?? 0,
        disadvantage: scope.disadvantage ?? 0,
        difficulty: scope.difficulty ?? 0
      });
    `.trim()
  },
  {
    name: "DNK API: Roll Combat Action",
    img: "icons/svg/sword.svg",
    command: `
      return await game.dnk.api.rollCombatActionForActor(scope.actorId, scope.presetKey, {
        advantage: scope.advantage ?? 0,
        disadvantage: scope.disadvantage ?? 0,
        difficulty: scope.difficulty ?? 0
      });
    `.trim()
  },
  {
    name: "DNK API: Roll Spell",
    img: "icons/svg/book.svg",
    command: `
      return await game.dnk.api.rollSpellForActor(scope.actorId, scope.itemId, {
        advantage: scope.advantage ?? 0,
        disadvantage: scope.disadvantage ?? 0
      });
    `.trim()
  },
  {
    name: "DNK API: Adjust Resource",
    img: "icons/svg/heal.svg",
    command: `
      return await game.dnk.api.adjustActorResource(scope.actorId, scope.resource, scope.delta);
    `.trim()
  },
  {
    name: "DNK API: Spend Furrendship",
    img: "icons/svg/heart.svg",
    command: `
      return await game.dnk.api.spendFurrendshipOnMessage(scope.messageId);
    `.trim()
  },
  {
    name: "DNK API: Reroll",
    img: "icons/svg/d6-grey.svg",
    command: `
      return await game.dnk.api.rerollOnMessage(scope.messageId);
    `.trim()
  }
];

function macroData({ name, img, command }) {
  return { name, type: "script", scope: "global", img, command };
}

const MACRO_PACK_NAME = "dnk-companion-api";
const VERSION_SETTING = "companionApiMacroVersion";

/**
 * Make sure the "Companion API" macro compendium exists for this world, is populated, and
 * matches the current MACRO_DATA_VERSION. Same rebuild-on-version-bump approach as
 * ensurePregenCompendium/ensureGuideCompendium.
 */
export async function ensureCompanionApiCompendium() {
  if (!game.user.isGM) return;

  let pack = game.packs.get(`world.${MACRO_PACK_NAME}`);
  if (!pack) {
    pack = await CompendiumCollection.createCompendium({
      type: "Macro",
      name: MACRO_PACK_NAME,
      label: "Dungeons & Kittens: Companion API"
    });
  }

  const storedVersion = game.settings.get("dungeons-and-kittens", VERSION_SETTING);
  if (storedVersion >= MACRO_DATA_VERSION) return;

  const index = await pack.getIndex();
  if (index.size > 0) {
    await Macro.deleteDocuments(Array.from(index.keys()), { pack: pack.collection });
  }

  await Macro.createDocuments(COMPANION_MACROS.map(macroData), { pack: pack.collection });
  await game.settings.set("dungeons-and-kittens", VERSION_SETTING, MACRO_DATA_VERSION);
  ui.notifications.info("Dungeons & Kittens: refreshed the Companion API macro compendium.");
}
