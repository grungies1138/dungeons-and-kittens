export class DnkSpellData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ability: new fields.StringField({ required: true, initial: "smart", choices: ["strong", "smart", "cute"] }),
      successes: new fields.NumberField({ required: true, integer: true, min: 1, max: 4, initial: 1 }),
      description: new fields.StringField({ required: false, blank: true, initial: "" }),
      recastCost: new fields.NumberField({ required: true, integer: true, min: 0, initial: 1 })
    };
  }
}
