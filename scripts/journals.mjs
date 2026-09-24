/**
 * In-system guide journals: character creation, the rules and how the sheet automates them,
 * Catfights, and a skill reference. Written in this project's own words with page references to
 * the Dungeons & Kittens Core Rulebook - no rulebook text is copied.
 */

import { SKILLS } from "./skills.mjs";
import { CHILDHOODS, CHILDHOOD_CATEGORIES, SPELLS, SPELL_PATHS, MEOWGIC_ACCIDENTS, CLAW_INJURIES } from "./content.mjs";
import { ensureWorldPack } from "./packs.mjs";

/** Bump this whenever the guide content changes so existing worlds get the refreshed pages. */
export const GUIDE_DATA_VERSION = 8;

function page(name, html, sort) {
  return { name, type: "text", title: { show: true, level: 2 }, text: { format: 1, content: html }, sort };
}

function pages(entries) {
  return entries.map(([name, html], i) => page(name, html, (i + 1) * 100000));
}

function childhoodList() {
  return Object.entries(CHILDHOOD_CATEGORIES).map(([key, label]) => `
    <h3>${label}</h3>
    <ul>${CHILDHOODS.filter(c => c.category === key).map(c =>
      `<li><strong>${c.name}</strong> - ${c.cattribute}. ${c.cattributeText}</li>`).join("")}</ul>`).join("");
}

function spellList() {
  return Object.entries(SPELL_PATHS).map(([key, path]) => `
    <h3>${path.label} (${game.i18n.localize(`DNK.Ability${path.ability.charAt(0).toUpperCase()}${path.ability.slice(1)}`)})</h3>
    <ul>${SPELLS.filter(s => s.path === key).map(s => `<li><strong>${s.name}</strong> (${s.level}) - ${s.description}</li>`).join("")}</ul>`).join("");
}

function creationGuide() {
  return {
    name: "How to Create a Kitten",
    pages: pages([
      ["1. Before You Start", `
        <p>You play a young exile trying to make a life on the road. Nobody wins or loses, and a
        Kitten can't die except in the rarest circumstances. Building one takes about ten
        minutes - or grab a ready-made Kitten from the <em>Pregenerated Kittens</em> compendium.</p>
        <p>Talk with your Storyteller about the group first: Kittens of the Kingdom are the simplest
        choice, and the book suggests at most one Odd One Out and one Other Animal per group (p.14).</p>`],
      ["2. Name & Childhood", `
        <p>Pick a name (the dice icon beside the name rolls one from the book's list), then a
        <strong>Childhood</strong>. Click the book icon beside the Childhood field to choose one of the
        18 - it fills in the Cattribute and adds the five Purr-ecious items that childhood starts
        with. The <em>Tables</em> compendium can roll one with the book's odds.</p>
        ${childhoodList()}`],
      ["3. Abilities", `
        <p>Split <strong>8 points</strong> across Strong, Smart, and Cute, each between 1 and 5
        (p.14). The sheet shows your running total next to the character-trait buttons and turns
        green when it adds up.</p>
        <ul><li><strong>Strong</strong> - bold, physical, brave.</li>
        <li><strong>Smart</strong> - resourceful, knowledgeable, level-headed.</li>
        <li><strong>Cute</strong> - charming, diplomatic, persuasive.</li></ul>`],
      ["4. Heart & Furr-endship", `
        <p>These fill themselves in: <strong>Heart</strong> maximum is Strong + Smart, and
        <strong>Furr-endship</strong> maximum is Cute.</p>`],
      ["5. Two Skills", `
        <p>Tick two skills your Kitten picked up growing up. A skill has no score - when it helps
        with an action, you roll with an Advantage.</p>`],
      ["6. Two Spells", `
        <p>Every Kitten knows two spells from any path and any level (a Meowge's spellbook adds two
        more). Drag them from the <em>Spells</em> compendium onto the sheet. The full list:</p>
        ${spellList()}`],
      ["7. Backpack", `
        <p>Everyone carries the same everyday supplies - blanket, pen-knife, spoon, cooking pot,
        flask, tinderbox, candle stubs, soap, brush, kittysnacks - plus <strong>five Purr-ecious
        items</strong> from their childhood. Five is the limit (a Bearcub carries seven, and
        experience can buy more slots); the Backpack tab counts them for you. Purr-ecious items can
        be sold for about half a gold coin, bought for about one, swapped, lent, or left behind.</p>`],
      ["8. Character Trait", `
        <p>Pick a trait or roll one (the dice icon by the field uses the book's table). Once per
        session each: play it helpfully for an Advantage ("Trait helps"), or let it cause trouble so
        a targeted comrade recovers 1 Furr-endship ("Trait hinders").</p>`]
    ])
  };
}

