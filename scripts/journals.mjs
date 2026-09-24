/**
 * In-system guide journals: a step-by-step character creation tutorial, a mechanics/sheet hint
 * reference, and a full skill reference. Written in original wording based on the publicly
 * available Game Mechanics Quick Reference and Quickstart Adventure PDFs - no text is copied
 * from the books.
 */

import { SKILLS } from "./skills.mjs";

/** Bump this whenever the guide content changes so existing worlds get the refreshed pages. */
export const GUIDE_DATA_VERSION = 6;

function page(name, html, sort) {
  return {
    name,
    type: "text",
    title: { show: true, level: 2 },
    text: { format: 1, content: html },
    sort
  };
}

const CREATION_GUIDE = {
  name: "How to Create a Kitten",
  folder: null,
  pages: [
    page("1. Before You Start", `
      <p>Dungeons &amp; Kittens is played by a small group of exiled Kittens trying to find their
      way home. Nobody at the table is trying to "win" - you're all telling one story together,
      and your Kitten <strong>cannot die</strong>. Character creation is meant to be quick: you
      can build one in about ten minutes, or grab one of the five ready-to-play Kittens from the
      <em>Pregenerated Kittens</em> compendium if you'd rather jump straight into play.</p>
      <p>To make a new one, create an Actor of type <strong>Kitten</strong> and work through the
      steps below - each one lines up with a section of the sheet.</p>
    `, 100000),

    page("2. Name & Childhood", `
      <p>Give your Kitten a name, then pick a <strong>Childhood</strong> - a one- or two-word
      idea of where they came from and what shaped them before the exile. It goes in the
      Childhood field at the top of the sheet and mostly matters for roleplaying and for the
      Storyteller to hang details on.</p>
      <p>A few examples drawn from the official ready-to-play Kittens: <em>Country Kitten</em>,
      <em>Young Noble</em>, <em>Meowge</em> (a young student of meowgic), <em>Soldier's Child</em>,
      and <em>Catnut</em> (raised wild in the woods). The Core Rulebook has a much longer list to
      pick from if you want more options - ask your Storyteller, or open the <em>Character
      Tables</em> compendium and roll on "Childhood Idea" for a quick spark of inspiration
      (original homebrew ideas, not an official list).</p>
    `, 200000),

    page("3. Abilities: Strong, Smart, Cute", `
      <p>Every Kitten has three abilities, each rated on a d6 scale: <strong>Strong</strong>
      (muscle and grit), <strong>Smart</strong> (wits and knowledge), and <strong>Cute</strong>
      (charm and heart). When you test one, you roll 3d6 and count how many dice land at or
      below that ability's score - each one is a success.</p>
      <p><strong>Quick way to assign scores:</strong> every one of the five official
      ready-to-play Kittens splits their three abilities as <strong>5 / 2 / 1</strong> - a high
      score in the thing they're best at, a modest secondary, and a weak spot. That's a fast,
      table-tested starting point: decide what your Kitten leans on most (put the 5 there), what
      they're passable at (the 2), and what trips them up (the 1). If your table is using a
      different point-buy or rolling method from the Core Rulebook, follow that instead - this is
      just a reliable default if you want to start playing immediately.</p>
      <p>Enter the three values in the Abilities row on the sheet; the dice buttons next to each
      one roll a test for you.</p>
    `, 300000),

    page("4. Heart & Furr-endship", `
      <p>These two resources are calculated for you - you don't need to choose them:</p>
      <ul>
        <li><strong>Heart</strong> (health and confidence) automatically maxes out at
        Strong + Smart.</li>
        <li><strong>Furr-endship</strong> (morale, spent to help yourself or a friend)
        automatically maxes out at your Cute score.</li>
      </ul>
      <p>The sheet keeps both maximums in sync as you change your abilities, so just fill in
      Strong/Smart/Cute first and these fall into place.</p>
    `, 400000),

    page("5. Pick Two Skills", `
      <p>The Skills tab lists 25 areas of know-how, from <em>Hide in Shadows</em> to
      <em>Tinker with Bits &amp; Bobs</em>. Every one of the official ready-to-play Kittens starts
      trained in exactly <strong>two</strong> skills that fit their concept - for example a
      country Kitten trained in <em>Find Your Way</em> and <em>Hunter-Gatherer</em>, or a noble
      trained in <em>Move Silently</em> and <em>Seduce &amp; Charm</em>.</p>
      <p>Pick two that fit your Kitten's Childhood and personality, and check their boxes.
      A trained skill gives you an Advantage (roll 4d6 instead of 3d6) whenever your Storyteller
      agrees it applies to what you're attempting.</p>
    `, 500000),

    page("6. Character Trait & Cattribute", `
      <p>Two more things make your Kitten unique:</p>
      <ul>
        <li>A short <strong>Character Trait</strong> - one word or a short phrase describing a
        strong part of your Kitten's personality (Brave, Grouchy, Stubborn, Shy, Funny...). When
        you lean into it helpfully, you get an Advantage; when you play it against yourself in a
        way that complicates the scene, you give a Furr-endship point to a comrade (once per
        session).</li>
        <li>A unique <strong>Cattribute</strong> - a special narrative feature nobody else has.
        The five official Kittens use: a ghostly <em>Mystic Mentor</em>, a loyal
        <em>Animal Companion</em>, a mysterious <em>Inheritance</em>, a famous <em>Heroic
        Lineage</em>, and the gift of <em>Disguise</em>. Write your own, or reuse one of these
        (or roll on the <em>Character Tables</em> compendium's "Cattribute Idea" table for more
        homebrew sparks) as inspiration, and describe it in the Story tab.</li>
      </ul>
    `, 600000),

    page("7. Spellbook (Two Starting Entries)", `
      <p>"Spellbook" isn't only for wizardly Kittens - it's the place for any special ability
      your Kitten has picked up, meowgical or not. Each of the official Kittens starts with
      exactly <strong>two</strong> spellbook entries, each one tied to an ability and a number of
      successes needed to pull it off (1 is easy, up to 4 for something legendary).</p>
      <p>Some real examples: <em>Slipper Patrol</em> (Strong, 1 success) lets the group travel all
      day without sore paws; <em>Quick as a Flash</em> (Smart, 2 successes) lets you run circles
      around trouble; <em>Care</em> (Cute, 3 successes) turns a single Furr-endship point into
      healing for the whole group at once. Add two entries in the Spellbook tab that fit your
      Kitten's Childhood and Cattribute, name them, and write a line or two describing what
      happens on a success.</p>
    `, 700000),

    page("8. Backpack", `
      <p>Every Kitten leaves home with the same small bundle of everyday supplies: a wooly
      blanket, a penknife, a wooden spoon, a small cooking pot, a large leather flask, a
      tinderbox, candle stubs, a bar of soap, a fur brush, and a bag of kittysnacks. That's
      already included as a "Common Supplies" entry when you use a pregenerated Kitten as a
      template - otherwise just add it yourself in the Backpack tab.</p>
      <p>Then add three to five personal items that say something about your Kitten - a
      keepsake, a tool, something a little strange. If an item would be especially useful in a
      pinch, mark it <strong>Purr-ecious</strong>: once per relevant test it can reroll one die
      that didn't go your way.</p>
    `, 800000),

    page("9. You're Ready!", `
      <p>Fill in a few lines in the Story tab about who your Kitten is and how they know the
      others, and you're done. If you'd rather skip all of this, open the <em>Pregenerated
      Kittens</em> compendium and drag one straight onto the scene - each one is fully built with
      abilities, skills, spells, and gear already filled in.</p>
      <p>See the companion journal <strong>"Playing the Game: Mechanics &amp; Sheet Hints"</strong>
      for how to actually use the sheet once play begins.</p>
    `, 900000)
  ]
};

