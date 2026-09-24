import { DnkActorBaseData } from "./base-actor-data.mjs";
import { SKILLS } from "../skills.mjs";
import { BASE_PURRECIOUS_SLOTS } from "../content.mjs";

export class DnkKittenData extends DnkActorBaseData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const text = () => new fields.StringField({ required: false, blank: true, initial: "" });
    const trait = () => new fields.SchemaField({ name: text(), description: text() });

    return {
      ...super.defineSchema(),
      details: new fields.SchemaField({
        player: text(),
        childhood: text(),
        characterTrait: trait(),
        cattribute: trait()
      }),
      experience: new fields.SchemaField({
        current: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        total: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 })
      }),
      /** Purr-ecious slots beyond the base five, from a childhood (Bearcub) or bought with experience. */
      purreciousBonus: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      skills: new fields.SchemaField(
        Object.fromEntries(SKILLS.map(key => [
          key,
          new fields.SchemaField({ trained: new fields.BooleanField({ required: true, initial: false }) })
        ]))
      )
    };
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    this.purreciousSlots = BASE_PURRECIOUS_SLOTS + this.purreciousBonus;
  }
}
