/**
 * Game data from the Dungeons & Kittens Core Rulebook, used by the sheets, the dice engine, and
 * the auto-built compendiums. Names, numbers, levels, and item lists are carried over as data;
 * every description is paraphrased in this project's own words (page numbers cite the source).
 */

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
export const SPELLS = [
  { name: "Slipper Patrol", path: "tower", level: 1, description: "Until dusk, the caster and companions travel on foot without sore paws, strains, or twisted ankles." },
  { name: "Earthworks", path: "tower", level: 1, description: "A few quick scoops raise a mound or dig a burrow for shelter from weather or foes." },
  { name: "Loud Speaker", path: "tower", level: 1, description: "The caster's voice booms loud enough to carry several hundred yards." },
  { name: "Cat Haven", path: "tower", level: 2, description: "Finds a hidden, warm, sheltered spot to spend the night undisturbed." },
  { name: "First Aid", path: "tower", level: 2, description: "Even mid-fight, restores 1 Heart point to a comrade." },
  { name: "Long Night", path: "tower", level: 3, description: "The caster stays alert all night save a few minutes at dawn, and wakes fully rested - which also resets spells cast the day before." },

  { name: "Blessing of Honor", path: "greatHall", level: 1, description: "Until dawn, the caster can't be ambushed, attacked from behind, or betrayed - lost at once if they act dishonorably." },
  { name: "Fearless", path: "greatHall", level: 1, description: "Until dawn, nothing frightens the caster. Spending 1 Furr-endship extends this to every ally present." },
  { name: "Heart Charm", path: "greatHall", level: 1, description: "Crafts a talisman granting its wearer +1 Heart (and +1 maximum Heart) until dawn." },
  { name: "Words of Wisdom", path: "greatHall", level: 2, description: "Ask the Storyteller one question and instinctively know the right thing to say or do in a confusing situation." },
  { name: "Endless Feed", path: "greatHall", level: 2, description: "Until dawn, the caster can eat anything in any amount without getting sick or poisoned." },
  { name: "Sense Trouble", path: "greatHall", level: 3, description: "The caster knows whether someone is lying, means harm, or hides ill intent - and why." },

  { name: "Leather Apron", path: "craft", level: 1, description: "Until dawn, the caster's clothes shield them from heat, fire, cold, and caustic substances." },
  { name: "Slice and Dice", path: "craft", level: 1, description: "Until dawn, every tool in a workshop or bag is sharp, clean, oiled, and works perfectly." },
  { name: "Safety at Work", path: "craft", level: 1, description: "Until dawn, a place is protected from accidents with tools, heavy loads, or precarious work." },
  { name: "Summon Tools", path: "craft", level: 2, description: "Conjures a bag of the right tools for the job, which vanishes once the work is done." },
  { name: "Quick Fix", path: "craft", level: 2, description: "Repairs a small broken object (chair-sized); each extra success allows something bigger - a wardrobe, then a cart." },
  { name: "Animate Object", path: "craft", level: 3, description: "Until dawn, brings an object up to table size to life: it moves, follows simple orders, and can defend the caster." },

  { name: "The Color of Grass", path: "country", level: 1, description: "Until the next dawn or dusk, the caster's fur slowly shifts to blend into their surroundings." },
  { name: "Treating Beasts", path: "country", level: 1, description: "Fully heals a sick or hurt beast, clears its parasites, and leaves its coat, feathers, or scales gleaming." },
  { name: "Leave no Trace", path: "country", level: 1, description: "Until dawn, the caster's trail vanishes behind them - almost untrackable without meowgic." },
  { name: "Quick as a Flash", path: "country", level: 2, description: "Until the next dawn or dusk, the caster runs twice as fast and three times as long without tiring." },
  { name: "Bug Swarm", path: "country", level: 2, description: "Until dawn, the caster commands nearby insects - keeping them off, or sending them to pester someone in sight." },
  { name: "Talk to Trees", path: "country", level: 3, description: "With a paw on the bark, the caster can talk with a tree; older trees are wiser and chattier." },

  { name: "Clean and Tidy", path: "city", level: 1, description: "Cleans and tidies a room of any size, usually quickly unless it's truly filthy." },
  { name: "Cat's Eyes", path: "city", level: 1, description: "Until dawn, the caster notices every detail around them, making them very hard to pickpocket or tail." },
  { name: "Sound & Vision", path: "city", level: 1, description: "Surrounds the caster with music, sound, and lights - enough to stage a whole show." },
  { name: "Enchanting Voice", path: "city", level: 2, description: "A deep, soothing voice that calms or lulls a creature to sleep, or stirs strong feelings in listeners." },
  { name: "Balancing Cat", path: "city", level: 2, description: "Until dawn, the caster can't lose their footing, slip in mud or snow, or fall from a roof or tree." },
  { name: "Care", path: "city", level: 3, description: "During a break, spend 1 Furr-endship to give 1 Heart to every comrade present at once." },

  { name: "Preserving Resources", path: "caravan", level: 1, description: "Until dawn, food, herbs, and gear are protected from rot or any other decay." },
  { name: "Breathe Under Water", path: "caravan", level: 1, description: "Until the next dawn or dusk, the caster breathes underwater as easily as on land." },
  { name: "Talk to Beasts", path: "caravan", level: 1, description: "Until dawn, the caster can trade a few words with beasts and give them simple orders they may or may not follow." },
  { name: "Long View", path: "caravan", level: 2, description: "Until dawn, the caster sees far into the distance as if through a spyglass." },
  { name: "Hide Things", path: "caravan", level: 2, description: "Tucks paw-sized objects into the caster's fur so well that even a careful search usually misses them." },
  { name: "Feel the Path", path: "caravan", level: 3, description: "Paws on a path, the caster senses how many creatures have passed or lurk nearby - though not what they are." }
];

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
  { roll: 1, effect: "works", text: "The spell works normally, as if the roll had succeeded." },
  { roll: 2, effect: "freeRecast", text: "The spell fizzles, but it can be tried again today without spending Heart." },
  { roll: 3, effect: "works", text: "The spell works, but its duration is unpredictable - far longer, or just a few seconds (Storyteller's call)." },
  { roll: 4, effect: "loseHeart", text: "The spell works, but the caster loses 1 Heart point." },
  { roll: 5, effect: "works", text: "The spell hits a completely different target than intended (random, or the Storyteller picks)." },
  { roll: 6, effect: "fails", text: "The spell doesn't work at all." }
];

