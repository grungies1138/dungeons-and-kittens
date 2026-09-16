import { DnkActorBaseData } from "./base-actor-data.mjs";

export class DnkExtraData extends DnkActorBaseData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const text = () => new fields.StringField({ required: false, blank: true, initial: "" });

    return {
      ...super.defineSchema(),
      details: new fields.SchemaField({
        role: text(),
        notes: text()
      })
    };
  }
}
