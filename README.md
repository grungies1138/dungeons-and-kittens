# Dungeons & Kittens (unofficial Foundry VTT system)

A fan-made Foundry Virtual Tabletop system implementing the rules of **Dungeons & Kittens**,
the cooperative animal-fantasy roleplaying game written by Trickytophe / François Cedelle
(Studio Deadcrows) and published by EDGE Studio (Asmodee Group), used with the publisher's
permission. This project is **not** affiliated with or endorsed by Asmodee, EDGE Studio, or
Deadcrows Studio, and contains no artwork from their books. Rules are implemented from the
**Core Rulebook**; game data (names, numbers, spell levels, item lists, tables) is carried over,
while every description is written in this project's own words, with page references.

If you enjoy the game, please support the creators by buying the **Dungeons & Kittens Starter
Set** and **Core Rulebook**.

## Rules implemented

**Rolling (pp.16, 45-52)**
- Roll 3d6 against Strong, Smart, or Cute; each die at or under the score is a success.
  Advantage rolls 4d6, Disadvantage 2d6; they cancel one for one.
- Difficulty Easy 1 / Medium 2 / Difficult 3 / Legendary 4. The chat card reads the result the
  book's way: **success**, **short of the difficulty** (the player chooses to fail cleanly or
  succeed with a complication), or **failure** (no successes).
