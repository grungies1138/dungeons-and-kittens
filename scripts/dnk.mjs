import { DnkActor } from "./documents/actor.mjs";
import { DnkItem } from "./documents/item.mjs";
import { DnkKittenData } from "./data/kitten-data.mjs";
import { DnkExtraData } from "./data/extra-data.mjs";
import { DnkSpellData } from "./data/spell-data.mjs";
import { DnkGearData } from "./data/gear-data.mjs";
import { DnkActorSheet } from "./sheets/actor-sheet.mjs";
import { DnkItemSheet } from "./sheets/item-sheet.mjs";
import { activateChatListeners, rollAbilityTest } from "./dice.mjs";
import { activateCatfightChatListeners, isInClawCatfight, rollClawInjury, CLAW_STATUS } from "./catfight.mjs";
import { openRollDialog } from "./apps/roll-dialog.mjs";
import { SKILLS } from "./skills.mjs";
import * as content from "./content.mjs";
import { importPregens, ensurePregenCompendium } from "./pregens.mjs";
import { ensureGuideCompendium } from "./journals.mjs";
import { ensureCompanionApiCompendium } from "./macros.mjs";
import { ensureGmToolsCompendium } from "./gm-tools.mjs";
import { ensureTablesCompendium } from "./tables.mjs";
import { ensureBestiaryCompendium } from "./bestiary.mjs";
import { ensureSpellsCompendium } from "./spellbook.mjs";
import { ensureRulebookCompendium } from "./rulebook.mjs";
import { registerRulesLevel } from "./rules-level.mjs";
import * as group from "./group.mjs";
import * as rest from "./rest.mjs";
import * as api from "./api.mjs";
import { registerAutomation, requestTest, useItem, rollFor, postItemCard, PartyOverview } from "./automation.mjs";

const VERSION_SETTINGS = [
  "pregenDataVersion", "guideDataVersion", "companionApiMacroVersion", "gmToolsMacroVersion",
  "tablesDataVersion", "bestiaryDataVersion", "spellsDataVersion", "rulebookDataVersion"
];

Hooks.once("init", async function () {
  console.log("Dungeons & Kittens | Initializing system");

  game.dnk = {
    DnkActor, DnkItem, rollAbilityTest, openRollDialog, SKILLS, content,
    importPregens, ensurePregenCompendium, ensureGuideCompendium, ensureCompanionApiCompendium,
    ensureGmToolsCompendium, ensureTablesCompendium, ensureBestiaryCompendium, ensureSpellsCompendium,
    ensureRulebookCompendium, rest, group, api,
    requestTest, useItem, rollFor, postItemCard, partyOverview: () => PartyOverview.show()
  };

  CONFIG.Actor.documentClass = DnkActor;
  CONFIG.Item.documentClass = DnkItem;

  CONFIG.Actor.dataModels.kitten = DnkKittenData;
  CONFIG.Actor.dataModels.extra = DnkExtraData;
  CONFIG.Item.dataModels.spell = DnkSpellData;
  CONFIG.Item.dataModels.gear = DnkGearData;

  /**
   * There's no rolled initiative (p.58): the players choose who acts, and an aggressive action
   * hands the initiative to the other side. A flat 0 formula ties everyone; aggressive actions
   * drop the actor below the tie (catfight.mjs cedeInitiative), and combatStart/combatRound
   * below re-tie everyone, since Foundry's Roll All only rolls un-rolled combatants.
   */
  CONFIG.Combat.initiative = { formula: "0", decimals: 0 };

  /**
   * Condition icons. Out of the Scene follows Heart hitting 0 automatically. Advantage and
   * Disadvantage (and both injuries) pre-fill the roll dialog. The Claw Catfight marker, the
   * injuries, and incapacitation come from the Claw Catfight rules (pp.56, 60).
   */
  CONFIG.statusEffects.push(
    { id: "dnk-outofscene", name: "DNK.StatusOutOfScene", img: "icons/svg/unconscious.svg" },
    { id: "dnk-advantage", name: "DNK.StatusAdvantage", img: "icons/svg/upgrade.svg" },
    { id: "dnk-disadvantage", name: "DNK.StatusDisadvantage", img: "icons/svg/downgrade.svg" },
    { id: CLAW_STATUS, name: "DNK.StatusClaw", img: "icons/svg/blood.svg" },
    { id: "dnk-injured", name: "DNK.StatusInjured", img: "icons/svg/bones.svg" },
    { id: "dnk-injured-major", name: "DNK.StatusInjuredMajor", img: "icons/svg/skull.svg" },
    { id: "dnk-incapacitated", name: "DNK.StatusIncapacitated", img: "icons/svg/paralysis.svg" },
    { id: "dnk-no-meowgic", name: "DNK.StatusNoMeowgic", img: "icons/svg/cancel.svg" }
  );

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("dnk", DnkActorSheet, { types: ["kitten", "extra"], makeDefault: true, label: "DNK.SheetKitten" });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("dnk", DnkItemSheet, { types: ["spell", "gear"], makeDefault: true });

  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("lte", (a, b) => a <= b);
  Handlebars.registerHelper("or", (...args) => args.slice(0, -1).some(Boolean));

  registerAutomation();

  registerRulesLevel();
  for (const key of VERSION_SETTINGS) {
    game.settings.register("dungeons-and-kittens", key, { scope: "world", config: false, type: Number, default: 0 });
  }

  await loadTemplates([
    "systems/dungeons-and-kittens/templates/actor/actor-kitten-sheet.html",
    "systems/dungeons-and-kittens/templates/actor/actor-extra-sheet.html",
    "systems/dungeons-and-kittens/templates/actor/parts/actor-tabs.html",
    "systems/dungeons-and-kittens/templates/item/item-spell-sheet.html",
    "systems/dungeons-and-kittens/templates/item/item-gear-sheet.html",
    "systems/dungeons-and-kittens/templates/chat/roll-card.html",
    "systems/dungeons-and-kittens/templates/apps/roll-dialog.html",
    "systems/dungeons-and-kittens/templates/apps/image-crop.html",
    "systems/dungeons-and-kittens/templates/apps/improve-dialog.html",
    "systems/dungeons-and-kittens/templates/apps/childhood-dialog.html",
    "systems/dungeons-and-kittens/templates/apps/party-overview.html"
  ]);
});

