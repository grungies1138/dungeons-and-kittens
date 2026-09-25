/**
 * Game data from the Dungeons & Kittens Core Rulebook (included with the publisher's permission),
 * used by the sheets, the dice engine, and the auto-built compendiums. Official wording lives in
 * rulebook-text.mjs; page numbers cite the book.
 */

import { SPELL_TEXT, CHILDHOOD_TEXT } from "./rulebook-text.mjs";

export const ABILITY_KEYS = ["strong", "smart", "cute"];

/** Kitten creation (p.14): 8 points across the three abilities, each between 1 and 5. */
export const CREATION_POINTS = 8;
export const ABILITY_MIN = 1;
export const ABILITY_MAX = 5;

/** Purr-ecious items a Kitten may carry (p.23). Extra slots can be bought with experience (p.42). */
export const BASE_PURRECIOUS_SLOTS = 5;

/** Experience costs (p.42). The extra Purr-ecious slot uses the body text's 4, not the reference sheet's 5. */
export const XP_COSTS = {
  ability: level => 2 * level,
  skill: 2,
  spell: 2,
  purreciousSlot: 4
};

/** Meowgic paths and the ability each one is cast with (p.37). */
export const SPELL_PATHS = {
  tower: { label: "Tower Meowgic", ability: "strong" },
  greatHall: { label: "Great Hall Meowgic", ability: "strong" },
  craft: { label: "Craft Meowgic", ability: "smart" },
  country: { label: "Country Meowgic", ability: "smart" },
  city: { label: "City Meowgic", ability: "cute" },
  caravan: { label: "Caravan Meowgic", ability: "cute" }
};

/** All 36 spells (pp.39-41). `level` is both the spell's level and the successes it needs. */
const SPELL_LIST = [
  { name: "Slipper Patrol", path: "tower", level: 1 },
  { name: "Earthworks", path: "tower", level: 1 },
  { name: "Loud Speaker", path: "tower", level: 1 },
  { name: "Cat Haven", path: "tower", level: 2 },
  { name: "First Aid", path: "tower", level: 2 },
  { name: "Long Night", path: "tower", level: 3 },

  { name: "Blessing of Honor", path: "greatHall", level: 1 },
  { name: "Fearless", path: "greatHall", level: 1 },
  { name: "Heart Charm", path: "greatHall", level: 1 },
  { name: "Words of Wisdom", path: "greatHall", level: 2 },
  { name: "Endless Feed", path: "greatHall", level: 2 },
  { name: "Sense Trouble", path: "greatHall", level: 3 },

  { name: "Leather Apron", path: "craft", level: 1 },
  { name: "Slice and Dice", path: "craft", level: 1 },
  { name: "Safety at Work", path: "craft", level: 1 },
  { name: "Summon Tools", path: "craft", level: 2 },
  { name: "Quick Fix", path: "craft", level: 2 },
  { name: "Animate Object", path: "craft", level: 3 },

  { name: "The Color of Grass", path: "country", level: 1 },
  { name: "Treating Beasts", path: "country", level: 1 },
  { name: "Leave no Trace", path: "country", level: 1 },
  { name: "Quick as a Flash", path: "country", level: 2 },
  { name: "Bug Swarm", path: "country", level: 2 },
  { name: "Talk to Trees", path: "country", level: 3 },

  { name: "Clean and Tidy", path: "city", level: 1 },
  { name: "Cat's Eyes", path: "city", level: 1 },
  { name: "Sound & Vision", path: "city", level: 1 },
  { name: "Enchanting Voice", path: "city", level: 2 },
  { name: "Balancing Cat", path: "city", level: 2 },
  { name: "Care", path: "city", level: 3 },

  { name: "Preserving Resources", path: "caravan", level: 1 },
  { name: "Breathe Under Water", path: "caravan", level: 1 },
  { name: "Talk to Beasts", path: "caravan", level: 1 },
  { name: "Long View", path: "caravan", level: 2 },
  { name: "Hide Things", path: "caravan", level: 2 },
  { name: "Feel the Path", path: "caravan", level: 3 }
];
export const SPELLS = SPELL_LIST.map(s => ({ ...s, description: SPELL_TEXT[s.name] ?? "" }));

