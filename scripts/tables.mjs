import {
  CHARACTER_TRAITS, CHILDHOODS, CHILDHOOD_CATEGORIES, KITTEN_NAMES, MEOWGIC_ACCIDENTS, CLAW_INJURIES
} from "./content.mjs";
import { ensureWorldPack } from "./packs.mjs";

/** Bump whenever table contents change so existing worlds get the refreshed tables. */
export const TABLES_DATA_VERSION = 3;

/**
 * One text result. `name`/`description` are the v13+ fields and `text` the older one; whichever
 * the running Foundry version doesn't know is dropped by its data model.
 */
function result(text, low, high, weight = high - low + 1) {
  return { type: CONST.TABLE_RESULT_TYPES?.TEXT ?? "text", name: text, description: text, text, weight, range: [low, high] };
}

/** Equally likely entries, formula 1dN. */
function uniform(name, description, entries) {
  return { name, description, formula: `1d${entries.length}`, replacement: true, displayRoll: true,
    results: entries.map((text, i) => result(text, i + 1, i + 1)) };
}

/** A d6 table with ranged results: [[low, high, text], ...]. */
function ranged(name, description, entries, die = 6) {
  return { name, description, formula: `1d${die}`, replacement: true, displayRoll: true,
    results: entries.map(([low, high, text]) => result(text, low, high)) };
}

/** A 1d6-row x 1d6-column grid (pp.250-251) flattened to 36 equally likely results. */
function grid(name, description, rows) {
  return uniform(name, description, rows.flat());
}

/** Childhood with the book's odds (p.25): d6 1-4 Kingdom, 5 Odd One Out, 6 Other Animal, then d6 within. */
function childhoodTable() {
  let low = 1;
  const results = CHILDHOODS.map(c => {
    const weight = c.category === "kingdom" ? 4 : 1;
    const r = result(`${c.name} (${CHILDHOOD_CATEGORIES[c.category]}) - Cattribute: ${c.cattribute}`, low, low + weight - 1);
    low += weight;
    return r;
  });
  return { name: "Childhood (p.25)", description: "Rolls a Childhood with the book's odds. Use the book icon next to the Childhood field on a Kitten sheet to apply one.",
    formula: `1d${low - 1}`, replacement: true, displayRoll: true, results };
}

/* -------------------------------------------- */
/*  Selene's Nightmare (pp.233-244)             */
/* -------------------------------------------- */

