/**
 * Item artwork from Foundry's own core icon library (public/icons, shipped with every install),
 * so spells and backpack gear get a picture that fits instead of the generic book and chest.
 */

const ICONS = "icons/";

/** One icon per spell (pp.39-41). */
export const SPELL_ICONS = {
  "Slipper Patrol": "equipment/feet/shoes-leather-simple-brown.webp",
  "Cat Haven": "environment/settlement/house-woods.webp",
  "Earthworks": "tools/hand/shovel-spade-steel-brown-grey.webp",
  "First Aid": "tools/medical/bandages-gauze.webp",
  "Loud Speaker": "tools/instruments/horn-megaphone-loudspeaker.webp",
  "Long Night": "magic/nature/moon-crescent.webp",
  "Blessing of Honor": "magic/holy/barrier-shield-winged-blue.webp",
  "Words of Wisdom": "sundries/books/book-open-turquoise.webp",
  "Fearless": "creatures/abilities/lion-roar-yellow.webp",
  "Endless Feed": "consumables/food/plate-chicken-grilled-mushroom-brown.webp",
  "Heart Charm": "equipment/neck/necklace-charm-clover.webp",
  "Sense Trouble": "magic/perception/third-eye-blue-red.webp",
  "Leather Apron": "equipment/chest/breastplate-collared-leather-brown.webp",
  "Summon Tools": "containers/bags/satchel-leather-brown.webp",
  "Slice and Dice": "skills/melee/stabbing-knife.webp",
  "Quick Fix": "tools/hand/wrench-adjustable.webp",
  "Safety at Work": "equipment/head/helmet-hardhat.webp",
  "Animate Object": "magic/control/control-influence-puppet.webp",
  "The Color of Grass": "creatures/reptiles/chameleon-camouflage-green-brown.webp",
  "Quick as a Flash": "magic/movement/trail-streak-zigzag-yellow.webp",
  "Treating Beasts": "magic/life/heart-cross-green.webp",
  "Bug Swarm": "consumables/food/honey-beehive-brown.webp",
  "Leave no Trace": "creatures/abilities/paw-print-pair-purple.webp",
  "Talk to Trees": "magic/nature/tree-animated-smile.webp",
  "Clean and Tidy": "tools/hand/broom-straw-brown.webp",
  "Enchanting Voice": "skills/trades/music-singing-voice-blue.webp",
  "Cat's Eyes": "magic/perception/eye-slit-orange.webp",
  "Balancing Cat": "magic/holy/yin-yang-balance-symbol.webp",
  "Sound & Vision": "skills/trades/music-notes-sound-blue.webp",
  "Care": "magic/life/heart-hand-gold-green.webp",
  "Preserving Resources": "consumables/food/preserves-jam-jelly-jar-brown-red.webp",
  "Long View": "tools/navigation/spyglass-telescope-brass.webp",
  "Breathe Under Water": "magic/water/bubbles-air-water-blue.webp",
  "Hide Things": "containers/bags/pouch-leather-leaf-green.webp",
  "Talk to Beasts": "creatures/abilities/paw-print-orange.webp",
  "Feel the Path": "environment/wilderness/terrain-river-road-gray.webp"
};

