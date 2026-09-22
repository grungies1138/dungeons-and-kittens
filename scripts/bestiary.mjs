/**
 * "Bestiary": a handful of ready-to-drop-in Extra NPCs for the Storyteller side, mirroring
 * pregens.mjs but for the "extra" actor type. These are original content (no stat blocks are
 * published in the free Quick Reference/Quickstart PDFs) - generic post-apocalyptic-animal-world
 * antagonists/wildlife, not specific named characters from the books.
 */

/** Bump this whenever BESTIARY_EXTRAS changes so existing worlds get the refreshed data. */
export const BESTIARY_DATA_VERSION = 1;

function extra({ name, role, strong, smart, cute, notes }) {
  const heart = strong + smart;
  return {
    name,
    type: "extra",
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
      details: { role, notes }
    }
  };
}

export const BESTIARY_EXTRAS = [
  extra({
    name: "Feral Alley Cat",
    role: "Scrappy street brawler",
    strong: 3, smart: 2, cute: 1,
    notes: "Fights dirty and bolts the moment a fight turns against it - a Hinder or a loud noise is usually enough to send it packing."
  }),
  extra({
    name: "Stray Hound",
    role: "Territorial guard dog",
    strong: 4, smart: 2, cute: 1,
    notes: "Big, loud, and easily provoked, but not actually looking to hurt anyone who backs off. Barks (Hinder) before it bites (Fang Attack)."
  }),
  extra({
    name: "Marsh Hawk",
    role: "Aerial hunter",
    strong: 2, smart: 3, cute: 1,
    notes: "Circles overhead before diving. Hard to Hinder while airborne; easier to Defend against once it's committed to a dive."
  }),
  extra({
    name: "River Rat Bandit",
    role: "Opportunistic thief",
    strong: 2, smart: 3, cute: 2,
    notes: "Would rather Pickpocket a satchel and flee than fight. If cornered, uses Claw Attack once, then Moves to break away."
  }),
  extra({
    name: "Broken Fence Boar",
    role: "Grumpy pasture guardian",
    strong: 5, smart: 1, cute: 1,
    notes: "Slow to anger but devastating once riled - its high Strong makes Fang Attack land often. A well-timed Hinder or Defend goes a long way."
  })
];

const BESTIARY_PACK_NAME = "dnk-bestiary";
const VERSION_SETTING = "bestiaryDataVersion";

/**
 * Make sure the "Bestiary" compendium of starter Extra NPCs exists for this world, is
 * populated, and matches the current BESTIARY_DATA_VERSION.
 */
export async function ensureBestiaryCompendium() {
  if (!game.user.isGM) return;

  let pack = game.packs.get(`world.${BESTIARY_PACK_NAME}`);
  if (!pack) {
    pack = await CompendiumCollection.createCompendium({
      type: "Actor",
      name: BESTIARY_PACK_NAME,
      label: "Dungeons & Kittens: Bestiary"
    });
  }

  const storedVersion = game.settings.get("dungeons-and-kittens", VERSION_SETTING);
  if (storedVersion >= BESTIARY_DATA_VERSION) return;

  const index = await pack.getIndex();
  if (index.size > 0) {
    await Actor.deleteDocuments(Array.from(index.keys()), { pack: pack.collection });
  }

  await Actor.createDocuments(BESTIARY_EXTRAS, { pack: pack.collection });
  await game.settings.set("dungeons-and-kittens", VERSION_SETTING, BESTIARY_DATA_VERSION);
  ui.notifications.info("Dungeons & Kittens: refreshed the Bestiary compendium.");
}