const NM = "Nightmare";
function nightmareTables() {
  return [
    ranged(`${NM}: Location`, "Roll twice: the first result is the entrance the Kittens emerge into, the second the exit that leads out (p.234).", [
      [1, 2, "A trail that weaves through the trees; roll on Nightmare: Trail and Nightmare: Trail Direction (then Atmosphere, then Adventures)."],
      [3, 3, "A steep slope; roll on Nightmare: Slope and Nightmare: Slope Terrain (then Atmosphere)."],
      [4, 4, "A clearing among the trees; roll on Nightmare: Clearing Size and Nightmare: Clearing (then Atmosphere, then Adventures)."],
      [5, 5, "An obstacle that prevents further travel; roll on Nightmare: Obstacle (then Atmosphere), then make a U-turn with Nightmare: U-turn."],
      [6, 6, "A door that leads somewhere; roll on Nightmare: Door and Nightmare: Door Lock (then Atmosphere)."]
    ]),
    uniform(`${NM}: Trail`, "p.234", [
      "Straight and easy to follow.", "Tortuous and difficult to walk along.", "Marked by large stones.",
      "Barely visible wild animal tracks.", "Hidden beneath leaves and brambles.", "A wet and muddy valley floor."
    ]),
    ranged(`${NM}: Trail Direction`, "p.234", [
      [1, 3, "The trail is straight."],
      [4, 6, "The trail branches off—the kittens must frequently choose to go left or right, and it is easy to get lost."]
    ]),
    ranged(`${NM}: Slope`, "p.234", [
      [1, 3, "Must descend carefully to avoid falling (each Kitten must pass a Smart test or lose 1 Heart point)."],
      [4, 6, "Must climb and scramble without getting tired (Each Kitten must pass a Strong test or lose 1 Heart point)."]
    ]),
    uniform(`${NM}: Slope Terrain`, "p.234", [
      "A rocky, unstable cliff.", "A wet, slippery mound.", "A steep, overgrown drop.",
      "An embankment with lots of dark burrows.", "A mound of red earth with large, carved stones.", "An unstable, paw-breaking scree."
    ]),
    ranged(`${NM}: Clearing Size`, "p.235", [
      [1, 2, "Very small, just large enough to catch a glimpse of the sky above."],
      [3, 4, "Medium sized, big enough for a few tents or a hut."],
      [5, 6, "Huge, will take some time to cross it."]
    ]),
    uniform(`${NM}: Clearing`, "p.235", [
      "An ancient, paved square with a fountain and ivy-covered statues of humans and animals.",
      "In the middle of an expanse of yellowed grass is a wobbly-looking abandoned shack, filled with things in old boxes.",
      "An old tractor from the human era, half sunk in mud, in the middle of a massively overgrown corn field.",
      "A beautifully tendered formal garden, its boxwood bushes painstakingly sculpted with a sickle by a big-bare-butt dressed in rags.",
      "A wide stream flows through, with white waters that sing to, refresh, and rest the travelers (+1 Heart point to each Kitten).",
      "A paved town square, with illuminated, bent-over street lamps, a large, abstract white marble statue covered with ivy, and a few benches."
    ]),
    uniform(`${NM}: Obstacle`, "p.236", [
      "The path disappears in a tangle of brambles and impenetrable bushes. No matter how much they are cut, the plants grow back immediately.",
      "A rockfall that blocks all progress.",
      "An old, broken bridge jutting out over a swirling, foaming river.",
      "A large crevasse, a chasm, or a deep, ominous hole.",
      "A noxious marsh, with acidic, polluted waters.",
      "An old man-made sign stating trespassers will be shot."
    ]),
    ranged(`${NM}: U-turn`, "p.236", [
      [1, 2, "The Kittens go back to a place of their choice that they have already visited (or roll another location)."],
      [3, 4, "The kittens go back to the last place they visited (or roll another location)."],
      [5, 6, "The Kittens are lost: throw away their map and start a new one (if they are mapping), then roll a new location."]
    ]),
    uniform(`${NM}: Door`, "p.236", [
      "A solid wooden door.", "A beautiful wooden door painted in a bright or pastel color.", "A heavy metal door set into a wall.",
      "A very small glass door in an embankment.", "An enormous bronze door.", "A submarine hatch with a wheel to open it."
    ]),
    ranged(`${NM}: Door Lock`, "p.236", [
      [1, 2, "The door is not locked."],
      [3, 4, "The door is locked (lock, bolt, or strange box with flashing lights, and so on)—Kittens may try to pick it (Smart test) or break it (Strong test)."],
      [5, 6, "The door is blocked (jammed, swollen, barred by rocks, trees, trash, recycled materials, or old objects, and so on). The way will have to be cleared (Strong test)."]
    ]),
    uniform(`${NM}: Atmosphere`, "The nightmare's atmosphere... (p.238)", [
      "Ominous shadows bring to life strange stories in the lights the Kittens carry...",
      "An invisible presence in the trees whispers words nobody understands...",
      "Unmoving animals and beasts are scattered around, motionless and frozen in time, who do not react to anything...",
      "Everything is blurred, as if seen through mist or glass...",
      "The air is heavy and humid, as if awaiting a storm that never comes...",
      "It is suddenly deathly cold, with a freezing wind that burns the fingers...",
      "All colors disappear, leaving everything drab and gray...",
      "Colors are all wrong, strange, and saturated...",
      "Sound no longer carries, it is impossible to speak or hear...",
      "It gets darker and darker—it's almost impossible to follow the trail...",
      "Insects and small creatures make a huge racket—it is impossible to hear yourself think...",
      "Inquisitive eyes appear on leaves, tree trunks, flowers, and stones..."
    ]),
    uniform(`${NM}: What Is Found Here`, "p.239", [
      "Nothing in particular: Common plants, brambles, grasses, ferns, and some more or less poisonous fungi...",
      "Trash everywhere: Impossible-to-identify garbage, filthy discharge from cracked pipes, food leftovers, mold, maggots, and unknown, stinking things...",
      "Ruined remnants of the past: Broken electronics, intricate gears, bits of computers, and lumps of rusty metal that are beyond recognition...",
      "Tracks and footprints: Beasts and animals, tires and tracks, or odd machinery...",
      "Markings: Ancient graffiti, traffic signs, direction arrows, recent scribbles, or carvings in the bark of trees...",
      "Food: A big, warm teapot, a table set for tea, bags of fruit and vegetables, a fridge full of pizza and sodas, or an oven with a roast dinner inside...",
      "Writing: A poem, a warning, a cry for help, sinister symbols, or meowgic runes...",
      "Bones: Of animals and beasts, maybe even an ancient giant...",
      "A breeze: It carries sound of unknown origin, a strange smell, distant words that are hard to make out, or a shiver down the spine...",
      "Mushrooms: Shiny, massive, making strange noises, and releasing clouds of spores, etcetera.",
      "Ancient walls with small alcoves: Candles, statues, odd, luminous machines, or small cold or hot springs...",
      "One or more pillars: Some engraved with symbols, others luminous, some that play music when approached, or some with levers and switches on the side..."
    ]),
    ranged(`${NM}: Adventure`, "p.241", [
      [1, 1, "Nothing to report, everything seems to be frozen in time and space."],
      [2, 2, "A hazard (roll on Nightmare: Hazard)."],
      [3, 4, "A discovery (roll on Nightmare: Discovery)."],
      [5, 6, "An encounter (roll on Nightmare: Encounter)."]
    ]),
    uniform(`${NM}: Hazard`, "p.241", [
      "A whistling sound is heard and gas starts flowing from a pipe. It spreads everywhere. Quickly, the Kittens must protect themselves (each Kitten must use an appropriate object or be poisoned, with the loss of 1 Heart point). They must flee (Strong test) or come up with a solution (Smart test).",
      "A deafening cracking noise. A piece of the ceiling drops down. The Kittens must react to avoid being crushed (each must pass a Strong test or be buried and lose 1 Heart point).",
      "A cloud of unknown, aggressive insects comes out of nowhere. They attack the Kittens. Their bites are really itchy (each Kitten must pass a Cute test or lose 1 Heart point). Kittens must flee or chase them away.",
      "Strange ropes hang from the ceiling and all over the floor. They make roaring and snapping sounds (they are in fact live electrical cables). Kittens must progress and avoiding touching them (each Kitten must pass a Smart test or be electrocuted, losing 1 Heart point).",
      "A strange door creaks open and closed by itself. Its pattern and speed are random (it is, in fact, a still-functioning airlock). The Kittens will have to count carefully and race through at the risk of getting stuck (each must pass a Smart test or lose 1 Heart point).",
      "With a thunderous roar, the floor under the paws of the Kittens splits and collapses. They must jump or grab something to avoid falling (each must pass a Strong test or lose 1 Heart point)."
    ]),
    uniform(`${NM}: Discovery`, "p.242", [
      "A concealed passageway that gives access to a secret room (roll on Nightmare: Secret Room Entrance and Nightmare: Secret Room, then Atmosphere).",
      "A deep, gaping chasm (roll on Nightmare: Chasm).",
      "A still-functioning water fountain from the olden days. Kittens can fill up.",
      "Food, odd but edible, and packed in strange silver bags.",
      "A metal box (roll on Nightmare: Metal Box Lock and Nightmare: Metal Box).",
      "A metal box (roll on Nightmare: Metal Box Lock and Nightmare: Metal Box)."
    ]),
    ranged(`${NM}: Secret Room Entrance`, "How do they get into the secret room? (p.242)", [
      [1, 2, "Through a collapsed ceiling."], [3, 4, "Through a hole in the ground."], [5, 6, "Through a hole in the wall."]
    ]),
    ranged(`${NM}: Secret Room`, "What does the secret room contain? (p.242)", [
      [1, 2, "A hazard (roll on Nightmare: Hazard)."], [3, 4, "An encounter (roll on Nightmare: Encounter)."], [5, 6, "Treasure (roll on Nightmare: Treasure)."]
    ]),
    ranged(`${NM}: Chasm`, "Can you make out some treasure at the bottom? (p.242)", [
      [1, 4, "No."], [5, 6, "Yes, but you still have to get down to it (roll on Nightmare: Treasure)."]
    ]),
    ranged(`${NM}: Metal Box Lock`, "Is it locked? (p.242)", [
      [1, 3, "Yes, it must be picked open (Smart test) or forced (Strong test)."], [4, 6, "No."]
    ]),
    ranged(`${NM}: Metal Box`, "Does it contain something interesting? (p.242)", [
      [1, 3, "No, it's empty."],
      [4, 5, "Yes, some treasure (roll on Nightmare: Treasure)."],
      [6, 6, "Remnants of a previous expedition (roll on Nightmare: Expedition Remnants)."]
    ]),
    ranged(`${NM}: Expedition Remnants`, "Is there anything to salvage? (p.242)", [
      [1, 3, "No."],
      [4, 4, "Yes: Food."],
      [5, 5, "Yes: Some treasure (roll on Nightmare: Treasure)."],
      [6, 6, "Yes: Tools - a rope and a climbing hook, a pickax and a shovel, or torches and a tinderbox (1-2 / 3-4 / 5-6)."]
    ]),
    ranged(`${NM}: Encounter`, "Adapt the number of creatures to the number of Kittens. Depending on how the Kittens behave, an encounter can lead to a Catfight or a conversation, an information swap, help, and so on (p.243).", [
      [1, 2, "One or more beasts who are panicked by the situation and ready to fight (roll on Nightmare: Beasts)."],
      [3, 4, "One or more animals who have no idea what they are doing there (roll on Nightmare: Lost Animals)."],
      [5, 5, "One or more nightmarish monsters (roll on Nightmare: Monsters)."],
      [6, 6, "A ramshackle robot from the olden days (roll on Nightmare: Robot)."]
    ]),
    uniform(`${NM}: Beasts`, "p.243", ["A horde of hungry rats.", "An angry boar.", "An unkempt bear.", "Disagreeable ferrets.", "Aggressive crows.", "Thieving bats."]),
    uniform(`${NM}: Lost Animals`, "p.243", [
      "Lost explorer pigs.", "Treasure-hunting toads.", "Wanted pirate crabs.", "Mercenary dogs from the Junkyard.",
      "Peasant foxes on the run.", "Fish in wetsuits looking for an underground lake."
    ]),
    uniform(`${NM}: Monsters`, "p.243", [
      "A big, hungry eye.", "Giant centipedes.", "A man- (and Kitten-) eating plant.", "Beetle slaves.",
      "A voracious gropkin.", "A bloodthirsty molevamp."
    ]),
    ranged(`${NM}: Robot`, "p.243", [
      [1, 2, "A caterpillar-tracked robot worker."], [3, 4, "A big, walking, talking robot."], [5, 6, "A small, annoying, flying robot."]
    ]),
    uniform(`${NM}: Treasure`, "p.244", [
      "Advanced, good quality tools.",
      "A small fortune in strange gems.",
      "An extraordinary potion.",
      "An incomprehensible book from the olden days, valuable for a scholar or collector.",
      "Unknown material, which can be used to make wonderful clothes or amazing armor.",
      "A rare, unusable machine from the olden days: a telephone, a laptop, or a small robot insect (1-2 / 3-4 / 5-6)."
    ])
  ];
}

