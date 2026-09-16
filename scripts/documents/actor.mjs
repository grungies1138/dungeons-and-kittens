function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * The Dungeons & Kittens Actor document.
 * Deriving Heart/Furr-endship maximums lives on the system data model
 * (see scripts/data/base-actor-data.mjs) since that's where the ability values live.
 */
export class DnkActor extends Actor {
  /** Adjust a clamped resource (heart or furrendship) by a delta, respecting 0..max. */
  async adjustResource(key, delta) {
    const resource = this.system.resources?.[key];
    if (!resource) return;
    const value = clamp(Number(resource.value ?? 0) + Number(delta), 0, Number(resource.max ?? 0));
    return this.update({ [`system.resources.${key}.value`]: value });
  }
}