/** Claw Catfight injuries (p.60), rolled by a Kitten dropped to 0 Heart in a Claw Catfight. */
export const CLAW_INJURIES = [
  { roll: 1, name: "Bruises", text: "Just a few scratches and some missing fur.", statuses: [] },
  { roll: 2, name: "Minor injury", text: "Disadvantage on every roll until the end of the next rest.", statuses: ["dnk-injured"] },
  { roll: 3, name: "Major injury", text: "Disadvantage on every roll until the end of the adventure.", statuses: ["dnk-injured-major"] },
  { roll: 4, name: "Serious injury", text: "Can do nothing at all for 1 full day.", statuses: ["dnk-incapacitated"] },
  { roll: 5, name: "Very serious injury", text: "Can do nothing for 1d6 full days, and can't use meowgic until the end of the adventure.", statuses: ["dnk-incapacitated", "dnk-no-meowgic"], rollDays: true },
  { roll: 6, name: "Critical injury", text: "Can do nothing for 1d6 days, can't use meowgic until the end of the adventure, and permanently loses 1 point in an ability of the player's choice.", statuses: ["dnk-incapacitated", "dnk-no-meowgic"], rollDays: true, loseAbility: true }
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
export const CHILDHOODS = [
  {
    name: "Young Noble", category: "kingdom",
    description: "Raised on etiquette and fine manners, with all the poise of high birth - which didn't spare them from Walter's law.",
    cattribute: "Inheritance",
    cattributeText: "At the start of every session an animal courier delivers 1 gold coin stamped with Walter's face - a small fortune on the road and a sign the family hasn't forgotten them. The coins are Purr-ecious items that don't count toward the backpack limit.",
    items: ["Fancy clothes", "Special soft fur shampoo", "A finely carved walking cane", "Fragrant, exotic spices", "A \"bling\" object (player's choice)"]
  },
  {
    name: "Country Kitten", category: "kingdom",
    description: "A tough, capable farm Kitten who knows the seasons and which berries are safe - rough manners, but perfectly at home under the stars.",
    cattribute: "Animal Companion",
    cattributeText: "A loyal beast of the player's choosing travels with them. It's a bit brighter than most beasts, helps out, follows simple orders, even takes initiative - a friend, not a servant.",
    items: ["A bird call that sounds like birdsong", "Cereal bars", "A large hat", "A walking stick", "The companion's favorite food"]
  },
  {
    name: "Kitty Merchant", category: "kingdom",
    description: "Grew up among caravans and markets, learning what goods are worth and how to trade them - and still means to make a fortune.",
    cattribute: "Make Friends",
    cattributeText: "Arriving anywhere, a few friendly questions and a smile quickly reveal who to do business with, who to avoid, who's really in charge, and where to find what they need.",
    items: ["A perfumed silk scarf", "Trinkets to trade or give away", "A small set of scales with weights", "A compass", "A time-estimating machine"]
  },
  {
    name: "Soldier's Child", category: "kingdom",
    description: "Raised in the barracks copying the fighters around them, then cast out by their own family on Walter's orders.",
    cattribute: "Heroic Lineage",
    cattributeText: "The child of a famous war hero: the family's enemies fear them and its friends owe them. A heavy reputation to live up to, but handy with allies and foes alike.",
    items: ["Armor", "A guard's spear", "Healing balm", "A pipe and pipe-weed (pinched from the old sergeant)", "Spicy sauce"]
  },
  {
    name: "Apprent-hiss", category: "kingdom",
    description: "A careful young craftsman in training, obsessed with materials and machines - a bit lost without a workshop, but brimming with wild ideas.",
    cattribute: "DIY Superstar",
    cattributeText: "Can build or repair almost anything, however odd, given enough time, tools, and materials.",
    items: ["A three-inch wrench", "A jeweler's magnifying glass", "A leather apron", "An oil can", "Dish soap"]
  },
  {
    name: "Abandoned Kitten", category: "kingdom",
    description: "Left to fend for themselves on the streets, getting by however they could - sometimes on the wrong side of the law.",
    cattribute: "Blend In",
    cattributeText: "Can vanish from pursuers in moments - slipping between shadows, behind cover, up high, or into a tiny hiding spot.",
    items: ["A dark hood", "A light rope and grappling hook", "Mismatched but useful tools", "A collection of handkerchiefs lifted from the rich", "A good, sharp knife"]
  },
  {
    name: "Meowge", category: "odd",
    description: "A gifted student of the Meowgic Academy who rarely left its halls - until Walter decided otherwise.",
    cattribute: "Mystic Mentor",
    cattributeText: "The ghost of an Academy teacher tags along to supervise. Wise and full of knowledge, but can never act physically - and insists on manners, caution, and study time.",
    items: ["A small meowgic spellbook (holding two extra spells)", "A meowgic wand", "A large hat covered in strange symbols", "An odd broom that doubles as a walking stick", "A china tea set"],
    note: "The spellbook grants two additional spells beyond the usual two."
  },
  {
    name: "Hooting Kitten", category: "odd",
    description: "Very old, yet cursed never to grow up; lives in lonely country mansions, the subject of rumor, and mostly comes out at night.",
    cattribute: "Mysterious",
    cattributeText: "Many powers, all working only at night: turning into an owl, glowing with reflected moonlight like a lamp, walking on water, and reading tarot with surprising results.",
    items: ["A long, dark cape", "Sunglasses", "A large bone flute", "Tarot cards", "A small, unbreakable mirror"]
  },
  {
    name: "Were-kitten", category: "odd",
    description: "From an ancient bloodline said to be the first to gain speech; troubled dreams and a short fuse keep them far from towns.",
    cattribute: "Overexcited!",
    cattributeText: "Blindingly fast - tasks take half the time, and they can act out of turn. When scared, angry, or overexcited they turn into an unsettling half-dog, half-cat creature.",
    items: ["A hairstyling brush", "Thick, warm, waterproof boots", "A wooden smiling-cat mask", "A big bell on a silver chain", "A long chef's knife"]
  },
  {
    name: "Meowmy", category: "odd",
    description: "An awakened, hairless feline once worshipped alongside ancient kings - grand, a little pompous, and still adorable.",
    cattribute: "Children of the Sun",
    cattributeText: "Never needs food, drink, or sleep, ignores heat and cold, and never tires; sunshine makes them radiant. Getting wet leaves them speechless and miserable.",
    items: ["An ornate, jeweled golden chestplate", "Paintbrushes and paints", "A comfy embroidered cushion", "A whip", "A small wooden statue of a dog-headed cat"]
  },
  {
    name: "Catnut", category: "odd",
    description: "Born with differences Walter found frightening and exiled young, they learned to survive alone - and to imitate other Kittens from afar.",
    cattribute: "Disguise",
    cattributeText: "A knack for disguise using scraps of fabric, old clothes, or mud: they can pass as a Kitten, a Yardog, a royal pig, even a swamp monster.",
    items: ["Winter-dried acorns", "Bug armor", "A cape of leaves", "A bow with arrows", "A big black cauldron full of rags and ribbons"]
  },
  {
    name: "Future Kitten", category: "odd",
    description: "Claims to come from the future to fix the past, with patchy memories, shaky gear, and baffling gadgets that might just prove it.",
    cattribute: "Foresight",
    cattributeText: "Sometimes anticipates events or disasters and can never be surprised. Pockets full of half-remembered gadgets - the player is encouraged to invent them.",
    items: ["A badly calibrated multifunction analyzer", "Very high-magnification binoculars", "A visored helmet with breathing apparatus", "A photo of odd cats outside a strange house", "A long-distance communicator (nobody ever answers)"]
  },
  {
    name: "Puppy", category: "other",
    description: "Tireless, playful, fiercely loyal and protective, with a bark that makes foes think twice.",
    cattribute: "Guardian",
    cattributeText: "When a companion is in danger or a hopeless spot, the puppy can take their place and suffer the consequences instead.",
    items: ["A nameplate necklace", "A grooming brush", "An old record player and records", "A soccer ball", "A set of wrenches"]
  },
  {
    name: "Sparrowchick", category: "other",
    description: "A fledgling sparrow - curious, chatty, and a superb scout, though flying wears them out quickly.",
    cattribute: "Imitation",
    cattributeText: "Can mimic any voice, accent, or sound - natural or mechanical - even after hearing it just once.",
    items: ["Feather-care cream", "Aviator sunglasses", "A colorful smoke canister that seems to refill itself", "A compass", "A local map"]
  },
  {
    name: "Raccoon", category: "other",
    description: "The Kittens' catch-all word for small field and hedge creatures - rats, mice, voles, ferrets - once prey, now friends.",
    cattribute: "Tiny!",
    cattributeText: "So small and quick they can squeeze through anything; almost impossible to catch or stop - though not especially quiet.",
    items: ["A rip-proof cape that blends in anywhere", "A long spider-silk rope", "A good pair of pliers", "A small, thick, comfy rug", "A roll of duct tape"]
  },
  {
    name: "Bearcub", category: "other",
    description: "Big, powerful, brave, and tireless, usually from a family of acrobats or lumberjacks.",
    cattribute: "Porter",
    cattributeText: "Can carry two additional Purr-ecious items.",
    items: ["A unicycle", "A lumberjack's ax", "A yellow plastic raincoat", "A bee smoker", "A pillow"],
    extraSlots: 2,
    note: "Choose two more Purr-ecious items with the Storyteller."
  },
  {
    name: "Kittenfish", category: "other",
    description: "Must spend part of each day in water, but gets about on land with meowgic and strong fins - calm, patient, and oddly fond of climbing trees.",
    cattribute: "No Fear",
    cattributeText: "Breathes underwater and swims like a fish - and is never afraid of anything or anyone. Threats don't work, and they never back down.",
    items: ["A large old fishhook", "A sturdy rope", "A large fishtank to cool off in", "An inflatable inner tube", "A hand-cranked car headlight"]
  },
  {
    name: "Hoglet", category: "other",
    description: "A near-sighted, absent-minded, ever-hungry hedgehog - good-natured, but never forgets a slight.",
    cattribute: "Perfect Pal",
    cattributeText: "Always ready to help: anticipates friends' needs and turns up in the right place at the right time.",
    items: ["A notebook of everyone who annoyed (or helped) them", "Flavored cooking oil", "A pair of glasses", "A skeleton key", "A set of darts"]
  }
];

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