/* -------------------------------------------- */
/*  Setting tables                              */
/* -------------------------------------------- */

function settingTables() {
  return [
    uniform("Cat Tree City: Upper Floors (p.88)", "Rounding the corridors, Kittens may find:", [
      "Walter in an alcove, whispering with a hooded figure.",
      "A troop of guards on a tour of the ramparts.",
      "The meowge's laboratory, which is temporarily abandoned.",
      "Walter's favorite fine pastry shop—closed to the public!",
      "A glass gallery full of distorting mirrors.",
      "Behind the scenes of a theater where the latest fashionable play is being staged."
    ]),
    uniform("Cat Tree City: Marketplace Objects (p.91)", "Examples of unique marketplace objects.", [
      "A human-made, folding multifunction tool.",
      "A pair of high magnification binoculars.",
      "A photo of a (clothed) big-bare-butt with a cat on their lap.",
      "A rock-solid rope of spidersilk.",
      "A small, domesticated octopus in a large jar of water.",
      "A plastic tiara with shiny gemstones (very precious!)"
    ]),
    uniform("The Smoking Cat: Dish of the Day (p.97)", "", [
      "Grilled corn-on-the-cob and mushroom skewer with garlic and parsley.",
      "Barbecued sweet potato fries with sliced tomato and zucchini.",
      "Breaded onion, potato cakes, and avocado salad.",
      "Veggie balls (no meat), mushroom sauce, and polenta.",
      "Toasted tomato parcels, sweet peppers, zucchini, and asparagus.",
      "Very spicy ratatouille (hot!)"
    ]),
    uniform("The Smoking Cat: Dessert of the Day (p.97)", "", [
      "Apple pie with almonds.", "Melon and mint sorbet.", "Apple sauce with bits of biscuits.",
      "Hot chocolate with cinnamon.", "Banana chocolate muffin.", "Blueberry and fig crumble."
    ]),
    uniform("Downtown: What Can Be Found (p.122)", "What can be found Downtown...", [
      "A stadium with a dug-up pitch and deflated balls.",
      "An airplane cabin half sunk in a swimming pool.",
      "A glass-and-steel shopping mall filled with big, rotten things.",
      "A cinema still showing a film on a stained screen.",
      "A creepy subway station with a restaurant run by rats.",
      "An old zoo—funnily enough, most animals avoid it..."
    ]),
    uniform("Downtown: Street Corner (p.122)", "On a street corner, you could meet...", [
      "A patrol of foraging rats with headlamps.",
      "A magnificent deer with flowers growing on its antlers, crossing the street.",
      "A small group of merchant ferrets pushing a shopping cart.",
      "Carrier pigeons stopped to share the latest gossip.",
      "A group of animals taking a break in a disused laundromat.",
      "A rat musician playing all sorts of instruments in a music shop."
    ]),
    uniform("Downtown: The GIN (p.122)", "The GIN has some interesting options...", [
      "A boat made of old jam jars, floating in the drains.",
      "A small mechanical car on the rusty rails of an old subway line. It's practical but it sure is squeaky!",
      "A narrow path through a mine or a burrow. There are shiny stones everywhere!",
      "Chuckie, a giant centipede who was tamed by the rats, winds his way through the tunnels.",
      "A homemade submarine built by a clever rat. Let's explore the water table!",
      "A supernatural toilet flush that teleports the traveler to the destination they are thinking of... Makes a big splash!"
    ])
  ];
}