- **Re-rolls stack**: click a die to pick it, then re-roll from each relevant Purr-ecious item,
  the Cattribute (an Extra's description), or a GM-granted "good idea".
- Triples are flagged; Furr-endship buys automatic successes (max 4 per test).
- Advantage/Disadvantage token icons and injuries pre-fill the roll dialog, which also lets
  Catfight actions pick among the abilities they allow.

**Kittens (pp.11-43)**
- Creation check: 8 ability points, each 1-5, shown live on the sheet.
- **All 18 Childhoods**: pick one from the sheet to set the Cattribute and add its five
  Purr-ecious items (Bearcub gets seven slots). Random name and character-trait buttons use the
  book's tables.
- **Purr-ecious items**: every personal item is one; the backpack counts them against the
  five-item limit (items can be marked as not taking a slot, e.g. inheritance coins).
- **Character traits**: once per session each - "Trait helps" grants an Advantage, "Trait
  hinders" gives a targeted comrade 1 Furr-endship.
- **Heart & Furr-endship**: derived maximums; 0 Heart marks the token Out of the Scene
  automatically. "Pamper a friend" trades 1 Furr-endship for 1 Heart (not during a Catfight).
- **Experience (p.42)**: +1 per session, +1 for an adventure or goal (GM Tools macros). The
  **Improve** button buys abilities (2 x the new level), skills (2), spells (2), and extra
  Purr-ecious slots (4).

**Meowgic (pp.37-41)**
- All 36 spells across the six paths in a Spells compendium; the path sets the casting ability.
- Each spell is free once a day, spent whether it works or not; recasting costs 1 Heart until
  a night's rest (a moon icon marks spells already cast).
- A failed cast can be **forced** with a Meowgic accident roll from the chat card.

**Catfights (pp.56-60)**
- Fang and Claw Catfights. Entering a Claw Catfight costs 1 Furr-endship **once** (Claw Attack
  enters automatically); with none left the Kitten must flee. Ending the combat clears it.
- Actions grouped as aggressive (Fang/Claw Attack, Hinder) and non-aggressive (Defend, Help, Move,
  Interact, Heal Ally). Aggressive actions drop the actor below the initiative tie.
- **Help** needs no roll: it gives the targeted comrade an Advantage. **Hinder** gives the
  target a Disadvantage. **Defend** cancels attack successes against the defender *or comrades*
  for the rest of the turn.
- Concede a Fang Catfight; Flee (Smart) or Surrender (Cute) to leave a Claw Catfight.
- A Kitten dropping to 0 Heart in a Claw Catfight rolls on the **injury table**: minor injuries
  last until the next rest, incapacitation counts down per night's rest, major injuries and lost
  meowgic heal when an adventure completes, and a critical injury lets the player choose which
  ability to lose.

**Extras (p.65)**: Extras have skills, spells, and Purr-ecious items like Kittens, with the
book's tier guide on the sheet.

**Also**: Heal Ally (Smart test, once per half-day per recipient), lunch and night rests,
optional Dice So Nice colorset.

## Installation

Install via the manifest URL
`https://github.com/grungies1138/dungeons-and-kittens/releases/latest/download/system.json`,
or copy this folder into `Data/systems/dungeons-and-kittens`, then create a world using the
"Dungeons & Kittens" system.

## Compendiums

Built automatically the first time a GM loads a world, and rebuilt whenever this system ships
updated content. Look under "World" in the Compendium sidebar.

| Compendium | Contents |
| --- | --- |
| Pregenerated Kittens | Sparkle, Bobbin, Camilla Bellefleur, Dart, and Cheesy from the Quickstart. |
| Player's Guide | Kitten creation (with all Childhoods and spells), rules and sheet hints, skill reference. |
| Spells | All 36 spells, ready to drag onto a sheet. |
| Bestiary | The Core Rulebook's named Extras (about 70), with skills, spells, and items. |
| Tables | Character Trait, Childhood (weighted like the book), Kitten Name, Meowgic Accident, Claw Injury, and the Selene's Nightmare generator. |
| GM Tools | Party-wide macros (below). |
| Companion API | Macros for external tools (below). |

If one doesn't appear, run the matching console command, e.g.
`await game.dnk.ensureSpellsCompendium();` (also `ensurePregenCompendium`,
`ensureGuideCompendium`, `ensureBestiaryCompendium`, `ensureTablesCompendium`,
`ensureGmToolsCompendium`, `ensureCompanionApiCompendium`). `await game.dnk.importPregens();`
drops the five pregens straight into the Actors directory.

## GM Tools

Each acts on the selected tokens' actors, or every Kitten in the world if nothing is selected.

| Macro | Effect |
| --- | --- |
| DNK: Apply Lunch Rest | +1 Heart; clears the half-day heal cooldown and minor injuries. |
| DNK: Apply Night's Rest | As lunch, plus resets spells and counts down incapacitation. |
| DNK: Grant Party Furr-endship | +1 Furr-endship (a good evening, a safe night, a moving show). |
| DNK: End Session (+1 XP) | +1 experience; character traits can be used again. |
| DNK: Adventure Complete (+1 XP) | +1 experience; heals adventure-long injuries and lost meowgic. |
| DNK: Goal Reached (+1 XP) | +1 experience. |

Kittens also have their own **Night's Rest** button in the sheet's title bar.

## Companion API (for external tools, e.g. a mobile character-sheet app)

Thin script macros calling the same functions as the sheet's buttons (`game.dnk.api`), so a tool
that can execute a Foundry macro with a `scope` object can drive rolls and resources without
reimplementing rules. Each returns a plain object or throws a localized `Error`.

| Macro | `scope` fields |
| --- | --- |
| DNK API: Roll Ability Test | `actorId`, `ability`, `flavor?`, `advantage?`, `disadvantage?`, `difficulty?` |
| DNK API: Roll Combat Action | `actorId`, `presetKey` (`fangAttack`/`clawAttack`/`defend`/`help`/`hinder`/`move`/`interact`/`healAlly`/`flee`/`surrender`), `ability?`, `advantage?`, `disadvantage?`, `difficulty?` |
| DNK API: Roll Spell | `actorId`, `itemId`, `advantage?`, `disadvantage?` |
| DNK API: Adjust Resource | `actorId`, `resource` (`heart`/`furrendship`), `delta` |
| DNK API: Spend Furrendship | `messageId` |
| DNK API: Reroll | `messageId`, `source?` (`item`/`cattribute`/`idea`), `dieIndex?` |
| DNK API: Set Block | `messageId` (a Defend roll) |
| DNK API: Heal Targets | `messageId` (a Heal Ally roll) |
| DNK API: Apply Hinder | `messageId` (a Hinder roll) |
| DNK API: Force Spell (Meowgic Accident) | `messageId` (a failed spell) |
| DNK API: Improve (Spend Experience) | `actorId`, `kind` (`ability`/`skill`/`spell`/`slot`), `key` |
| DNK API: Set Claw Catfight | `actorId`, `inClaw` |
