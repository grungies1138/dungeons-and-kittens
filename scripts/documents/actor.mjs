function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * The Dungeons & Kittens Actor document. Heart/Furr-endship maximums are derived on the data
 * model (scripts/data/base-actor-data.mjs).
 */
export class DnkActor extends Actor {
  /** A new character starts with full Heart and Furr-endship (p.18), unless values were given. */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;
    const abilities = this.system.abilities;
    const given = foundry.utils.getProperty(data, "system.resources") ?? {};
    const update = {};
    if (given.heart?.value === undefined) update["system.resources.heart.value"] = abilities.strong.value + abilities.smart.value;
    if (given.furrendship?.value === undefined) update["system.resources.furrendship.value"] = abilities.cute.value;
    if (Object.keys(update).length) this.updateSource(update);
  }

  /** Adjust a clamped resource (heart or furrendship) by a delta, respecting 0..max. */
  async adjustResource(key, delta) {
    const resource = this.system.resources?.[key];
    if (!resource) return;
    const value = clamp(Number(resource.value ?? 0) + Number(delta), 0, Number(resource.max ?? 0));
    return this.update({ [`system.resources.${key}.value`]: value });
  }
}
