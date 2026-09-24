import { DnkActorBaseData } from "./base-actor-data.mjs";
import { SKILLS } from "../skills.mjs";

/**
 * Extras are built like simplified Kittens (p.65): abilities, Heart, skills, spells, and
 * Purr-ecious items. The one-line `role` is their description - when it fits what they're
 * doing, they get a re-roll.
 */
export class DnkExtraData extends DnkActorBaseData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const text = () => new fields.StringField({ required: false, blank: true, initial: "" });

    return {
      ...super.defineSchema(),
      details: new fields.SchemaField({
        role: text(),
        notes: text()
      }),
      skills: new fields.SchemaField(
        Object.fromEntries(SKILLS.map(key => [
          key,
          new fields.SchemaField({ trained: new fields.BooleanField({ required: true, initial: false }) })
        ]))
      )
    };
  }
}
