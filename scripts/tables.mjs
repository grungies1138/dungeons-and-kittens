import {
  CHARACTER_TRAITS, CHILDHOODS, CHILDHOOD_CATEGORIES, KITTEN_NAMES, MEOWGIC_ACCIDENTS, CLAW_INJURIES
} from "./content.mjs";
import { ensureWorldPack } from "./packs.mjs";

/** Bump whenever table contents change so existing worlds get the refreshed tables. */
export const TABLES_DATA_VERSION = 2;

/**
 * One text result. `name`/`description` are the v13+ fields and `text` the older one; whichever
 * the running Foundry version doesn't know is simply dropped by its data model.
 */
function result(text, low, high, weight = 1) {
  return {
    type: CONST.TABLE_RESULT_TYPES?.TEXT ?? "text",
    name: text, description: text, text,
    weight,
    range: [low, high]
  };
}

/** Equally likely entries, formula 1dN. */
function uniformTable(name, description, entries) {
  return {
    name, description,
    formula: `1d${entries.length}`,
    replacement: true, displayRoll: true,
    results: entries.map((text, i) => result(text, i + 1, i + 1))
  };
}

/** Weighted entries: [[text, weight], ...], formula 1d(total weight). */
function weightedTable(name, description, entries) {
  let low = 1;
  const results = entries.map(([text, weight]) => {
    const r = result(text, low, low + weight - 1, weight);
    low += weight;
    return r;
  });
  return { name, description, formula: `1d${low - 1}`, replacement: true, displayRoll: true, results };
}

/**
 * The book rolls a d6 for the group (1-4 Kittens of the Kingdom, 5 Odd Ones Out, 6 Other
 * Animals) then a d6 within it, so each Kingdom childhood is 4x as likely as the others.
 */
function childhoodTable() {
  return weightedTable(
    "Childhood (p.25)",
    "Rolls a Childhood with the book's odds. Use the book icon next to the Childhood field on a Kitten sheet to apply one.",
    CHILDHOODS.map(c => [`${c.name} (${CHILDHOOD_CATEGORIES[c.category]}) - Cattribute: ${c.cattribute}`, c.category === "kingdom" ? 4 : 1])
  );
}

/**
 * Selene's Nightmare (pp.233-244): a dream-dungeon built from random tables. Roll a location
 * (twice - entrance and exit), then atmosphere and what's there, then what happens. Entries are
 * condensed summaries; the book's nested sub-rolls are folded into each line.
 */
