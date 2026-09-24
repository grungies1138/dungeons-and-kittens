export class DnkGearData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.StringField({ required: false, blank: true, initial: "" }),
      quantity: new fields.NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      /** Every personal backpack item is Purr-ecious (p.23); only everyday supplies aren't. */
      purrecious: new fields.BooleanField({ required: true, initial: true }),
      /** Items that don't take a backpack slot, like the Young Noble's inheritance coins. */
      slotFree: new fields.BooleanField({ required: true, initial: false })
    };
  }
}
