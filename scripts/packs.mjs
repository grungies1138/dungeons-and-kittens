/**
 * World compendiums are built at runtime rather than shipped as LevelDB (which can't be
 * hand-authored reliably). Each one is created on first load and wiped and rebuilt whenever its
 * data version in the source is bumped, so content fixes reach worlds that already exist.
 */
export async function ensureWorldPack({ name, label, type, version, setting, build }) {
  if (!game.user.isGM) return;

  let pack = game.packs.get(`world.${name}`);
  if (!pack) pack = await CompendiumCollection.createCompendium({ type, name, label });

  if (game.settings.get("dungeons-and-kittens", setting) >= version) return;

  const cls = CONFIG[type].documentClass;
  const index = await pack.getIndex();
  if (index.size > 0) await cls.deleteDocuments(Array.from(index.keys()), { pack: pack.collection });

  await cls.createDocuments(build(), { pack: pack.collection });
  await game.settings.set("dungeons-and-kittens", setting, version);
  ui.notifications.info(`Dungeons & Kittens: refreshed the ${label} compendium.`);
}