function rulesGuide() {
  const accidents = MEOWGIC_ACCIDENTS.map(a => `<li><strong>${a.roll}</strong> - ${a.text}</li>`).join("");
  const injuries = CLAW_INJURIES.map(i => `<li><strong>${i.roll}. ${i.name}</strong> - ${i.text}</li>`).join("");
  return {
    name: "Playing the Game: Rules & Sheet Hints",
    pages: pages([
      ["1. Rolling", `
        <p>Roll 3d6 against the ability the Storyteller names; every die at or under the score is a
        success (p.16). An <strong>Advantage</strong> rolls 4d6, a <strong>Disadvantage</strong> 2d6 -
        never more or fewer, and they cancel out one for one (p.46). Advantage/Disadvantage token
        icons, and injuries, pre-fill the roll dialog.</p>
        <p><strong>Triples:</strong> three of the same number always brings a little bonus, win or lose (p.52).</p>`],
      ["2. Difficulty & Results", `
        <p>Easy 1, Medium 2, Difficult 3, Legendary 4 successes (p.48). The chat card reads the result
        the book's way (p.49):</p>
        <ul><li><strong>Success</strong> - at least the difficulty: it works as intended.</li>
        <li><strong>Short of the difficulty</strong> - at least one success: the player chooses to fail
        without further trouble, or succeed anyway with a complication.</li>
        <li><strong>Failure</strong> - no successes at all.</li></ul>
        <p>Leave difficulty on None for an <strong>open action</strong> - the Storyteller judges the
        successes. <strong>Opposed actions</strong>: both sides roll, most successes wins.
        <strong>Long tasks</strong>: add successes over repeated rolls toward a target of 4-20.
        <strong>Group actions</strong>: everyone rolls; if most succeed, all succeed (pp.50-52). The GM Tools
        compendium has a macro for each.</p>
        <p>New to the game? The <em>Rules in play</em> world setting follows the book's Appendix: start with
        just abilities and Heart, then add triples, re-rolls, difficulty, advantages, and Furr-endship.</p>`],
      ["3. Re-rolls & Furr-endship", `
        <p>A re-roll replaces one die you didn't like (p.47). Click a die on the chat card to choose it,
        then use a re-roll button. Sources stack: one per relevant Purr-ecious item, one from the
        Cattribute (an Extra's description), and the GM can grant more for a clever idea.</p>
        <p>Spend 1 Furr-endship on a card for an automatic success (p.54). Counting the successful dice, spending
        can't take a test past 4 successes. You can spend on your own roll or a companion's: the button charges
        your own assigned character when you click it on someone else's card.</p>`],
      ["4. Heart", `
        <p>At 0 Heart a character is out of play until the end of the scene or until rested or cared
        for - the sheet marks this automatically (p.53). Heart comes back 1 at lunch, 1 after a night's
        sleep, 1 from a comrade's successful Smart test (once per half-day - the Heal Ally action), or
        1 for 1 Furr-endship with a hug (the "Pamper a friend" button, not during a Catfight).</p>`],
      ["5. Furr-endship", `
        <p>It never refills by resting. Recover 1 from a quiet night somewhere safe, a pleasant evening
        with friends, a moving show, or a comrade's character trait causing trouble (p.54). The GM's
        "Grant Party Furr-endship" macro handles the first three.</p>`],
      ["6. Meowgic", `
        <p>Roll the spell's ability; you need successes equal to its level (p.38). Succeed or fail, the
        spell is spent until a good night's rest - recasting sooner costs 1 Heart, which the sheet
        charges (a moon icon marks spells already cast). If a cast fails you can accept it, or click
        "Force it anyway" to roll a Meowgic accident:</p><ul>${accidents}</ul>
        <p>First Aid, Care, Heart Charm, and Long Night get a chat-card button that applies their effect once
        the spell works.</p>`],
      ["7. Experience", `
        <p>+1 at the end of every session, +1 more for finishing an adventure or reaching a goal (the GM
        Tools macros award these). Spend it with the sheet's Improve button (p.42):</p>
        <ul><li>Raise an ability: 2 x the new level, one step at a time (2 to 3 costs 6). Heart and
        Furr-endship maximums follow.</li>
        <li>New skill: 2. New spell: 2. Extra Purr-ecious slot: 4.</li></ul>`],
      ["8. Catfights", `
        <p><strong>Fang Catfights</strong> are hissing, posturing, and insults - nobody is really hurt,
        and you can concede at any time. <strong>Claw Catfights</strong> are fights to hurt or kill:
        entering one costs 1 Furr-endship at once, and with none left the Kitten must run (p.56). The
        Claw Attack button enters for you, and ending the combat clears it.</p>
        <p><strong>Initiative</strong> (p.58): the players choose who acts. After an aggressive action
        (Attack, Hinder) the initiative passes to the other side; after a non-aggressive one (Defend,
        Help, Move, Interact) another player can act.</p>
        <ul><li><strong>Attack</strong> - Fang: Strong or Cute with almost any skill. Claw: Strong or
        Smart with Scratch only; Purr-ecious weapons give re-rolls. Each success removes 1 Heart.</li>
        <li><strong>Defend</strong> - Strong or Smart. "Set as Defend" on the card: its successes cancel
        attack successes against you or your comrades for the rest of the turn.</li>
        <li><strong>Help</strong> - no roll: the targeted comrade gets an Advantage.</li>
        <li><strong>Hinder</strong> - at least 1 success gives the target a Disadvantage.</li>
        <li><strong>Move</strong> and <strong>Interact</strong> - stunts, hiding, talking, lock-picking,
        tending a friend.</li>
        <li><strong>Getting out</strong> - concede a Fang Catfight freely; flee a Claw Catfight with Smart
        (Shake Your Booty) or surrender with Cute (Seduce &amp; Charm) (p.59).</li></ul>
        <p>A Kitten dropping to 0 Heart in a Claw Catfight rolls for an injury automatically (p.60):</p>
        <ul>${injuries}</ul>
        <p>Minor injuries heal at the next rest; incapacitation counts down one day per night's rest;
        major injuries and lost meowgic heal when the GM marks the adventure complete.</p>`],
      ["9. Quick Reference", `
        <ul>
          <li>3d6, each die at or under the ability is a success; Advantage 4d6, Disadvantage 2d6.</li>
          <li>Difficulty 1/2/3/4. Short but not zero: fail cleanly or succeed with a complication.</li>
          <li>Triple = a little bonus. Re-rolls from items, Cattribute, and good ideas.</li>
          <li>Heart max Strong + Smart; Furr-endship max Cute.</li>
          <li>Furr-endship: +1 success (max 4/test), or +1 Heart to a friend outside Catfights.</li>
          <li>Spells: once a day free, recast for 1 Heart; force a failure with a Meowgic accident.</li>
          <li>Claw Catfight: -1 Furr-endship to enter; 0 Heart means an injury roll.</li>
          <li>XP: ability 2 x new level, skill 2, spell 2, Purr-ecious slot 4.</li>
        </ul>`]
    ])
  };
}

/** Deferred because skill names/descriptions come through game.i18n, ready only by the "ready" hook. */
function skillReference() {
  const intro = `<p>Skills aren't rolled on their own - a relevant one gives an Advantage on the ability
    test the Storyteller asks for.</p>`;
  const entries = SKILLS.map(key =>
    `<h3>${game.i18n.localize(`DNK.Skill.${key}`)}</h3><p>${game.i18n.localize(`DNK.SkillDescription.${key}`)}</p>`).join("\n");
  return { name: "Skill Reference", pages: [page("All Skills", intro + entries, 100000)] };
}

export function ensureGuideCompendium() {
  return ensureWorldPack({
    name: "dnk-guide",
    label: "Dungeons & Kittens: Player's Guide",
    type: "JournalEntry",
    version: GUIDE_DATA_VERSION,
    setting: "guideDataVersion",
    build: () => [creationGuide(), rulesGuide(), skillReference()]
  });
}
