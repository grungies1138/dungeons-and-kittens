/**
 * The five ready-to-play Kittens from the official Quickstart Adventure
 * (Dungeons & Kittens Starter Set, Book 1: First Adventures).
 * Stats, skills, spellbook entries, and backpacks are transcribed from the
 * publicly available free PDF. No copyrighted illustrations are included;
 * each uses a generic placeholder icon. Backpack item flavor text is original.
 */

/** Bump this whenever PREGEN_KITTENS changes so existing worlds get the refreshed data. */
export const PREGEN_DATA_VERSION = 2;

const COMMON_GEAR_DESCRIPTION =
  "Wooly blanket, penknife, wooden spoon, small cooking pot, large leather flask, " +
  "tinderbox, candle stubs, small bar of soap, a fur brush, bag of kittysnacks - the same " +
  "small bundle every exiled Kitten was sent off with.";

const SHARED_BACKSTORY =
  "Best friends since they were young Kittens, the group met near a little pond outside " +
  "Cat Tree City, not far from the ramparts, where they'd sneak off to play away from " +
  "their parents. Cheesy once fell into the water; the others pulled him out, and the five " +
  "have been inseparable ever since. Then King Walter's exile lottery scattered them onto " +
  "the road together.";

function kitten({ name, childhood, trait, cattributeName, cattributeDescription, strong, smart, cute, skills, spells, gear, bio }) {
  const heart = strong + smart;
  return {
    name,
    type: "kitten",
    img: "icons/svg/mystery-man.svg",
    system: {
      abilities: {
        strong: { value: strong },
        smart: { value: smart },
        cute: { value: cute }
      },
      resources: {
        heart: { value: heart, max: heart },
        furrendship: { value: cute, max: cute }
      },
      details: {
        player: "",
        childhood,
        characterTrait: {
          name: trait,
          description: "If played positively this session, gain 1 Advantage. If played negatively, give 1 Furr-endship point to a comrade (once per session)."
        },
        cattribute: { name: cattributeName, description: cattributeDescription }
      },
      experience: { current: 0, total: 0 },
      skills: Object.fromEntries(skills.map(key => [key, { trained: true }])),
      biography: `${bio}\n\n${SHARED_BACKSTORY}`
    },
    items: [
      ...spells.map(s => ({
        name: s.name,
        type: "spell",
        img: "icons/svg/book.svg",
        system: { ability: s.ability, successes: s.successes, description: s.description, recastCost: 1 }
      })),
      ...gear.map(g => ({
        name: g.name,
        type: "gear",
        img: "icons/svg/chest.svg",
        system: { description: g.description, quantity: 1, purrecious: g.purrecious ?? false }
      })),
      {
        name: "Common Supplies",
        type: "gear",
        img: "icons/svg/chest.svg",
        system: { description: COMMON_GEAR_DESCRIPTION, quantity: 1, purrecious: false }
      }
    ]
  };
}

