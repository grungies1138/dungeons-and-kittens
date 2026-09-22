/**
 * "Character Tables": quick-roll RollTables for the ideas the Player's Guide already invites
 * players to reuse (Childhood, Character Trait, Cattribute - see journals.mjs's Creation
 * Guide, steps 2 and 6). All entries beyond the five official pregens are original invented
 * flavor, in the same spirit as this project's original skill descriptions - homebrew
 * inspiration, not a transcription of the Core Rulebook's own (longer) lists.
 */

/** Bump this whenever the table entries change so existing worlds get the refreshed tables. */
export const TABLES_DATA_VERSION = 1;

const CHILDHOOD_IDEAS = [
  "Country Kitten", "Young Noble", "Meowge", "Soldier's Child", "Catnut",
  "Dock Kitten", "Temple Ward", "Roadside Foundling", "Circus Kitten", "Miller's Kit",
  "Lighthouse Kitten", "Guild Apprentice", "Mountain-Born", "Bookbinder's Kit", "Tinker's Kit",
  "Orchard Kitten", "Harbor Rat", "Shepherd's Kit", "Windmill Kitten", "Wanderer's Kit"
];

const CHARACTER_TRAIT_IDEAS = [
  "Brave", "Grouchy", "Stubborn", "Shy", "Funny",
  "Curious", "Loyal", "Proud", "Anxious", "Bossy",
  "Dreamy", "Clumsy", "Suspicious", "Generous", "Reckless",
  "Tidy", "Forgetful", "Competitive", "Gentle", "Sarcastic"
];

const CATTRIBUTE_IDEAS = [
  "Mystic Mentor", "Animal Companion", "Inheritance", "Heroic Lineage", "Disguise",
  "Lucky Charm", "Second Sight", "Silver Tongue", "Iron Stomach", "Night Vision",
  "Weather Sense", "Old Debt", "Secret Map", "Whisker Sense", "Borrowed Time", "Green Paw"
];

function buildTable(name, entries, description) {
  const results = entries.map((text, i) => ({
    type: CONST.TABLE_RESULT_TYPES?.TEXT ?? 0,
    text,
    weight: 1,
    range: [i + 1, i + 1]
  }));
  return {
    name,
    description,
    formula: `1d${entries.length}`,
    replacement: true,
    displayRoll: true,
    results
  };
}

function buildTables() {
  return [
    buildTable(
      "Childhood Idea (homebrew)",
      CHILDHOOD_IDEAS,
      "Original inspiration for the one-/two-word Childhood field on the Kitten sheet - not an official list, see the Core Rulebook for the full one."
    ),
    buildTable(
      "Character Trait Idea (homebrew)",
      CHARACTER_TRAIT_IDEAS,
      "Original inspiration for a short Character Trait - a personality adjective to play helpfully for Advantage, or against yourself for a complication."
    ),
    buildTable(
      "Cattribute Idea (homebrew)",
      CATTRIBUTE_IDEAS,
      "Original inspiration for a unique Cattribute, in the spirit of the five official Kittens' own (Mystic Mentor, Animal Companion, Inheritance, Heroic Lineage, Disguise) - write your own or reroll for a spark."
    )
  ];
}

const TABLES_PACK_NAME = "dnk-tables";
const VERSION_SETTING = "tablesDataVersion";

/**
 * Make sure the "Character Tables" RollTable compendium exists for this world, is populated,
 * and matches the current TABLES_DATA_VERSION.
 */
export async function ensureTablesCompendium() {
  if (!game.user.isGM) return;

  let pack = game.packs.get(`world.${TABLES_PACK_NAME}`);
  if (!pack) {
    pack = await CompendiumCollection.createCompendium({
      type: "RollTable",
      name: TABLES_PACK_NAME,
      label: "Dungeons & Kittens: Character Tables"
    });
  }

  const storedVersion = game.settings.get("dungeons-and-kittens", VERSION_SETTING);
  if (storedVersion >= TABLES_DATA_VERSION) return;

  const index = await pack.getIndex();
  if (index.size > 0) {
    await RollTable.deleteDocuments(Array.from(index.keys()), { pack: pack.collection });
  }

  await RollTable.createDocuments(buildTables(), { pack: pack.collection });
  await game.settings.set("dungeons-and-kittens", VERSION_SETTING, TABLES_DATA_VERSION);
  ui.notifications.info("Dungeons & Kittens: refreshed the Character Tables compendium.");
}