function bindChat(html) {
  activateChatListeners(html);
  activateCatfightChatListeners(html);
  group.activateGroupChatListeners(html);
}
Hooks.on("renderChatMessageHTML", (message, html) => bindChat($(html)));
Hooks.on("renderChatMessage", (message, html) => bindChat(html));

/** Re-tie every combatant at 0 whenever combat starts or a new round begins. */
async function retieInitiative(combat) {
  if (!game.user.isGM || !combat.combatants.size) return;
  await combat.updateEmbeddedDocuments("Combatant", combat.combatants.map(c => ({ _id: c.id, initiative: 0 })));
}

Hooks.on("combatStart", combat => retieInitiative(combat));
Hooks.on("combatRound", combat => retieInitiative(combat));

/** A Claw Catfight ends with the encounter: everyone in it drops the Claw marker. */
Hooks.on("deleteCombat", async combat => {
  if (!game.user.isGM) return;
  for (const combatant of combat.combatants) {
    const actor = combatant.actor;
    if (isInClawCatfight(actor)) await actor.toggleStatusEffect(CLAW_STATUS, { active: false });
  }
});

/**
 * Heart hitting 0 takes a Kitten out of play until the end of the scene (p.53): toggle the Out
 * of the Scene status and the combatant's defeated flag to match. In a Claw Catfight, a Kitten
 * who drops to 0 also rolls on the injury table (p.60). GM-side only, since both need
 * permissions a player may not have.
 */
Hooks.on("updateActor", async (actor, changes) => {
  if (!game.user.isGM) return;
  const heart = foundry.utils.getProperty(changes, "system.resources.heart.value");
  if (heart === undefined) return;

  const isOut = heart <= 0;
  const wasOut = actor.statuses.has("dnk-outofscene");
  if (wasOut !== isOut) {
    await actor.toggleStatusEffect("dnk-outofscene", { active: isOut, overlay: true });
  }
  if (isOut && !wasOut && actor.type === "kitten" && isInClawCatfight(actor)) {
    await rollClawInjury(actor);
  }

  const combatant = game.combat?.combatants.find(c => c.actor?.id === actor.id);
  if (combatant && combatant.defeated !== isOut) {
    try {
      await combatant.update({ defeated: isOut });
    } catch (_err) { /* no permission to update the Combat */ }
  }
});

/** Optional Dice So Nice colorset matching the parchment theme (selectable, never forced). */
Hooks.once("diceSoNiceReady", dice3d => {
  dice3d.addColorset({
    name: "dnkPaws",
    description: "Dungeons & Kittens",
    category: "Colors",
    foreground: "#5c3a22",
    background: "#f8f0da",
    outline: "#5c3a22",
    texture: "paper",
    material: "wood"
  });
});

Hooks.once("ready", async function () {
  await ensurePregenCompendium();
  await ensureGuideCompendium();
  await ensureCompanionApiCompendium();
  await ensureGmToolsCompendium();
  await ensureTablesCompendium();
  await ensureBestiaryCompendium();
  await ensureSpellsCompendium();
  await ensureRulebookCompendium();
});