export const PREGEN_KITTENS = [
  kitten({
    name: "Sparkle",
    childhood: "Meowge",
    trait: "Brave",
    cattributeName: "Mystic Mentor",
    cattributeDescription:
      "The ghost of an ancient professor of the Meowgic Academy accompanies the Kitten. Such a " +
      "young student should not be on the road without an adult. The ghost gives good advice and " +
      "is super knowledgeable, but can never intervene physically. He also has very strong ideas " +
      "about good manners, being extra-careful, and compulsory study time.",
    strong: 1, smart: 5, cute: 2,
    skills: ["healWoundsAndDiseases", "readWriteCount"],
    spells: [
      { name: "Care of Beasts", ability: "smart", successes: 1, description: "The Kitten completely heals a sick or injured beast, rids it of parasites, and makes its hair, feathers, or scales look nice and shiny." },
      { name: "Enchanting Voice", ability: "cute", successes: 2, description: "The Kitten's voice becomes deep and soothing. This either calms or puts a creature to sleep, or awakens strong emotions in the audience when telling a story." },
      { name: "Care", ability: "cute", successes: 3, description: "During a break, the Kitten may spend 1 Furr-endship point to give 1 Heart point to each of her comrades present (instead of spending 1 point per Heart point given)." },
      { name: "Talk to Trees", ability: "smart", successes: 3, description: "By placing her hand on the bark, the Kitten can converse with a tree. The older the tree, the more intelligent it is and the more it has to say." }
    ],
    gear: [
      { name: "A small meowgic spellbook", description: "Sparkle's own notes on meowgic, copied out in a careful paw before she was exiled." },
      { name: "A nice meowgic wand", description: "A slim, polished wand - more a focus for concentration than a source of power, but she feels lost without it." },
      { name: "A large hat covered with strange symbols", description: "Borrowed from a professor at the Meowgic Academy; the symbols mean something, probably." },
      { name: "A twisted walking stick", description: "Doubles as a walking aid and something to lean on while thinking hard." },
      { name: "A leather pouch filled with medicines", description: "Salves, tonics, and bandages for treating everyday scrapes and ailments." }
    ],
    bio: "Sparkle is a student of meowgic. She is intelligent and brave. Before she was exiled, she was the top student in her class. Her parents are well-known fabric merchants in Cat Tree City."
  }),
  kitten({
    name: "Bobbin",
    childhood: "Country Kitten",
    trait: "Grouchy",
    cattributeName: "Animal Companion (Harlequin)",
    cattributeDescription:
      "The Kitten is accompanied by a beast of his choosing, which is loyal and friendly to him. " +
      "She is a little smarter than other beasts; she can help the Kitten, respond to simple " +
      "orders, and even take the initiative - but she is a friend, not a servant. Bobbin has " +
      "Harlequin, a large, colorful lizard.",
    strong: 5, smart: 2, cute: 1,
    skills: ["findYourWay", "hunterGatherer"],
    spells: [
      { name: "Slipper Patrol", ability: "strong", successes: 1, description: "Until dusk next falls, the Kitten and his comrades can walk and run without hurting their legs, paws, or twisting ankles." },
      { name: "Long Night", ability: "strong", successes: 3, description: "The Kitten does not sleep all night, instead staying awake, alert, and vigilant, except for a few minutes at dawn. He is perfectly rested the next day." }
    ],
    gear: [
      { name: "A bird call that sounds like birds singing", description: "A carved wooden whistle Bobbin made himself; surprisingly convincing." },
      { name: "Cereal bars", description: "Dense, chewy, and always at the bottom of the bag when you need one." },
      { name: "A large straw hat", description: "Keeps the sun off and doubles as a fan or a water scoop in a pinch." },
      { name: "A fork", description: "A plain iron fork, kept from home; not much use as a weapon, but very useful at dinner." },
      { name: "Dried insects for Harlequin", description: "Harlequin's favorite snack - Bobbin never travels without a spare handful." }
    ],
    bio: "Bobbin is a peasant's son. He's a bit grumpy, but is secretly good-hearted. His parents were sheep farmers in the countryside near Cat Tree City."
  }),
  kitten({
    name: "Camilla Bellefleur",
    childhood: "Young Noble",
    trait: "Stubborn",
    cattributeName: "Inheritance",
    cattributeDescription:
      "At the beginning of each game session, an animal (carrier pigeon, tunnelling mole, or " +
      "migrating turtle) brings the Kitten a gold coin stamped with King Walter's profile. It's " +
      "worth a fortune on the road, and is proof that her parents have not forgotten her. Each " +
      "coin is a Purr-ecious item that does not take up a backpack space.",
    strong: 1, smart: 2, cute: 5,
    skills: ["moveSilently", "seduceAndCharm"],
    spells: [
      { name: "Sound & Vision", ability: "cute", successes: 1, description: "The Kitten is surrounded by sounds, music, and lights and can put on a show." },
      { name: "Long View", ability: "cute", successes: 2, description: "Until the next dawn, the Kitten can see perfectly into the distance, as if using binoculars or a telescope." }
    ],
    gear: [
      { name: "Fancy clothes", description: "A little travel-worn now, but still finer than anything most road-Kittens will ever own." },
      { name: "Luxury fur comb", description: "Silver-backed, and Camilla insists on using it daily no matter how muddy the road." },
      { name: "Ball & carnival masks", description: "Souvenirs of parties back home, kept for the memories as much as for disguises." },
      { name: "Perfume", description: "A single precious vial - she's saving the last of it for something important." },
      { name: "A beautifully crafted crystal rose (her family symbol)", description: "The Bellefleur family crest, cut from pale crystal. She'd never sell it, whatever it might fetch.", purrecious: false }
    ],
    bio: "Camilla was born into one of the kingdom's noble families. Unfortunately for her, as her friends, she was a victim of King Walter's lottery. She acts like a young, high-ranking noble, but actually feels close to regular people."
  }),
  kitten({
    name: "Dart",
    childhood: "Soldier's Child",
    trait: "Shy",
    cattributeName: "Heroic Lineage",
    cattributeDescription:
      "The Kitten is the child of some of the Kingdom's military heroes. His parents' enemies " +
      "fear them; his parents' friends are indebted to them. It is not always easy to live up to " +
      "such a big reputation, but it can have its advantages when looking for allies or " +
      "confronting enemies.",
    strong: 5, smart: 2, cute: 1,
    skills: ["hideInShadows", "shakeYourBooty"],
    spells: [
      { name: "Fearless", ability: "strong", successes: 1, description: "Until the next dawn, the Kitten is not afraid of anybody or anything. If he also spends 1 Furr-endship point, the spell has the same effect on all his comrades present." },
      { name: "Quick as a Flash", ability: "smart", successes: 2, description: "Until the next dawn or dusk (whichever comes first), the Kitten can run twice as fast and three times as long as normal, without getting tired." }
    ],
    gear: [
      { name: "Light armor", description: "A hand-me-down leather jerkin, a little big on him still." },
      { name: "Bow & quiver full of arrows", description: "His grandmother taught him to shoot; he's better at it than he lets on." },
      { name: "A bag of shiny knickknacks", description: "Buttons, bottle caps, a bent spoon - nothing valuable, but he likes collecting them." },
      { name: "Mushroom guidebook", description: "Hand-copied and a little water-stained, but reliable enough to tell dinner from disaster." },
      { name: "An old rusty sword", description: "Too heavy for him to swing properly yet, but he carries it anyway - it belonged to his mother." }
    ],
    bio: "Dart has dreams of being a great hero. He is determined and brave. However, Dart is also very shy, and is always blushing. Both his parents are guards on the roads leading to Cat Tree City; he was raised by his grandmother, Granny Cuddlekin."
  }),
  kitten({
    name: "Cheesy",
    childhood: "Catnut",
    trait: "Funny",
    cattributeName: "Disguise",
    cattributeDescription:
      "Catnuts have developed the curious gift of disguise by observing other cats from afar. " +
      "They can take on almost any appearance, using colorful material, old clothes, or mud on " +
      "their fur. They can become a Kitten, a Yardog, a royal pig - even a slimy swamp monster!",
    strong: 5, smart: 1, cute: 2,
    skills: ["cook", "seeAndSearch"],
    spells: [
      { name: "Heart Charm", ability: "strong", successes: 1, description: "The Kitten crafts a small talisman that he can keep or give to another. It gives the wearer 1 extra Heart point (and increases their maximum by 1) until the next dawn." },
      { name: "Cat Haven", ability: "strong", successes: 2, description: "The Kitten finds a protected, hidden, comfortable, warm place where he can spend the night and snooze quietly, undisturbed." }
    ],
    gear: [
      { name: "A cheese knife", description: "Small, well-oiled, and used for exactly one thing - slicing cheese." },
      { name: "A large, round Cheddar cheese", description: "Cheesy's most prized possession. He rations it carefully. Mostly." },
      { name: "A cape of leaves", description: "Woven together from forest scraps; excellent camouflage, less excellent in the rain." },
      { name: "A pile of rags & ribbons", description: "Raw material for whatever disguise the moment calls for." },
      { name: "A joke book", description: "Dog-eared and much-loved, though nobody else seems to find these jokes as funny as he does." }
    ],
    bio: "Cheesy was exiled by King Walter when he was very young, because he smells of cheese - a smell the King cannot stand. Cheesy is wild, but also very funny, and loves to tell jokes (and eat cheese)."
  })
];

