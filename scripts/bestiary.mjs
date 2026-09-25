import { SKILLS } from "./skills.mjs";
import { SPELLS, findSpell, spellItemData } from "./content.mjs";
import { ensureWorldPack } from "./packs.mjs";
import { EXTRA_TEXT } from "./rulebook-text.mjs";

/** Bump whenever BESTIARY_EXTRAS changes so existing worlds get the refreshed data. */
export const BESTIARY_DATA_VERSION = 3;

/**
 * The Core Rulebook's named Extras. Abilities, skills, spells, and Purr-ecious items are the
 * book's; the one-line descriptions are this project's own. Heart is derived (Strong + Smart),
 * which matches every stat block in the book. [name, description, where (page), [Strong, Smart,
 * Cute], skills, spells, items]
 */
const EXTRAS = [
  ["Tiramisu", "Big tabby patron of the Honorable Kittysnacks Society; imposing but generous.", "Example (p.65)", [5, 3, 4], ["Cook", "Find Information", "Hiss & Growl", "Knowledge of People & Places"], ["Clean and Tidy", "Preserving Resources", "Slice and Dice"], ["Large butcher's knife", "Thick apron", "Box of spices"]],
  ["Ruby-Chewsday", "Arrogant, bullying young noble leading a gang of exiles.", "Example Catfight (p.62)", [2, 1, 3], [], [], []],
  ["Flounder", "Rude, hot-headed ferret with a lisp and a sharp tongue.", "Example Catfight (p.62)", [2, 2, 4], ["Hiss & Growl"], [], []],
  ["Fulstop", "Mocking, aggressive little Kitten.", "Example Catfight (p.62)", [3, 1, 2], [], [], []],
  ["Furnace", "Big, unflappable hedgehog with ginger quills.", "Example Catfight (p.62)", [3, 2, 3], ["Keep Calm & Carry On"], [], []],

  ["Licorishi", "Proud member of the Royal Guard, torn between honesty and loyalty to Walter.", "Cat Tree City (p.88)", [5, 3, 2], ["Find Information", "Hiss & Growl", "Scratch", "Shake Your Booty"], ["Balancing Cat", "Cat's Eyes"], ["A heavy sword", "Immaculate uniform", "Plumbline", "First aid kit"]],
  ["Lamia the Librarian", "Elegant young cat devoted to old books, loath to lend them.", "Cat Tree City (p.89)", [1, 5, 2], ["Knowledge of Laws & Legends", "Knowledge of People & Places", "Read, Write, Count"], ["Heart Charm", "Words of Wisdom"], ["A pair of glasses", "A solar-powered lamp"]],
  ["Taro", "Grumpy-looking old toy-store cat in a checked coat who secretly spoils Kittens.", "Cat Tree City (p.89)", [2, 2, 4], ["See & Search", "Sweet-talk"], ["Cat's Eyes", "Summon Tools"], ["A colorful yo-yo", "Some candy", "Pencil and notebook"]],
  ["Vizir Chilli", "Weary fair officer who drinks too much and misses his daughter.", "The Suburbs (p.92)", [3, 4, 3], ["Keep Calm & Carry On", "Knowledge of Laws & Legends", "Read, Write, Count"], ["Cat's Eyes", "Loud Speaker", "Sense Trouble"], ["Ancient solar calculator", "Flask of alcohol"]],
  ["Ptolomeow", "Shadowy bazaar owner who quietly keeps the city on edge for Walter.", "The Suburbs (p.93)", [3, 5, 4], ["Find Information", "Hide in Shadows", "Knowledge of People & Places", "Seduce & Charm"], ["Feel the Path", "Leave no Trace", "The Color of Grass"], ["A dark cape", "A bunch of false skeleton keys", "A watch"]],
  ["Regina Roundpaw", "Charitable food magnate with a steady paw and an inkstand.", "Chopton (p.94)", [1, 4, 3], ["Cook", "Heal Wounds & Diseases", "Keep Calm & Carry On"], ["Slice and Dice"], ["Small first aid kit", "Portable inkstand"]],
  ["Sadie Roundpaw", "Brisk, quick-footed partner on the Roundpaw charity rounds.", "Chopton (p.94)", [3, 2, 3], ["Cook", "Hiss & Growl"], ["Quick as a Flash", "Clean and Tidy"], ["Large scarf", "Running shoes"]],
  ["Reverend Mother Barbiecute", "Kindly-seeming orphanage matron with a hidden, greedy fortune.", "Chopton (p.95)", [4, 3, 3], ["Find Information", "Heal Wounds & Diseases", "Sweet-talk"], ["Cat Haven", "Fearless"], ["An embroidery bag", "Colorful handkerchiefs", "Cream for aches and pains"]],
  ["Ignatius", "Tavern regular who knows where the meowgic vending machines hide.", "The Soot District (p.98)", [2, 3, 3], ["Cook", "Make Music"], ["Clean and Tidy", "Preserving Resources"], ["A recipe book", "A guide to edible mushrooms", "Hand-drawn map of meowgic vending machines"]],
  ["Old Man Chompy", "Workshop owner and quiet teacher of political ideas for after Walter.", "The Soot District (p.99)", [4, 4, 2], ["Keep Calm & Carry On", "Move Silently", "Tinker with Bits & Bobs"], ["Leather Apron", "Safety at Work", "Summon Tools"], ["Battered leather tool bag", "Small book of anarchist sayings", "Ancient multimeter"]],
  ["Crusty", "One-eyed, wobbly old tomcat - secretly a forgotten, deposed monarch.", "The Soot District (p.99)", [2, 3, 3], ["Knowledge of Laws & Legends", "Knowledge of People & Places"], ["Fearless", "Sense Trouble"], ["An old floppy hat"]],
  ["Matey Mousetail", "Lazy street-gang organizer who knows every secret passage up the tower.", "The Sewers (p.101)", [2, 2, 4], ["Read, Write, Count", "Seduce & Charm"], ["Hide Things", "Leave no Trace"], ["A wall-colored cape", "Map of every floor of Cat Tree City"]],
  ["Bruno", "Anonymous songwriter behind the Ballroom's favorite new tunes.", "The Sewers (p.102)", [1, 2, 5], ["Make Music", "Seduce & Charm"], ["Enchanting Voice", "Loud Speaker", "Sound & Vision"], ["A shamisen", "A barrel organ", "Hair-slicking cream"]],
  ["The Albino Crocodile", "The sewer legend - and that's about all anyone knows.", "The Sewers (p.103)", [5, 2, 1], ["Scratch"], [], ["Very big teeth"]],
  ["Tina the Traveller", "Lonely migrating bird in a hooded cape who tags along for stories.", "The Countryside (p.103)", [3, 4, 4], ["Find Your Way", "Hunter-Gatherer", "Read Sky & Stars"], ["Leave no Trace", "Quick as a Flash"], ["A large hooded cape", "Trinkets in a designer handbag"]],
  ["Count Catula", "Night-dwelling, berry-stained aristocrat Walter prefers not to provoke.", "Count Catula's Manorhouse (p.108)", [2, 5, 5], ["Keep Calm & Carry On", "Knowledge of Laws & Legends", "Make Music", "Move Silently"], ["Animate Object", "Endless Feed", "Long Night", "Quick as a Flash"], ["An odd purple suit", "A large night cape", "An ultraviolet lamp", "A wheeled suitcase"]],
  ["Mama", "Slow-spoken, jingling matriarch of the Caravan Village, firmly against Walter.", "The Caravan Village (p.111)", [1, 5, 4], ["Herbology", "Heal Wounds & Diseases", "Knowledge of Laws & Legends", "Knowledge of People & Places", "Sweet-talk", "Find Your Way"], ["Care", "Feel the Path", "Treating Beasts"], ["Long colorful scarves", "Medallions", "A large carved walking stick"]],
  ["Chuck the Catnut", "Swamp-savvy, tree-swinging Catnut and a loyal friend.", "Catnut Swamp (p.113)", [5, 2, 3], ["Hiss & Growl", "Hunter-Gatherer", "Shake Your Booty"], ["Earthworks", "Slice and Dice"], ["A long swinging whip", "Chestnut-throwing bugs"]],
  ["Captain Buttercup", "Swashbuckling duelist-for-hire, ready for any lost cause.", "Huggle (p.115)", [3, 4, 3], ["Find Information", "Hiss & Growl", "Knowledge of People & Places", "Read Sky & Stars"], ["Balancing Cat", "Breathe Under Water", "Feel the Path"], ["Map of the coast and beyond", "A spyglass"]],
  ["Mimi the Meowmy", "Freshly woken Meowmy gathering stolen artifacts back to her pyramid.", "The Great Pyramid (p.117)", [2, 2, 2], ["Pickpocket", "Move Silently"], ["Enchanting Voice", "Preserving Resources"], ["An ancient mirror", "Potent fragrances", "A snake headdress", "A bottomless backpack of bandages"]],
  ["Beep and Squeek", "Sewer archeologists and brilliant scavenger-engineers of Downtown.", "Downtown (p.123)", [2, 3, 3], ["Find Your Way", "See & Search"], [], ["Headlamp", "Pickaxe and rope", "Reel of twine", "Mechanic's kit"]],
  ["Louis the Learned", "Ancient sage staging plays of the olden days in a broken TV.", "Downtown (p.123)", [1, 5, 4], ["Knowledge of Laws & Legends", "Sweet-talk"], [], ["A book about the theater", "A disconnected microphone", "Some VHS cassettes"]],
  ["Brutus", "Leader of the Junkyard pack, secretly plotting with Walter.", "The Junkyard (p.126)", [5, 5, 3], ["Hiss & Growl", "Knowledge of Laws & Legends", "Scratch", "Sweet-talk", "Tinker with Bits & Bobs"], ["Fearless", "Loud Speaker"], ["Large plate armor", "A thin, sturdy sword", "A well-thumbed political treatise"]],
  ["Jazzy the Blacksmith", "Exhausted, grumpy Labrador smith who might side with the Kittens.", "The Junkyard (p.128)", [4, 3, 3], ["Herbology", "Keep Calm & Carry On", "Tinker with Bits & Bobs"], ["Safety at Work", "Summon Tools"], ["Large leather apron", "Welding goggles", "Large hammer"]],
  ["The Lovely Apollo", "Gentle, artistic poodle stuck in a brutish pack.", "The Junkyard (p.128)", [1, 3, 5], ["Keep Calm & Carry On", "Make Music", "Sweet-talk"], ["Cat Haven", "The Color of Grass"], ["Comb and brush", "Gloves"]],
  ["Bish, Bash, and Bosh", "Brutus' three musclebound mutts - dimmer together than apart.", "The Junkyard (p.128)", [5, 2, 3], ["Hiss & Growl", "Scratch"], ["Fearless", "Slipper Patrol"], ["Heavy armor", "Spikes", "Capture net", "Strong rope"]],
  ["Luna the Guardian", "Runaway Junkyard dog who now guards Selene's forest.", "The Slumbering Forest (p.132)", [3, 4, 5], ["Find Your Way", "Heal Wounds & Diseases", "Herbology", "Hide in Shadows", "See & Search", "Shake Your Booty"], ["Leather Apron", "The Color of Grass"], ["A forest-colored cape", "A blacksmith's hammer"]],
  ["Buddy", "Heartbroken cricket-riding biker thinking of sailing far away.", "The Cricketers (p.135)", [5, 3, 3], ["Care of Beasts", "Hiss & Growl", "Scratch", "Shake Your Booty", "Sweet-talk"], ["Blessing of Honor", "Long Night", "Sense Trouble"], ["Daytona the cricket", "A patched leather jacket", "A skull bandana", "A long metal chain"]],
  ["Suzanne, the Witch-Viper", "Distant reptile witch who never seems quite present.", "The Witch's Lair (p.138)", [4, 5, 3], ["Herbology", "Keep Calm & Carry On", "Knowledge of Laws & Legends", "Seduce & Charm"], ["Enchanting Voice", "Loud Speaker", "Sense Trouble", "Talk to Trees", "Words of Wisdom"], []],
  ["Cheddar George", "Brave old muskrat, still game for a scrap.", "The Witch's Lair (p.139)", [3, 3, 2], ["Find Information", "Hiss & Growl", "Scratch", "See & Search"], ["Cat's Eyes", "Fearless"], ["A halberd", "A blue military helmet"]],
  ["Lady Sibyl", "Overworked, underappreciated magpie housekeeper.", "The Witch's Lair (p.139)", [2, 3, 3], ["Cook", "Knowledge of Laws & Legends", "Read, Write, Count"], ["Clean and Tidy", "Preserving Resources"], ["A notebook and mechanical pencil", "A white apron"]],
  ["Marikatolsn and Ashliolsn", "Chatty, clumsy water hens nobody can tell apart.", "The Witch's Lair (p.139)", [3, 1, 2], ["Care of Beasts", "Cook", "Shake Your Booty", "Hunter-Gatherer"], ["Blessing of Honor", "Treating Beasts"], ["A small kitchen knife", "A carry bag", "A flowery blouse"]],
  ["Bojosar", "Huge, lying, thoroughly nasty cane toad.", "The Witch's Lair (p.139)", [5, 4, 3], ["Hiss & Growl", "Knowledge of Laws & Legends", "Pickpocket", "Scratch", "Seduce & Charm", "Shake Your Booty", "Sweet-talk"], ["Endless Feed", "Loud Speaker"], ["A gold ring"]],
  ["Robber Toad", "One of a band of ugly, dim-witted scoundrels.", "The Witch's Lair (p.140)", [3, 1, 2], ["Hiss & Growl", "Shake Your Booty"], ["Slipper Patrol", "The Color of Grass"], ["A heavy wooden flask"]],
  ["Baron Embergrunt", "Scheming pig baron with genuine plans for his city and useless relatives.", "Corktown (p.148)", [1, 5, 5], ["Find Information", "Keep Calm & Carry On", "Seduce & Charm", "Sweet-talk"], ["Enchanting Voice", "Sense Trouble"], ["A baron's crown", "A stylus hidden in his boot", "Assorted antidotes"]],
  ["Iron Loin", "Mean, well-armed pig mercenary of the city militia.", "Corktown (p.148)", [4, 2, 2], ["Hiss & Growl", "Shake Your Booty"], ["Fearless", "Loud Speaker"], ["A helmet", "Armor", "A pike"]],
  ["Local Rogue", "Corktown thug haunting taverns, alleys, and crowded markets.", "Corktown (p.149)", [3, 2, 1], ["Hide in Shadows", "Move Silently", "Pickpocket"], [], ["A fishy-smelling hood"]],
  ["Sailor", "Talkative, weather-beaten sea dog, probably missing a body part.", "Corktown (p.149)", [4, 3, 1], ["Read Sky & Stars", "Shake Your Booty"], ["Breathe Under Water", "Long View"], ["A meerschaum pipe", "A compass"]],
  ["Mrs. Cuddles", "Big-hearted widow running a dispensary for the needy.", "Corktown (p.149)", [1, 3, 4], ["Cook", "Heal Wounds & Diseases", "Herbology"], ["Care", "Heart Charm"], ["Large kitchen apron", "Ladle"]],
  ["Dualeaper", "Applause-happy showman and keeper of the Dreamsinger.", "Bigwheel (p.157)", [2, 5, 5], ["Draw & Paint", "Knowledge of People & Places", "Make Music", "Seduce & Charm", "Shake Your Booty"], [], ["Strange bagpipes"]],
  ["Rainbow Tumble Tribe Guard", "Cheerful former traveling performer, now a friendly Bigwheel guard.", "Bigwheel (p.157)", [3, 2, 3], ["Make Music", "Shake Your Booty"], [], ["Juggling balls and clubs", "Ribbons and scarves"]],
  ["Edmund", "Brooding turtle in a sedan chair who rents out a nightmare-bringing trumpet.", "Bigwheel (p.159)", [4, 4, 4], ["Herbology", "Hiss & Growl", "Make Music", "Knowledge of Laws & Legends", "Seduce & Charm"], ["Animate Object", "Feel the Path"], ["A silver trumpet", "A long dark red cape"]],
  ["Rider on the Storm", "Boastful, fanatically loyal acrobat-prankster serving Edmund.", "Bigwheel (p.159)", [3, 3, 2], ["Hide in Shadows", "Shake Your Booty"], [], ["Wooden rapier", "Black mask"]],
  ["Dark", "Furious warlord brooding atop his dam, once called Horn.", "Misty Valley (p.165)", [5, 4, 3], ["Find Information", "Find Your Way", "Hiss & Growl", "Keep Calm & Carry On", "Shake Your Booty", "Scratch"], ["Balancing Cat", "Bug Swarm", "Fearless", "Long Night", "Quick as a Flash"], ["A large, whispering black sword", "Fine chain mail"]],
  ["Black Horn Mercenary", "Ruthless sellsword wearing the black horn coat of arms.", "Misty Valley (p.166)", [4, 2, 2], ["Hiss & Growl", "Scratch", "Shake Your Booty"], [], ["Various weapons", "Armor", "Black horn tabard"]],
  ["The Bloomundays", "Unremarkable sheep couple who adopted Horn.", "Misty Valley (p.166)", [2, 2, 2], ["Herbology", "Hunter-Gatherer"], ["Summon Tools", "Treating Beasts"], ["Some big hats"]],
  ["Mrs. Bighorn", "Horn's birth mother, now living a comfortable secret life on a farm.", "Misty Valley (p.166)", [2, 2, 4], ["Care of Beasts", "Cook"], [], ["A farmer's apron"]],
  ["The Big-Bare-Butt", "The rarely-seen hairless giant of the valley of statues (Strong 5 or more).", "Valley of Statues (p.170)", [5, 1, 2], ["Care of Beasts", "Herbology"], [], []],
  ["Mayor Eve", "Lively fox mayor determined to keep Greenshore safe.", "Greenshore (p.171)", [2, 5, 3], ["Herbology", "Knowledge of Laws & Legends", "Knowledge of People & Places"], ["Heart Charm", "Words of Wisdom"], ["Mayor's chain"]],
  ["Rebecca the Fisher", "Ambitious, superstitious heron eyeing the mayor's chain.", "Greenshore (p.171)", [3, 3, 2], ["Hunter-Gatherer", "Knowledge of Laws & Legends", "Knowledge of People & Places"], [], ["Talismans and protective charms"]],
  ["Magnificus the Meowge", "Condescending artifact-hunter who knows every spell and wants the big-bare-butt.", "Greenshore (p.171)", [3, 4, 3], ["Hiss & Growl", "Knowledge of Laws & Legends", "Seduce & Charm"], ["*"], ["A big hat", "Bag", "Whip", "Pocket watch"]],
  ["Doctor Mojo", "Polite, brilliant octopus running unsettling experiments.", "Isle of Evimettal (p.176)", [2, 5, 1], ["Knowledge of People & Places", "Read, Write, Count", "Tinker with Bits & Bobs"], ["Animate Object", "Slice and Dice", "Summon Tools"], ["A diving suit"]],
  ["Lemi", "Devoted puffin assistant, quietly smitten with Doctor Mojo.", "Isle of Evimettal (p.176)", [2, 4, 2], ["Care of Beasts", "Cook", "Herbology"], ["Leather Apron", "Quick Fix", "Treating Beasts"], ["Kittysnacks and sugar cubes"]],
  ["Captain Blueclaw", "Tattooed, mussel-covered pirate crab terrorizing the coast.", "Isle of Evimettal (p.177)", [5, 3, 2], ["Shake Your Booty", "Hiss & Growl", "Read Sky & Stars"], ["Breathe Under Water", "Long View", "Feel the Path"], ["Sword", "Telescope"]],
  ["Jojo", "A lost Kitten who has stayed in the White Paradise far too long.", "White Paradise (p.181)", [1, 2, 3], ["Draw & Paint", "Seduce & Charm"], ["Sound & Vision"], ["White pajamas", "Colored pencils", "Paper"]],

  ["Crowtie", "Shifty weasel spying for Walter.", "Grandma Scramble (p.210)", [2, 3, 2], ["See & Search", "Sweet-talk"], [], ["A big machete", "Wood-colored cape", "Homing pigeon gear"]],
  ["Greaser", "Low-slung Catnut with a big cauldron-bag.", "Grandma Scramble (p.210)", [4, 1, 2], ["Hiss & Growl", "Hunter-Gatherer", "Keep Calm & Carry On"], [], ["Big cauldron used as a bag"]],
  ["Mr. Mooner", "Dapper ginger smuggler with amber eyes and a cane.", "Grandma Scramble (p.211)", [3, 5, 4], ["Find Information", "Hiss & Growl", "Keep Calm & Carry On", "Knowledge of People & Places", "Seduce & Charm"], [], ["An elegant cane", "Beautiful clothes", "A stone that speaks to arthropods"]],
  ["Mrs. Lewcy", "Young tabby in leather armor with a big sword and a bright scarf.", "Grandma Scramble (p.211)", [4, 3, 4], ["Move Silently", "Scratch", "Shake Your Booty"], [], ["Leather armor", "Large sword"]],
  ["Grenada", "Wiry, darting-eyed fox and former prisoner of Walter's dungeon.", "Grandma Scramble (p.212)", [4, 4, 3], ["Find Your Way", "See & Search", "Shake Your Booty"], [], ["A skeleton key", "Solid rope"]],
  ["Wellington", "Big, quiet badger chef with a knife at his side.", "Grandma Scramble (p.212)", [5, 3, 3], ["Cook", "Hiss & Growl", "Hunter-Gatherer", "Read Sky & Stars"], [], ["Chef's apron", "Large knife", "Salt and pepper pots", "Mushroom powder"]],
  ["Galiena", "Ancient, wise forest spider who speaks mind-to-mind.", "Grandma Scramble (p.212)", [2, 5, 3], ["Heal Wounds & Diseases", "Hunter-Gatherer", "Herbology"], [], ["A cap and a collar"]],
  ["Sikkli", "Unpleasant sergeant of the guard on the city walls.", "Grandma Scramble (p.214)", [4, 2, 2], ["Find Information", "Hiss & Growl", "Shake Your Booty"], [], ["Royal guard's tabard", "Large heavy stick", "Pipe and pipe-weed"]],
  ["Royal Guard", "Basic guard - not very brave, not very motivated.", "Grandma Scramble (p.214)", [3, 3, 3], ["Hiss & Growl", "Shake Your Booty", "See & Search"], [], ["Royal guard's tabard", "Large heavy stick", "Alarm horn"]],
  ["Mrs. Rosie Rosevale", "A desperate, hopeful mother.", "Three Little Pigs (p.229)", [2, 2, 2], ["Care of Beasts", "Cook"], ["Clean and Tidy", "Preserving Resources"], ["A canvas travel bag", "Umbrella"]],
  ["Snorter, Snorfer, and Snorfy", "Squabbling but brilliantly inventive pig brothers.", "Three Little Pigs (p.229)", [3, 3, 2], ["Tinker with Bits & Bobs", "Shake Your Booty"], ["Slice and Dice", "Safety at Work"], ["Tool bag", "Notebook of diagrams and wild ideas"]],
  ["Barnaby", "One-eyed, sneaky, grubby fox scoundrel.", "Three Little Pigs (p.230)", [3, 4, 3], ["Hide in Shadows", "Move Silently", "See & Search"], ["Cat Haven"], ["A filthy scarf", "Mismatched keys", "An old piece of sausage"]],
  ["Wolfrik's Ruffian", "Brutal, cocksure gang member (Vinny, Ruddy, and friends).", "Three Little Pigs (p.230)", [4, 2, 2], ["Hiss & Growl", "Shake Your Booty"], ["Long Night"], ["Docker's hooks", "Old clothes"]],
  ["Wolfrik", "Gang leader with vengeance in his heart.", "Three Little Pigs (p.230)", [4, 4, 4], ["Find Information", "Hiss & Growl", "Keep Calm & Carry On", "Scratch"], ["Cat Haven", "Fearless", "Loud Speaker"], ["A locket with his mother's portrait", "Large dagger"]]
];