const NIGHTMARE = {
  locations: [
    ["A winding forest trail (straight or forking, easy or overgrown) - go to Atmosphere, then Adventures.", 2],
    ["A steep slope: descending needs a Smart test, climbing a Strong test, or lose 1 Heart - go to Atmosphere.", 1],
    ["A clearing, tiny to huge: an overgrown square, an old shack, a sunken tractor, a sculpted garden, a restful stream (+1 Heart each), or a lamplit town square - go to Atmosphere, then Adventures.", 1],
    ["An obstacle blocks the way (brambles, rockfall, broken bridge, chasm, toxic marsh, a warning sign) - go to Atmosphere, then turn back: revisit a place, or the Kittens get lost.", 1],
    ["A door (wooden, painted, metal, tiny glass, bronze, or a submarine hatch) - unlocked, locked (Smart to pick, Strong to break), or blocked (Strong) - go to Atmosphere.", 1]
  ],
  atmosphere: [
    "Shadows twist the Kittens' lights into strange stories.",
    "Something unseen whispers in the trees.",
    "Frozen, motionless animals everywhere, reacting to nothing.",
    "Everything is blurry, as if seen through mist or glass.",
    "Heavy, humid air, like a storm that never breaks.",
    "A sudden, deathly cold wind that stings the paws.",
    "All color drains to gray.",
    "Colors turn wrong, eerie, oversaturated.",
    "Sound stops carrying - no one can speak or hear.",
    "It grows darker and darker until the trail is nearly lost.",
    "A deafening racket of insects and small creatures.",
    "Curious eyes open on leaves, trunks, flowers, and stones."
  ],
  found: [
    "Nothing special - plants, brambles, ferns, dubious fungi.",
    "Trash everywhere - leaking pipes, leftovers, mold, unidentifiable stinking things.",
    "Ruins of the olden days - broken electronics, gears, rusty metal.",
    "Tracks - beasts, animals, tires, or strange machinery.",
    "Markings - old graffiti, road signs, arrows, fresh scribbles, carvings.",
    "Food - a warm teapot, a set tea table, fruit, a fridge of pizza, a roast in an oven.",
    "Writing - a poem, a warning, a plea for help, sinister symbols, meowgic runes.",
    "Bones - animals, beasts, maybe something ancient and giant.",
    "A breeze carrying strange sounds, smells, or half-heard words.",
    "Huge, glowing, noisy mushrooms puffing clouds of spores.",
    "Old walls with alcoves - candles, statues, odd glowing machines, little springs.",
    "Pillars - carved, glowing, musical, or fitted with levers and switches."
  ],
  adventures: [
    ["Nothing happens - everything seems frozen in time.", 1],
    ["A hazard (roll on Nightmare: Hazard).", 1],
    ["A discovery (roll on Nightmare: Discovery).", 2],
    ["An encounter (roll on Nightmare: Encounter).", 2]
  ],
  hazards: [
    "Gas hisses from a pipe: protect yourself with a fitting item or lose 1 Heart; flee (Strong) or find a fix (Smart).",
    "The ceiling cracks and falls: Strong test or be buried and lose 1 Heart.",
    "A cloud of itchy, biting insects: Cute test or lose 1 Heart; flee or drive them off.",
    "Live cables snap and roar across the floor: Smart test to avoid them or lose 1 Heart.",
    "A door slams open and shut at random (an old airlock): time it with a Smart test or lose 1 Heart.",
    "The floor splits and collapses: Strong test to jump clear or lose 1 Heart."
  ],
  discoveries: [
    "A hidden passage to a secret room (through ceiling, floor, or wall) holding a hazard, an encounter, or treasure.",
    "A gaping chasm - maybe with treasure glinting at the bottom.",
    "A working drinking fountain from the olden days.",
    "Strange but edible food in silver packets.",
    "A metal box - maybe locked (Smart to pick, Strong to force), maybe empty, maybe treasure or an old expedition's leftovers (food, treasure, rope, pickax, torches).",
    "A metal box - maybe locked (Smart to pick, Strong to force), maybe empty, maybe treasure or an old expedition's leftovers (food, treasure, rope, pickax, torches)."
  ],
  encounters: [
    ["Panicked beasts ready to fight: hungry rats, an angry boar, a scruffy bear, grumpy ferrets, aggressive crows, or thieving bats.", 2],
    ["Lost animals: explorer pigs, treasure-hunting toads, wanted pirate crabs, Junkyard mercenary dogs, fleeing peasant foxes, or fish in wetsuits.", 2],
    ["Nightmare monsters: a huge hungry eye, giant centipedes, a Kitten-eating plant, beetle slaves, a voracious gropkin, or a bloodthirsty molevamp.", 1],
    ["A rickety robot from the olden days: a tracked worker, a big walking talker, or a small annoying flyer.", 1]
  ],
  treasure: [
    "High-quality tools.",
    "A small fortune in strange gems.",
    "An extraordinary potion.",
    "A baffling book from the olden days - valuable to a scholar or collector.",
    "An unknown material for wonderful clothes or amazing armor.",
    "A rare, useless machine from the olden days: a telephone, a laptop, or a small robot insect."
  ]
};

function buildTables() {
  return [
    uniformTable("Character Trait (p.24)", "The book's trait table: 1d6 for the column, 1d6 for the row - 18 equally likely traits.", CHARACTER_TRAITS),
    childhoodTable(),
    uniformTable("Kitten Name (p.43)", "Suggested Kitten names from the Core Rulebook.", KITTEN_NAMES),
    uniformTable("Meowgic Accident (p.38)", "Roll when a player forces a failed spell to work. The chat card's \"Force it\" button rolls this for you.",
      MEOWGIC_ACCIDENTS.map(a => a.text)),
    uniformTable("Claw Catfight Injury (p.60)", "Rolled automatically when a Kitten in a Claw Catfight drops to 0 Heart.",
      CLAW_INJURIES.map(i => `${i.name}: ${i.text}`)),
    weightedTable("Nightmare: Location", "Selene's Nightmare - roll twice: the entrance, then the exit.", NIGHTMARE.locations),
    uniformTable("Nightmare: Atmosphere", "Selene's Nightmare - the mood of a location.", NIGHTMARE.atmosphere),
    uniformTable("Nightmare: What Is Found Here", "Selene's Nightmare - what lies around.", NIGHTMARE.found),
    weightedTable("Nightmare: Adventure", "Selene's Nightmare - what happens here.", NIGHTMARE.adventures),
    uniformTable("Nightmare: Hazard", "Selene's Nightmare hazards.", NIGHTMARE.hazards),
    uniformTable("Nightmare: Discovery", "Selene's Nightmare discoveries.", NIGHTMARE.discoveries),
    weightedTable("Nightmare: Encounter", "Selene's Nightmare encounters - match numbers to the party, and not every one has to be a fight.", NIGHTMARE.encounters),
    uniformTable("Nightmare: Treasure", "Selene's Nightmare treasure.", NIGHTMARE.treasure)
  ];
}

/** "Dungeons & Kittens: Tables" - the Core Rulebook's roll tables. */
export function ensureTablesCompendium() {
  return ensureWorldPack({
    name: "dnk-tables",
    label: "Dungeons & Kittens: Tables",
    type: "RollTable",
    version: TABLES_DATA_VERSION,
    setting: "tablesDataVersion",
    build: buildTables
  });
}