const MECHANICS_GUIDE = {
  name: "Playing the Game: Mechanics & Sheet Hints",
  folder: null,
  pages: [
    page("1. The Core Roll", `
      <p>Whenever an action might fail and matters to the story, roll an ability test: 3d6,
      counting every die that lands at or below the ability's score as a success. More successes
      mean a better outcome. Click the small die icon next to Strong, Smart, or Cute on the sheet
      to open the roll dialog and do this automatically.</p>
      <p><strong>Triples:</strong> if three (or more) of the dice you rolled show the same number,
      something extra happens for your Kitten - a little bonus, or a softer failure - regardless
      of whether the test itself succeeded. The chat card flags this for you automatically.</p>
    `, 100000),

    page("2. Advantage, Disadvantage & Difficulty", `
      <p>The roll dialog that opens when you click an ability lets you set:</p>
      <ul>
        <li><strong>Advantage</strong> sources (a trained skill, a clever plan, good
        circumstances) - roll 4d6 instead of 3d6.</li>
        <li><strong>Disadvantage</strong> sources (bad footing, an angry crowd, exhaustion) - roll
        2d6 instead of 3d6.</li>
        <li><strong>Difficulty</strong> - how many successes the Storyteller has decided the task
        needs: Easy (1), Medium (2), Difficult (3), or Legendary (4). Leave it on "None" for a
        test where you're just comparing successes narratively.</li>
      </ul>
      <p>Stacking multiple advantages doesn't roll more than 4 dice, and multiple disadvantages
      never drop below 2 - and if you have both, they cancel each other out down to a plain 3d6.
      The dialog does this math for you; just enter how many of each apply.</p>
    `, 200000),

    page("3. Heart & Furr-endship in Play", `
      <p>Both resources live in the header of the sheet with +/- buttons for quick adjustments
      in play.</p>
      <p><strong>Heart</strong> drops when your Kitten is hurt, scared, or worn down, and comes
      back with rest, a meal, or a friend's care. At 0, your Kitten sits out the rest of the
      scene rather than being hurt further - they're never in danger of dying (the system marks
      them "Out of the Scene" automatically). Click the moon icon (<strong>"Night's Rest"</strong>)
      in your sheet's title bar at the end of a session or scene for +1 Heart and to reset your
      spell recasts and healing cooldown for the next day.</p>
      <p><strong>Furr-endship</strong> doesn't refill automatically - your Kitten earns it back
      through a good night's rest somewhere safe, a warm evening with friends, or something
      genuinely moving. Spend it in the moment: every roll's chat card has a
      <em>"Spend 1 Furr-endship"</em> button that turns one point into an automatic success (up
      to four successes this way per test), which is often the difference between failing and
      pulling something off. It also costs 1 Furr-endship just to start a Claw Attack in the
      Catfight tab - the sheet checks this for you and won't let the attempt through without it.</p>
    `, 300000),

    page("4. Skills & Calling for Advantage", `
      <p>Skills aren't rolled on their own - they simply grant Advantage on an ability test when
      the Storyteller agrees they're relevant. If your Kitten is trained in <em>Hide in
      Shadows</em> and tries to sneak past a guard, ask for the Advantage before rolling Strong or
      Smart, then add it in the roll dialog.</p>
    `, 400000),

    page("5. Spellbook in Play", `
      <p>Each entry in the Spellbook tab already knows its own ability and success threshold -
      just click the die icon on that row to roll it as a difficulty-gated test automatically.
      The <strong>first cast of each spell "today" is free</strong>; casting the same one again
      before your next night's rest automatically charges its recast cost in Heart (shown on the
      item) - the sheet handles this for you, including refusing the recast if you don't have
      enough Heart to pay it. A little moon icon next to a spell's name means it's already been
      cast today. A GM's "DNK: Apply Night's Rest" macro (see the <em>GM Tools</em> compendium)
      clears every character's recast flags at once.</p>
    `, 500000),

    page("6. Backpack & Purr-ecious Items", `
      <p>Ordinary backpack items are mostly for flavor and roleplaying leverage - a good excuse
      the Storyteller can reward. A <strong>Purr-ecious</strong> item is mechanically useful: after
      any roll where it would help, the chat card's <em>"Use item (reroll a failing die)"</em>
      button lets you reroll one die you didn't like - it only appears if your Kitten actually
      owns a Purr-ecious item, and only once per roll where a failing die exists.</p>
    `, 600000),

    page("7. Catfights", `
      <p>Combat in Dungeons &amp; Kittens is quick and rarely fatal. The Kitten sheet's Catfight
      tab has one-click presets:</p>
      <ul>
        <li><strong>Fang Attack</strong> and <strong>Claw Attack</strong> - offensive actions;
        successes translate into Heart damage. Claw Attack costs 1 Furr-endship to start (the
        sheet won't let you attempt one without enough).</li>
        <li><strong>Defend</strong> - each success cancels one success from an incoming attack.
        Click <em>"Set as Block"</em> on the chat card to lock in that many successes; the next
        <em>"Apply Heart damage"</em> click against you automatically subtracts your Block first,
        then spends it.</li>
        <li><strong>Help</strong> - grants an ally Advantage on their next action.</li>
        <li><strong>Hinder</strong> - saddles an opponent with Disadvantage.</li>
        <li><strong>Move</strong> - repositioning, sometimes with a Strong or Smart test if it's
        risky.</li>
        <li><strong>Heal Ally</strong> - a Smart test; on a success, target the ally and click
        <em>"Heal target(s)"</em> to give them 1 Heart. Capped at once per half-day per recipient -
        the sheet tracks this and warns you if someone's already been healed that way. A GM's
        "DNK: Apply Lunch Rest" / "Apply Night's Rest" macros (<em>GM Tools</em> compendium) clear
        that cooldown for the whole party at once, along with the party's own Heart regain.</li>
      </ul>
      <p>Kittens keep the initiative as long as they aren't the ones attacking. After an attack
      roll, target the enemy token and use the <em>"Apply Heart damage to target(s)"</em> button
      on the chat card - it subtracts the successes rolled straight from the target's Heart (minus
      any Block they've set). If that drops a token's Heart to 0, the system automatically marks
      them "Out of the Scene" (and defeated on the combat tracker, if one's running) - never a
      manual step.</p>
    `, 700000),

    page("8. Quick Reference", `
      <ul>
        <li>Roll 3d6 (or 4d6 with Advantage / 2d6 with Disadvantage); each die at or under the
        ability score is a success.</li>
        <li>Difficulty: Easy 1, Medium 2, Difficult 3, Legendary 4 successes.</li>
        <li>Three-of-a-kind on the dice = a bonus effect, win or lose.</li>
        <li>Heart max = Strong + Smart. Furr-endship max = Cute.</li>
        <li>Spend 1 Furr-endship for +1 automatic success (max 4 per test), to hand a Heart
        point to a friend, or (required) to start a Claw Attack.</li>
        <li>A trained skill grants Advantage when it applies. Toggling the Advantage/Disadvantage
        icon on a token's status effects pre-fills the roll dialog's count.</li>
        <li>A Purr-ecious item can reroll one failing die.</li>
        <li>Attacks deal Heart damage equal to successes (minus a defender's Block); Kittens are
        never at risk of dying - Heart hitting 0 auto-marks them Out of the Scene.</li>
        <li>A spell's first cast each day is free; recasting before a night's rest auto-charges
        its Heart cost.</li>
        <li>Click the moon icon in your own sheet's title bar for a self-service Night's Rest
        (+1 Heart, resets recasts/healing cooldown). GM Tools compendium: one-click Lunch Rest,
        Night's Rest, and Grant Party Furr-endship macros for the whole party at once.</li>
      </ul>
    `, 800000)
  ]
};

