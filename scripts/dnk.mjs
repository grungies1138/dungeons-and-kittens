import { DnkActor } from "./documents/actor.mjs";
import { DnkItem } from "./documents/item.mjs";
import { DnkKittenData } from "./data/kitten-data.mjs";
import { DnkExtraData } from "./data/extra-data.mjs";
import { DnkSpellData } from "./data/spell-data.mjs";
import { DnkGearData } from "./data/gear-data.mjs";
import { DnkActorSheet } from "./sheets/actor-sheet.mjs";
import { DnkItemSheet } from "./sheets/item-sheet.mjs";
import { activateChatListeners, rollAbilityTest } from "./dice.mjs";
import { openRollDialog } from "./apps/roll-dialog.mjs";
import { SKILLS } from "./skills.mjs";
import { importPregens, ensurePregenCompendium } from "./pregens.mjs";
import { ensureGuideCompendium } from "./journals.mjs";
import { ensureCompanionApiCompendium } from "./macros.mjs";
import * as api from "./api.mjs";

Hooks.once("init", async function () {
  console.log("Dungeons & Kittens | Initializing system");

  game.dnk = {
    DnkActor, DnkItem, rollAbilityTest, openRollDialog, SKILLS,
    importPregens, ensurePregenCompendium, ensureGuideCompendium, ensureCompanionApiCompendium,
    api
  };

  CONFIG.Actor.documentClass = DnkActor;
  CONFIG.Item.documentClass = DnkItem;

  CONFIG.Actor.dataModels.kitten = DnkKittenData;
  CONFIG.Actor.dataModels.extra = DnkExtraData;
  CONFIG.Item.dataModels.spell = DnkSpellData;
  CONFIG.Item.dataModels.gear = DnkGearData;

  /**
   * The Quick Reference has no dice-rolled initiative: "Kittens have the initiative as long as
   * they do not make an aggressive action." A flat 0 formula ties everyone (used when a
   * combatant is added mid-encounter and rolled individually); the Catfight tab's Fang/Claw
   * Attack and Hinder buttons then drop that actor below the tie (see cedeInitiative in
   * sheets/actor-sheet.mjs). combatStart/combatRound below re-tie everyone at the start of
   * combat and of every round, since Foundry's own Roll All only rolls un-rolled combatants
   * and won't lift someone back up once they've dropped below the tie.
   */
  CONFIG.Combat.initiative = { formula: "0", decimals: 0 };

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("dnk", DnkActorSheet, { types: ["kitten", "extra"], makeDefault: true, label: "DNK.SheetKitten" });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("dnk", DnkItemSheet, { types: ["spell", "gear"], makeDefault: true });

  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("lte", (a, b) => a <= b);

  game.settings.register("dungeons-and-kittens", "pregenDataVersion", {
    scope: "world", config: false, type: Number, default: 0
  });
  game.settings.register("dungeons-and-kittens", "guideDataVersion", {
    scope: "world", config: false, type: Number, default: 0
  });
  game.settings.register("dungeons-and-kittens", "companionApiMacroVersion", {
    scope: "world", config: false, type: Number, default: 0
  });

  await loadTemplates([
    "systems/dungeons-and-kittens/templates/actor/actor-kitten-sheet.html",
    "systems/dungeons-and-kittens/templates/actor/actor-extra-sheet.html",
    "systems/dungeons-and-kittens/templates/item/item-spell-sheet.html",
    "systems/dungeons-and-kittens/templates/item/item-gear-sheet.html",
    "systems/dungeons-and-kittens/templates/chat/roll-card.html",
    "systems/dungeons-and-kittens/templates/apps/roll-dialog.html",
    "systems/dungeons-and-kittens/templates/apps/image-crop.html"
  ]);
});

Hooks.on("renderChatMessageHTML", (message, html) => activateChatListeners($(html)));
Hooks.on("renderChatMessage", (message, html) => activateChatListeners(html));

/** Re-tie every combatant at 0 whenever combat starts or a new round begins - see the note on CONFIG.Combat.initiative above. */
async function retieInitiative(combat) {
  if (!game.user.isGM || !combat.combatants.size) return;
  const updates = combat.combatants.map(c => ({ _id: c.id, initiative: 0 }));
  await combat.updateEmbeddedDocuments("Combatant", updates);
}

Hooks.on("combatStart", combat => retieInitiative(combat));
Hooks.on("combatRound", combat => retieInitiative(combat));

Hooks.once("ready", async function () {
  await ensurePregenCompendium();
  await ensureGuideCompendium();
  await ensureCompanionApiCompendium();
});
