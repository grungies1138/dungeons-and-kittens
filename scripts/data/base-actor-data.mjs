import { SKILLS } from "../skills.mjs";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Fields shared by every Actor type: abilities, Heart/Furr-endship, and a free-text biography.
 * Heart max is Strong + Smart and Furr-endship max is Cute (p.18). `heart.bonus` is temporary
 * extra maximum Heart, e.g. from a Heart Charm until the next dawn (p.39).
 */
export class DnkActorBaseData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const ability = () => new fields.SchemaField({
      value: new fields.NumberField({ required: true, integer: true, min: 1, max: 6, initial: 3 })
    });
    const resource = (initial) => new fields.SchemaField({
      value: new fields.NumberField({ required: true, integer: true, min: 0, initial }),
      max: new fields.NumberField({ required: true, integer: true, min: 0, initial })
    });

    const heart = new fields.SchemaField({
      value: new fields.NumberField({ required: true, integer: true, min: 0, initial: 6 }),
      max: new fields.NumberField({ required: true, integer: true, min: 0, initial: 6 }),
      bonus: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 })
    });

    return {
      abilities: new fields.SchemaField({
        strong: ability(),
        smart: ability(),
        cute: ability()
      }),
      resources: new fields.SchemaField({
        heart,
        furrendship: resource(3)
      }),
      biography: new fields.StringField({ required: false, blank: true, initial: "" })
    };
  }

  /**
   * The Quickstart character sheets listed "Treating Beasts" as a skill, but in the Core Rulebook
   * it's a Country Meowgic spell and the skill is Care of Beasts (pp.19, 40). Fold the old key in.
   */
  static migrateData(source) {
    const skills = source.skills;
    if (skills?.treatingBeasts) {
      if (skills.treatingBeasts.trained && SKILLS.includes("careOfBeasts")) skills.careOfBeasts = { trained: true };
      delete skills.treatingBeasts;
    }
    return super.migrateData(source);
  }

  prepareDerivedData() {
    const { strong, smart, cute } = this.abilities;
    const { heart, furrendship } = this.resources;

    heart.max = strong.value + smart.value + (heart.bonus ?? 0);
    heart.value = clamp(heart.value, 0, heart.max);

    furrendship.max = cute.value;
    furrendship.value = clamp(furrendship.value, 0, Math.max(furrendship.max, 0));
  }
}
