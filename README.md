# Dungeons & Kittens (unofficial Foundry VTT system)

A fan-made Foundry Virtual Tabletop system implementing the rules of **Dungeons & Kittens**,
the cooperative animal-fantasy roleplaying game written by Trickytophe / François Cedelle
(Studio Deadcrows) and published by EDGE Studio (Asmodee Group). This project is **not**
affiliated with or endorsed by Asmodee, EDGE Studio, or Deadcrows Studio, and contains no
artwork or text reproduced from their books — only an original implementation of the
publicly documented game mechanics (the free "Game Mechanics Quick Reference" and Quickstart
Adventure PDFs from edge-studio.net).

If you enjoy the game, please support the creators by buying the **Dungeons & Kittens Starter
Set** and **Core Rulebook**.

## Mechanics implemented

- **Abilities**: Strong, Smart, Cute. Roll 3d6, each die ≤ the ability's score is a success.
- **Advantage / Disadvantage**: roll 4d6 or 2d6 instead of 3d6 (net sources only; ties cancel
  back to 3d6).
- **Triples**: any test where 3+ dice show the same value gets a narrative bonus, win or lose.
- **Difficulty**: Easy (1 success), Medium (2), Difficult (3), Legendary (4).
- **Heart**: a Kitten's health/confidence, max = Strong + Smart. At 0 the Kitten is out of the
  scene, never dead.
- **Furr-endship**: morale currency, max = Cute. Spend 1 for an automatic success (max 4 per
  test) or to hand a Heart point to a friend.
- **Skills**: the 25 skills from the character sheet, toggled trained/untrained (skills grant
  Advantage when relevant — call it as GM). Hover any skill, ability, resource, or backpack/
  spellbook item on the sheet for a tooltip explaining what it does.
- **Spellbook**: per-character "spells"/special abilities with an ability + success threshold,
  rollable straight from the sheet. The first cast of a spell each day is free; recasting it
  before a night's rest automatically charges its recast cost in Heart (and refuses the recast
  if you can't afford it) — a moon icon next to a spell marks it as already cast today.
- **Backpack**: simple gear list. A "Purr-ecious" item lets the chat card's reroll button
  appear at all — it only shows up if the actor actually owns one.
- **Catfights**: quick-roll buttons for Fang Attack, Claw Attack, Defend, Help, Hinder, Move, and
  Heal Ally, plus chat-card buttons to apply Heart damage to a targeted token, lock in a Defend
  roll's successes as a Block (automatically absorbed by the next hit against you), and heal a
  targeted ally's Heart (capped at once per half-day per recipient, tracked automatically).
- **Out of the Scene**: a Kitten's token is automatically marked "Out of the Scene" (and its
  combatant flagged defeated, if a combat is running) the moment its Heart hits 0 — and cleared
  again once Heart rises back above 0. No manual bookkeeping.