/** Loose name matching so "Slice & Dice", "Clean & Tidy", "Preserving resources" etc. all resolve. */
function spellKey(name) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");
}
const SPELL_INDEX = new Map(SPELLS.map(s => [spellKey(s.name), s]));
SPELL_INDEX.set(spellKey("Care of Beasts"), SPELLS.find(s => s.name === "Treating Beasts"));

export function findSpell(name) {
  return SPELL_INDEX.get(spellKey(name)) ?? null;
}

/** Item data for an official spell, ready for createEmbeddedDocuments / a compendium. */
export function spellItemData(spell) {
  return {
    name: spell.name,
    type: "spell",
    img: "icons/svg/book.svg",
    system: {
      path: spell.path,
      ability: SPELL_PATHS[spell.path].ability,
      successes: spell.level,
      description: spell.description,
      recastCost: 1
    }
  };
}

/** Meowgic accidents (p.38), rolled when a player forces a failed spell to work. */
export const MEOWGIC_ACCIDENTS = [
  { roll: 1, effect: "works", text: "The spell works normally, as if the roll was successful." },
  { roll: 2, effect: "freeRecast", text: "The spell does not work, but the Kitten can try to re-cast it during this day without spending 1 Heart point." },
  { roll: 3, effect: "works", text: "The duration of the spell is random—it can last much longer or stop after a few seconds (the Storyteller decides)." },
  { roll: 4, effect: "loseHeart", text: "The Kitten loses 1 Heart point and the spell works normally." },
  { roll: 5, effect: "works", text: "The spell affects a completely different target than the one chosen by the Kitten. Select randomly or the Storyteller can choose." },
  { roll: 6, effect: "fails", text: "The spell does not work at all." }
];

/** Claw Catfight injuries (p.60), rolled by a Kitten dropped to 0 Heart in a Claw Catfight. */
export const CLAW_INJURIES = [
  { roll: 1, name: "Bruises", text: "The Kitten escapes with only a few scratches and a little less hair.", statuses: [] },
  { roll: 2, name: "Minor injury", text: "The Kitten gets a disadvantage for all its rolls until the end of the next rest stop (see page 53).", statuses: ["dnk-injured"] },
  { roll: 3, name: "Major injury", text: "The Kitten gets a disadvantage to all its rolls until the end of the adventure.", statuses: ["dnk-injured-major"] },
  { roll: 4, name: "Serious injury", text: "The Kitten cannot do anything for 1 full day.", statuses: ["dnk-incapacitated"] },
  { roll: 5, name: "Very serious injury", text: "The Kitten cannot do anything for at least 1d6 full days and cannot use meowgic until the end of the adventure.", statuses: ["dnk-incapacitated", "dnk-no-meowgic"], rollDays: true },
  { roll: 6, name: "Critical injury", text: "The Kitten cannot do anything for 1d6 days and cannot use meowgic until the end of the adventure. He also permanently loses 1 point in one of his abilities (the player chooses); if the chosen ability is Strong or Smart, the Kitten therefore loses 1 Heart point.", statuses: ["dnk-incapacitated", "dnk-no-meowgic"], rollDays: true, loseAbility: true }
];

/** Character trait table (p.24): 1d6 for the column, 1d6 for the row - 18 equally likely traits. */
export const CHARACTER_TRAITS = [
  "Loving", "Loud", "Angry", "Cold", "Greedy", "Snobbish",
  "Uncertain", "Unruly", "Sad", "Naive", "Proud", "Lazy",
  "Domineering", "Scared", "Bold", "Scatty", "Stubborn", "Shy"
];

/**
 * The 18 Childhoods (pp.25-35). Each grants a Cattribute and five starting Purr-ecious items.
 * `category`: kingdom (d6 1-4), odd (Odd Ones Out, d6 5), other (Other Animals, d6 6).
 */
const CHILDHOOD_META = [
  { name: "Young Noble", category: "kingdom" },
  { name: "Country Kitten", category: "kingdom" },
  { name: "Kitty Merchant", category: "kingdom" },
  { name: "Soldier's Child", category: "kingdom" },
  { name: "Apprent-hiss", category: "kingdom" },
  { name: "Abandoned Kitten", category: "kingdom" },
  { name: "Meowge", category: "odd", note: "The spellbook grants two additional spells beyond the usual two." },
  { name: "Hooting Kitten", category: "odd" },
  { name: "Were-kitten", category: "odd" },
  { name: "Meowmy", category: "odd" },
  { name: "Catnut", category: "odd" },
  { name: "Future Kitten", category: "odd" },
  { name: "Puppy", category: "other" },
  { name: "Sparrowchick", category: "other" },
  { name: "Raccoon", category: "other" },
  /** The Bearcub's last entry is "two additional items of the player's choice" - a note, not an item. */
  { name: "Bearcub", category: "other", extraSlots: 2, dropLastItem: true, note: "Choose two more Purr-ecious items with the Storyteller." },
  { name: "Kittenfish", category: "other" },
  { name: "Hoglet", category: "other" }
];

