import { ensureWorldPack } from "./packs.mjs";

/** Bump whenever data/rulebook.json is regenerated so existing worlds get the refreshed text. */
export const RULEBOOK_DATA_VERSION = 2;

let cache = null;
async function loadRulebook() {
  cache ??= await (await fetch("systems/dungeons-and-kittens/data/rulebook.json")).json();
  return cache;
}

/**
 * "Dungeons & Kittens: Core Rulebook" - the book's full text (included with the publisher's
 * permission), one journal entry per chapter and one journal page per book page.
 */
export async function ensureRulebookCompendium() {
  if (!game.user.isGM) return;
  const data = await loadRulebook();
  const entries = data.entries.map((entry, i) => ({
    name: entry.name,
    sort: (i + 1) * 100000,
    pages: entry.pages.map((p, j) => ({
      name: p.name,
      type: "text",
      title: { show: false, level: 1 },
      text: { format: 1, content: p.html },
      sort: (j + 1) * 100000,
      flags: { "dungeons-and-kittens": { bookPage: p.page } }
    }))
  }));
  return ensureWorldPack({
    name: "dnk-rulebook",
    label: "Dungeons & Kittens: Core Rulebook",
    type: "JournalEntry",
    version: RULEBOOK_DATA_VERSION,
    setting: "rulebookDataVersion",
    build: () => entries
  });
}