- **Night's Rest button**: a moon icon in the Kitten sheet's own title bar (next to "Prototype
  Token"/"Close") applies a night's rest to that one character — +1 Heart, resets the half-day
  heal cooldown, and clears every spell's recast-used flag. Self-service for players; no GM
  action required. For resting the whole party at once, see the GM Tools compendium below.
- **Advantage/Disadvantage token status**: toggle these two icons on a token's status effects and
  the roll dialog will pre-fill that count the next time you roll for that actor.
- **Dice So Nice**: if that module is active, a "Dungeons & Kittens" colorset is registered as a
  selectable option (never forced on anyone).

Skill descriptions are original interpretations written for this system (the publicly available
PDFs list skill names only, not flavor text) — treat them as suggestions, not verbatim rulebook
text, and use your own judgment or the Core Rulebook's wording at the table.

## Installation

Copy this folder into your Foundry `Data/systems/dungeons-and-kittens` directory (or install
via manifest URL if you host `system.json` somewhere), then create a world using the
"Dungeons & Kittens" system.

## Actor types

- **Kitten** — full player character sheet.
- **Extra** — a lightweight NPC sheet for the Storyteller (abilities + Heart + basic catfight
  actions).

## Pregenerated Kittens

The first time a GM loads a world using this system, it automatically creates and populates a
world compendium called **"Dungeons & Kittens: Pregenerated Kittens"** with the five official
ready-to-play characters from the Quickstart Adventure (Sparkle, Bobbin, Camilla Bellefleur,
Dart, and Cheesy), stats/spells/gear included. Look for it in the Compendium sidebar tab under
"World". If it doesn't appear, open the console (F12) and run:

```js
await game.dnk.ensurePregenCompendium();
```

You can also skip the compendium and drop the five pregens straight into your Actors directory
with:

```js
await game.dnk.importPregens();
```

## Player's Guide compendium

Alongside the pregens, the system also auto-creates a **"Dungeons & Kittens: Player's Guide"**
journal compendium with two entries:

- **How to Create a Kitten** — a 9-page step-by-step character creation tutorial (name &
  childhood, abilities, Heart/Furr-endship, skills, character trait & cattribute, spellbook,
  backpack), written for this Foundry sheet specifically.
- **Playing the Game: Mechanics & Sheet Hints** — an 8-page reference covering the core roll,
  advantage/disadvantage/difficulty, spending Furr-endship, trained skills, casting spells,
  Purr-ecious items, catfights, and a one-page cheat sheet.
- **Skill Reference** — all 25 skills with a full description of what each one covers.

If it doesn't appear after loading a world, run:

```js
await game.dnk.ensureGuideCompendium();
```

Both the Pregenerated Kittens and Player's Guide compendia are version-tracked: if you update
this system and the bundled data version changes, the next world load automatically deletes and
rebuilds the compendium contents so you get the refreshed text without doing anything by hand.

## Character Tables compendium

A world RollTable compendium called **"Dungeons & Kittens: Character Tables"** with three quick
d20/d16 tables — **Childhood Idea**, **Character Trait Idea**, and **Cattribute Idea** — for a
fast spark of inspiration during character creation. These are original homebrew suggestions
written for this system, not a transcription of the Core Rulebook's own (longer) official lists.
If it doesn't appear, run:

```js
await game.dnk.ensureTablesCompendium();
```

## Bestiary compendium

A world Actor compendium called **"Dungeons & Kittens: Bestiary"** with five ready-to-drop-in
"Extra" NPCs (Feral Alley Cat, Stray Hound, Marsh Hawk, River Rat Bandit, Broken Fence Boar) for
a Storyteller who wants a quick antagonist without building one from scratch. Original content —
no stat blocks are published in the free Quick Reference/Quickstart PDFs. If it doesn't appear,
run:

```js
await game.dnk.ensureBestiaryCompendium();
```

## GM Tools compendium

A world macro compendium called **"Dungeons & Kittens: GM Tools"** with one-click, whole-party
actions instead of adjusting each character individually:

| Macro | Effect |
| --- | --- |
| DNK: Apply Lunch Rest | +1 Heart to the party; clears everyone's half-day heal cooldown. |
| DNK: Apply Night's Rest | +1 Heart to the party; clears the half-day heal cooldown **and** every spell's recast-used flag. |
| DNK: Grant Party Furr-endship | +1 Furr-endship to the party (for a good evening with friends, or something genuinely moving). |

Each one acts on your currently controlled/selected tokens' actors, or on every Kitten actor in
the world if nothing is selected. If the compendium doesn't appear, run:

```js
await game.dnk.ensureGmToolsCompendium();
```

## Companion API (for external tools, e.g. a mobile character-sheet app)

Alongside the pregens and Player's Guide, the system auto-creates a world macro compendium called
**"Dungeons & Kittens: Companion API"**. These are thin script macros that call straight into the
same functions the character sheet's own buttons use (`game.dnk.api`), so an external tool that
can execute a Foundry macro with a `scope` object — such as a REST API/relay module — can drive
rolls and resource changes identically to using the sheet in Foundry, without reimplementing any
game rules.

Macros (each takes its arguments via the `scope` object passed to `Macro#execute(scope)`):

| Macro | `scope` fields |
| --- | --- |
| DNK API: Roll Ability Test | `actorId`, `ability`, `flavor?`, `advantage?`, `disadvantage?`, `difficulty?` |
| DNK API: Roll Combat Action | `actorId`, `presetKey` (`fangAttack`/`clawAttack`/`defend`/`help`/`hinder`/`move`/`healAlly`), `advantage?`, `disadvantage?`, `difficulty?` |
| DNK API: Roll Spell | `actorId`, `itemId`, `advantage?`, `disadvantage?` |
| DNK API: Adjust Resource | `actorId`, `resource` (`heart`/`furrendship`), `delta` (negative to damage/spend) |
| DNK API: Spend Furrendship | `messageId` (of a roll's chat card) |
| DNK API: Reroll | `messageId` (of a roll's chat card) |
| DNK API: Set Block | `messageId` (of a Defend roll's chat card) |
| DNK API: Heal Targets | `messageId` (of a Heal Ally roll's chat card) |

All of them return a plain-object result (or throw a localized `Error` on failure) rather than
depending on chat/DOM, so a relay can pass the return value straight back to the calling app. If
the compendium doesn't appear after loading a world, run:

```js
await game.dnk.ensureCompanionApiCompendium();
```