/** Create the five official pregenerated Kittens as Actors in the current world. */
export async function importPregens() {
  const created = await Actor.create(PREGEN_KITTENS);
  ui.notifications.info(`Dungeons & Kittens: imported ${created.length} pregenerated Kittens.`);
  return created;
}

const PREGEN_PACK_NAME = "dnk-pregens";
const VERSION_SETTING = "pregenDataVersion";

/**
 * Make sure the "Pregenerated Kittens" compendium exists for this world, is populated, and
 * matches the current PREGEN_DATA_VERSION. System-shipped compendia normally ship as pre-built
 * LevelDB folders, but those can't be hand-authored reliably outside Foundry itself, so instead
 * we create a world-level compendium the first time a GM loads a world on this system, and
 * refresh its contents whenever the bundled data changes.
 */
export async function ensurePregenCompendium() {
  if (!game.user.isGM) return;

  let pack = game.packs.get(`world.${PREGEN_PACK_NAME}`);
  if (!pack) {
    pack = await CompendiumCollection.createCompendium({
      type: "Actor",
      name: PREGEN_PACK_NAME,
      label: "Dungeons & Kittens: Pregenerated Kittens"
    });
  }

  const storedVersion = game.settings.get("dungeons-and-kittens", VERSION_SETTING);
  if (storedVersion >= PREGEN_DATA_VERSION) return;

  const index = await pack.getIndex();
  if (index.size > 0) {
    await Actor.deleteDocuments(Array.from(index.keys()), { pack: pack.collection });
  }

  await Actor.createDocuments(PREGEN_KITTENS, { pack: pack.collection });
  await game.settings.set("dungeons-and-kittens", VERSION_SETTING, PREGEN_DATA_VERSION);
  ui.notifications.info("Dungeons & Kittens: refreshed the Pregenerated Kittens compendium.");
}
