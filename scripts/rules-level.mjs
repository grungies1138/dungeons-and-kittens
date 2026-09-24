/**
 * "Lighter rules for younger children" (Appendix): the rules can be introduced one step at a time.
 * A world setting picks how many are in play; the default is the full game.
 */
export const RULES_LEVELS = {
  1: "DNK.RulesLevel.1",
  2: "DNK.RulesLevel.2",
  3: "DNK.RulesLevel.3",
  4: "DNK.RulesLevel.4",
  5: "DNK.RulesLevel.5",
  6: "DNK.RulesLevel.6"
};
export const FULL_RULES = 6;

export function registerRulesLevel() {
  game.settings.register("dungeons-and-kittens", "rulesLevel", {
    name: "DNK.RulesLevelName",
    hint: "DNK.RulesLevelHint",
    scope: "world",
    config: true,
    type: Number,
    choices: RULES_LEVELS,
    default: FULL_RULES,
    requiresReload: false
  });
}

function level() {
  try {
    return game.settings.get("dungeons-and-kittens", "rulesLevel");
  } catch (_err) {
    return FULL_RULES;
  }
}

/** Which rules are in play at the current level. */
export function rules() {
  const l = level();
  return {
    triples: l >= 2,
    rerolls: l >= 3,
    difficulty: l >= 4,
    advantages: l >= 5,
    furrendship: l >= 6
  };
}
