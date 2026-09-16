function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Fields shared by every Actor type: abilities, Heart/Furr-endship, and a free-text biography.
 * Heart max is always Strong + Smart; Furr-endship max is always Cute,
 * per the Game Mechanics Quick Reference.
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

    return {
      abilities: new fields.SchemaField({
        strong: ability(),
        smart: ability(),
        cute: ability()
      }),
      resources: new fields.SchemaField({
        heart: resource(6),
        furrendship: resource(3)
      }),
      biography: new fields.StringField({ required: false, blank: true, initial: "" })
    };
  }

  prepareDerivedData() {
    const { strong, smart, cute } = this.abilities;
    const { heart, furrendship } = this.resources;

    heart.max = strong.value + smart.value;
    heart.value = clamp(heart.value, 0, heart.max);

    furrendship.max = cute.value;
    furrendship.value = clamp(furrendship.value, 0, Math.max(furrendship.max, 0));
  }
}