export const CHILDHOODS = CHILDHOOD_META.map(meta => {
  const text = CHILDHOOD_TEXT[meta.name];
  const items = meta.dropLastItem ? text.items.slice(0, -1) : text.items;
  return { ...meta, description: text.description, cattribute: text.cattribute, cattributeText: text.cattributeText, items };
});

export const CHILDHOOD_CATEGORIES = {
  kingdom: "Kittens of the Kingdom",
  odd: "Odd Ones Out",
  other: "Other Animals"
};

/** Suggested Kitten names (p.43). */
export const KITTEN_NAMES = [
  "Akira", "Apocalypto", "Applesos", "Avaristo", "Bacon", "Barnaby", "Baron", "Be-bop", "Bearchin", "Bib", "Bibby", "Bikky",
  "Blondie", "Bloody Mary", "Bobbin", "Bobby", "Bonsai", "Bonuz", "Bouncer", "Brains", "Brutaldelux", "Bubbles", "Caramel",
  "Caviar", "Champ", "Charmette", "Chip", "Clucky", "Comma", "Constructian", "Cookie", "Coriander", "Cutlet", "Cuzza", "Daffy",
  "Dancer", "Dee-twenty", "Didi", "Dirtbag", "Dobby", "Dolly", "Doodle", "Dumpling", "Felix", "Fennel", "Fishkin", "Fishtank",
  "Flea", "Gassy", "Gecko", "Gerald", "Gideon", "Glissy", "Glitch", "Grasser", "Greasy", "Griddle", "Grizzler", "Ham",
  "Hazelnut", "Helley", "Higgsboson", "Horace", "HP", "Idol", "Iggy", "Jaypeg", "JJ", "Julius", "Katkit", "Kaypop", "Ketchup",
  "Kiwi", "Leckyfan", "Leo", "Lilac", "Lilith", "Loaf", "Lucifer", "Lulu", "Maggie", "Masher", "Matty", "Maydin", "Michelle",
  "Mildew", "Mimi", "Mimsy", "Minikin", "Monacle", "Mopsy", "Mr. Mustache", "Mrs. Kissy", "Muffy", "Musashi", "Myleen",
  "Nailer", "Neo", "Noodle", "Nougat", "Oreo", "Pancake", "Paprika", "Papto", "Peanut", "Pesto", "Pie", "Pinky", "Pistachio",
  "Pitcher", "Pizza", "Planer", "Plato", "Pompom", "Princess", "Pudding", "Raffles", "Raptup", "Ravioli", "Raymond", "Risotto",
  "Roastie", "Rocket", "Ron", "Rorschach", "Rumbabba", "Sausage", "Schrödinger", "Scowler", "Scuttlebutt", "Seeyo",
  "Sgt. Pepper", "Shakira", "Shelley", "Smartie", "Snowflake", "Snowy", "Snuffles", "Soapy", "Soupy", "Soya", "Spoon", "Spud",
  "Stan", "Sushi", "Sweetie", "Taffy", "Tank", "Teapot", "Terror", "Thingmajig", "Tigger", "Tiktok", "Tofu", "Toto", "Tufty",
  "Twine", "Unicorn", "Ventino", "Vision", "Walter", "Whiffy", "Will", "Windy", "Wotsit", "Yessir", "Yoggy", "Yogi", "Yoshi",
  "Youngun"
];

/** Guide for building Extras by difficulty (p.65). */
export const EXTRA_TIERS = {
  weak: { label: "Weak", points: 6, skills: "1", spells: "0", items: "1" },
  average: { label: "Average", points: 8, skills: "2", spells: "1-2", items: "2-3" },
  strong: { label: "Strong", points: 10, skills: "3", spells: "2-3", items: "3-4" },
  veryStrong: { label: "Very strong", points: 12, skills: "4", spells: "3+", items: "4-5" }
};