/** Backpack gear: the first keyword rule that matches the item's name wins. */
const GEAR_RULES = [
  [/spell ?book/i, "sundries/books/book-open-purple.webp"],
  [/first aid|bandage/i, "tools/medical/bandages-gauze.webp"],
  [/balm|cream|ointment|antidote|medicine/i, "consumables/potions/potion-jar-capped-teal.webp"],
  [/binocular|spyglass|telescope/i, "tools/navigation/spyglass-telescope-brass.webp"],
  [/magnifying|lens/i, "tools/scribal/lens-grey-brown.webp"],
  [/sunglasses/i, "equipment/head/glasses-sun-aviator.webp"],
  [/glasses|goggles|spectacle/i, "equipment/head/glasses-spectacles.webp"],
  [/helmet|visor/i, "equipment/head/helmet-military-green.webp"],
  [/crown/i, "equipment/head/hat-tophat.webp"],
  [/hat\b|hats\b|headdress/i, "equipment/head/hat-belted-simple-brown.webp"],
  [/hood/i, "equipment/back/cloak-hooded-red.webp"],
  [/cape|cloak/i, "equipment/back/cloak-brown.webp"],
  [/raincoat|coat|jacket/i, "equipment/chest/coat-leather-blue.webp"],
  [/apron/i, "equipment/chest/breastplate-collared-leather-brown.webp"],
  [/chestplate|armor|armour|chain mail|tabard/i, "equipment/chest/breastplate-banded-steel-gold.webp"],
  [/uniform|suit|clothes|blouse|pyjamas|pajamas|shirt/i, "equipment/chest/shirt-collared-brown.webp"],
  [/scarf|scarves|bandana|handkerchie|ribbon/i, "commodities/cloth/cloth-bolt-embroidered-pink.webp"],
  [/boots?\b|shoes/i, "equipment/feet/boots-armored-green.webp"],
  [/necklace|medallion|collar|chain\b|nameplate|ring\b/i, "equipment/neck/necklace-charm-clover.webp"],
  [/talisman|charm/i, "commodities/treasure/talisman-embossed-rune-red.webp"],
  [/mask/i, "commodities/treasure/mask-wood-tan.webp"],
  [/sword|rapier|machete/i, "weapons/swords/greatsword-crossguard-blue.webp"],
  [/knife|dagger/i, "weapons/daggers/dagger-black.webp"],
  [/spear|pike|halberd/i, "weapons/polearms/spear-flared-gold.webp"],
  [/\bax\b|\baxe\b|pickaxe/i, "tools/hand/shovel-spade-steel-brown-grey.webp"],
  [/bow\b|arrows/i, "weapons/bows/bow-recurve-black.webp"],
  [/whip/i, "weapons/misc/whip-leather.webp"],
  [/darts?\b/i, "weapons/thrown/dart-feathered.webp"],
  [/net\b/i, "environment/traps/net.webp"],
  [/hammer/i, "tools/hand/wrench-adjustable.webp"],
  [/wrench|pliers|tools?\b|multimeter|analy[sz]er|screwdriver|hooks?\b|oil can/i, "tools/hand/wrench-adjustable-toothed.webp"],
  [/tape/i, "sundries/survival/rope-coil-brown.webp"],
  [/rope|twine|plumbline|grappling/i, "sundries/survival/rope-coil-brown.webp"],
  [/compass/i, "tools/navigation/compass-brass-blue-red.webp"],
  [/map\b|maps\b/i, "sundries/documents/document-letter-tan.webp"],
  [/watch|clock|time-estimating|calculator/i, "commodities/tech/watch.webp"],
  [/scales/i, "tools/hand/scale-balances-merchant-brown.webp"],
  [/lamp|lantern|headlight|headlamp|torch/i, "commodities/treasure/lantern-stone-grey.webp"],
  [/notebook|pencil|stylus|inkstand|diagram|book|treatise|recipe|guide|photo|letter/i, "sundries/books/book-notebook-spiral-blue.webp"],
  [/wand/i, "weapons/wands/wand-carved-pink.webp"],
  [/broom/i, "tools/hand/broom-straw-brown.webp"],
  [/cane|walking stick|stick\b/i, "skills/melee/hand-grip-staff-teal.webp"],
  [/cauldron/i, "tools/cooking/cauldron-empty.webp"],
  [/tea set|ladle|pots?\b/i, "tools/cooking/cauldron-empty.webp"],
  [/brush|comb/i, "tools/hand/brush-paint-brown-tan.webp"],
  [/paint/i, "tools/hand/brush-paint-pink.webp"],
  [/mirror/i, "sundries/survival/mirror-plain.webp"],
  [/tarot|cards\b/i, "sundries/gaming/playing-cards-brown.webp"],
  [/record player|records\b|gramophone/i, "tools/instruments/gramophone-vinyl-record-player.webp"],
  [/flute|bird call|whistle/i, "tools/instruments/flute-simple-wood.webp"],
  [/trumpet|horn\b|bagpipes/i, "tools/instruments/horn-flared-wood.webp"],
  [/shamisen|barrel organ|guitar|lute|microphone/i, "tools/instruments/lute-gold-brown.webp"],
  [/bell\b/i, "tools/instruments/bell-brass.webp"],
  [/ball\b|juggling|yo-yo|toy|unicycle/i, "weapons/misc/yo-yo.webp"],
  [/statue|figurine/i, "commodities/treasure/figurine-dog.webp"],
  [/candy|sweets?\b|cereal|snack/i, "consumables/food/candy-bar.webp"],
  [/acorn/i, "consumables/nuts/hazelnut-acorn-tan-brown.webp"],
  [/spice|sauce|oil\b|salt|pepper|mushroom powder|food/i, "consumables/food/salt-seasoning-spice-pink.webp"],
  [/flask|bottle|alcohol/i, "consumables/potions/bottle-pear-corked-blue.webp"],
  [/soap|shampoo|perfume|fragrance/i, "sundries/survival/soap.webp"],
  [/smoke/i, "commodities/tech/smoke-bomb-yellow.webp"],
  [/pillow|cushion|rug|inner tube/i, "commodities/cloth/cloth-bolt-embroidered-pink.webp"],
  [/key/i, "sundries/misc/key-brass.webp"],
  [/coin|gold|jewel|bling|trinket|treasure/i, "commodities/currency/coin-embossed-crown-gold.webp"],
  [/cricket|mount/i, "creatures/abilities/paw-print-orange.webp"],
  [/bag|backpack|satchel|suitcase|pouch/i, "containers/bags/satchel-leather-brown.webp"],
  [/fishhook|fishtank|fish/i, "commodities/bones/bones-fish-white.webp"],
  [/teeth/i, "creatures/abilities/fangs-teeth-bite.webp"],
  [/kit/i, "tools/hand/wrench-adjustable-toothed.webp"],
  [/weapons/i, "weapons/swords/greatsword-crossguard-blue.webp"],
  [/paper|cassette|communicator/i, "sundries/books/book-notebook-spiral-blue.webp"],
  [/locket/i, "equipment/neck/necklace-charm-clover.webp"],
  [/sausage/i, "consumables/food/salt-seasoning-spice-pink.webp"]
];

const GEAR_FALLBACK = "containers/bags/pouch-simple-brown.webp";

export function spellIcon(name) {
  const path = SPELL_ICONS[name];
  return ICONS + (path ?? "sundries/books/book-open-purple.webp");
}

export function gearIcon(name) {
  const rule = GEAR_RULES.find(([pattern]) => pattern.test(name ?? ""));
  return ICONS + (rule ? rule[1] : GEAR_FALLBACK);
}

/** Every icon path this module can hand out (for tests). */
export const ALL_ICON_PATHS = [...Object.values(SPELL_ICONS), ...GEAR_RULES.map(([, p]) => p), GEAR_FALLBACK];
