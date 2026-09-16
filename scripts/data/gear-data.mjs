export class DnkGearData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.StringField({ required: false, blank: true, initial: "" }),
      quantity: new fields.NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      purrecious: new fields.BooleanField({ required: true, initial: false })
    };
  }
}
