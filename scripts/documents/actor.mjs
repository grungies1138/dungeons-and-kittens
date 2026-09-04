function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * The Dungeons & Kittens Actor document.
 * Heart max is always Strong + Smart; Furr-endship max is always Cute,
 * per the Game Mechanics Quick Reference.
 */
export class DnkActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();
    const system = this.system;
    if (!system?.abilities || !system?.resources) return;

    const strong = Number(system.abilities.strong?.value ?? 0);
    const smart = Number(system.abilities.smart?.value ?? 0);
    const cute = Number(system.abilities.cute?.value ?? 0);

    if (system.resources.heart) {
      system.resources.heart.max = strong + smart;
      system.resources.heart.value = clamp(Number(system.resources.heart.value ?? 0), 0, system.resources.heart.max);
    }

    if (system.resources.furrendship) {
      system.resources.furrendship.max = cute;
      system.resources.furrendship.value = clamp(Number(system.resources.furrendship.value ?? 0), 0, Math.max(system.resources.furrendship.max, 0));
    }
  }

  /** Adjust a clamped resource (heart or furrendship) by a delta, respecting 0..max. */
  async adjustResource(key, delta) {
    const resource = this.system.resources?.[key];
    if (!resource) return;
    const value = clamp(Number(resource.value ?? 0) + Number(delta), 0, Number(resource.max ?? 0));
    return this.update({ [`system.resources.${key}.value`]: value });
  }
}
