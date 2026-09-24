import { SPELL_PATHS } from "../content.mjs";

export class DnkSpellData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      path: new fields.StringField({ required: true, blank: true, initial: "", choices: ["", ...Object.keys(SPELL_PATHS)] }),
      ability: new fields.StringField({ required: true, initial: "smart", choices: ["strong", "smart", "cute"] }),
      successes: new fields.NumberField({ required: true, integer: true, min: 1, max: 4, initial: 1 }),
      description: new fields.StringField({ required: false, blank: true, initial: "" }),
      recastCost: new fields.NumberField({ required: true, integer: true, min: 0, initial: 1 })
    };
  }

  /** A spell's path decides its ability (p.37), so keep them in step. */
  prepareDerivedData() {
    const path = SPELL_PATHS[this.path];
    if (path) this.ability = path.ability;
  }
}