/**
 * Build the "Skill Reference" journal entry. Deferred to a function (rather than a static
 * const) because it reads skill names/descriptions through game.i18n, which isn't ready at
 * module-evaluation time - this is only called from ensureGuideCompendium(), during the
 * "ready" hook.
 */
function buildSkillReferenceGuide() {
  const intro = `
    <p>Skills aren't rolled on their own - each one simply grants Advantage on an ability test
    when your Storyteller agrees it's relevant to what you're attempting. Here's what each of
    the 25 skills covers:</p>
  `;
  const entries = SKILLS.map(key => {
    const label = game.i18n.localize(`DNK.Skill.${key}`);
    const description = game.i18n.localize(`DNK.SkillDescription.${key}`);
    return `<h3>${label}</h3><p>${description}</p>`;
  }).join("\n");

  return {
    name: "Skill Reference",
    folder: null,
    pages: [page("All 25 Skills", intro + entries, 100000)]
  };
}

function buildGuideJournals() {
  return [CREATION_GUIDE, MECHANICS_GUIDE, buildSkillReferenceGuide()];
}

const GUIDE_PACK_NAME = "dnk-guide";
const VERSION_SETTING = "guideDataVersion";

/**
 * Make sure the "Player's Guide" compendium of journal entries exists for this world, is
 * populated, and matches the current GUIDE_DATA_VERSION - refreshing its contents whenever the
 * bundled guide text changes.
 */
export async function ensureGuideCompendium() {
  if (!game.user.isGM) return;

  let pack = game.packs.get(`world.${GUIDE_PACK_NAME}`);
  if (!pack) {
    pack = await CompendiumCollection.createCompendium({
      type: "JournalEntry",
      name: GUIDE_PACK_NAME,
      label: "Dungeons & Kittens: Player's Guide"
    });
  }

  const storedVersion = game.settings.get("dungeons-and-kittens", VERSION_SETTING);
  if (storedVersion >= GUIDE_DATA_VERSION) return;

  const index = await pack.getIndex();
  if (index.size > 0) {
    await JournalEntry.deleteDocuments(Array.from(index.keys()), { pack: pack.collection });
  }

  await JournalEntry.createDocuments(buildGuideJournals(), { pack: pack.collection });
  await game.settings.set("dungeons-and-kittens", VERSION_SETTING, GUIDE_DATA_VERSION);
  ui.notifications.info("Dungeons & Kittens: refreshed the Player's Guide compendium.");
}