/* -------------------------------------------- */
/*  Crimsonfief (pp.250-252)                    */
/* -------------------------------------------- */

function crimsonfiefTables() {
  const CF = "Crimsonfief";
  return [
    grid(`${CF}: Theme (p.250)`, "A word that serves as a common thread for the dungeon's descriptions, dangers, and encounters.", [
      ["Elevators", "Color", "Fragile", "Laser", "Soft", "Rust"],
      ["Arms", "Crystals", "Cold", "Light", "Shadows", "Twisted"],
      ["Fog", "Debris", "Slippery", "Music", "Wavy", "Swirls"],
      ["Noise", "Electrical", "Squeaks", "Metal", "Pendulum", "Pipes"],
      ["Bubbles", "Balance", "Wet", "Mirrors", "Plants", "Wind"],
      ["Heat", "Small", "Shiny", "Mold", "Stinking", "Faces"]
    ]),
    grid(`${CF}: Room (p.251)`, "Roll once for each of the five rooms.", [
      ["Spaceport", "Recycling center", "Elevator", "Plant-growing warehouse", "Open space", "Amusement arcade"],
      ["Workshop", "Corridors", "Warehouse", "Hospital", "Indoor park", "Conference rooms"],
      ["Offices", "Maintenance tunnels", "Foundry", "Laboratory", "Patio", "Greenhouses"],
      ["Canteen", "Crater", "Hall of mirrors", "Underground lake", "Subway platform", "Thermoelectric unit"],
      ["Barracks", "Kitchen", "Hallway", "Belly of a whale", "Subway train", "Food processing plant"],
      ["Data center", "Particle accelerator", "Hotel", "Microfactory", "Panoramic rotunda", "Ventilation shaft"]
    ]),
    uniform(`${CF}: Ordeal (p.252)`, "The ordeal should involve the abilities and bravery of one Kitten in particular.",
      ["Block", "Challenge", "Technical challenge", "Duel", "Sacrifice", "Transformation"]),
    uniform(`${CF}: Choice (p.252)`, "The choice concerns all the Kittens at once: an ethical or moral issue they must agree on.",
      ["Odd alliance", "Lesser evil", "Opportunity", "Wager", "Secret passage", "Sacrifice"]),
    uniform(`${CF}: Guardian (p.252)`, "One or more creatures defending a place and preventing the Kittens from continuing.",
      ["Interrogator", "Machine", "Villains", "Predators", "Refugees", "Sentries"]),
    uniform(`${CF}: Mirror (p.252)`, "Hellish if things have been simple so far - or skip the roll and make it a haven to rest and heal.",
      ["Assassins", "Disaster", "Rivals", "Disease", "Treachery", "Emergency"]),
    uniform(`${CF}: Trap (p.252)`, "A sudden danger, or the announcement of one the Kittens must find a way to avoid.",
      ["Anomaly", "Environmental hazard", "Malfunction", "Meowgic", "Structural problem", "Poison"])
  ];
}

function buildTables() {
  return [
    uniform("Character Trait (p.24)", "The book's trait table: 1d6 for the column, 1d6 for the row - 18 equally likely traits.", CHARACTER_TRAITS),
    childhoodTable(),
    uniform("Kitten Name (p.43)", "Names for Kittens from the Core Rulebook.", KITTEN_NAMES),
    uniform("Meowgic Accident (p.38)", "Roll when a player forces a failed spell to work. The chat card's \"Force it\" button rolls this for you.",
      MEOWGIC_ACCIDENTS.map(a => a.text)),
    uniform("Claw Catfight Injury (p.60)", "Rolled automatically when a Kitten in a Claw Catfight drops to 0 Heart.",
      CLAW_INJURIES.map(i => `${i.name}: ${i.text}`)),
    ...settingTables(),
    ...crimsonfiefTables(),
    ...nightmareTables()
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