function skillKeyIndex() {
  const norm = s => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");
  return new Map(SKILLS.map(key => [norm(game.i18n.localize(`DNK.Skill.${key}`)), key]));
}

function buildExtras() {
  const skillKeys = skillKeyIndex();
  const norm = s => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");
  return EXTRAS.map(([name, summary, where, [strong, smart, cute], skills, spells, items]) => {
    /** The book's own description: its opening sentence is the re-roll "description" (p.65), the rest goes in the notes. */
    const official = EXTRA_TEXT[name] ?? summary;
    const firstSentence = official.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? official;
    const role = official.length <= 160 ? official : firstSentence;
    const spellItems = spells[0] === "*"
      ? SPELLS.map(spellItemData)
      : spells.map(findSpell).filter(Boolean).map(spellItemData);
    const heart = strong + smart;
    return {
      name,
      type: "extra",
      img: "icons/svg/mystery-man.svg",
      system: {
        abilities: { strong: { value: strong }, smart: { value: smart }, cute: { value: cute } },
        resources: { heart: { value: heart, max: heart }, furrendship: { value: cute, max: cute } },
        details: { role, notes: `${official}

Source: Dungeons & Kittens Core Rulebook - ${where}.` },
        skills: Object.fromEntries(skills.map(s => skillKeys.get(norm(s))).filter(Boolean).map(key => [key, { trained: true }]))
      },
      items: [
        ...spellItems,
        ...items.map(item => ({ name: item, type: "gear", img: "icons/svg/chest.svg", system: { purrecious: true } }))
      ]
    };
  });
}

/** "Dungeons & Kittens: Bestiary" - the Core Rulebook's named Extras. */
export function ensureBestiaryCompendium() {
  return ensureWorldPack({
    name: "dnk-bestiary",
    label: "Dungeons & Kittens: Bestiary",
    type: "Actor",
    version: BESTIARY_DATA_VERSION,
    setting: "bestiaryDataVersion",
    build: buildExtras
  });
}
