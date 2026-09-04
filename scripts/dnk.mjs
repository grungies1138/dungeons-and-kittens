import { DnkActor } from "./documents/actor.mjs";
import { DnkItem } from "./documents/item.mjs";
import { DnkActorSheet } from "./sheets/actor-sheet.mjs";
import { DnkItemSheet } from "./sheets/item-sheet.mjs";
import { activateChatListeners, rollAbilityTest } from "./dice.mjs";
import { openRollDialog } from "./apps/roll-dialog.mjs";
import { SKILLS } from "./skills.mjs";
import { importPregens, ensurePregenCompendium } from "./pregens.mjs";
import { ensureGuideCompendium } from "./journals.mjs";

Hooks.once("init", async function () {
  console.log("Dungeons & Kittens | Initializing system");

  game.dnk = {
    DnkActor, DnkItem, rollAbilityTest, openRollDialog, SKILLS,
    importPregens, ensurePregenCompendium, ensureGuideCompendium
  };

  CONFIG.Actor.documentClass = DnkActor;
  CONFIG.Item.documentClass = DnkItem;

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

  await loadTemplates([
    "systems/dungeons-and-kittens/templates/actor/actor-kitten-sheet.html",
    "systems/dungeons-and-kittens/templates/actor/actor-extra-sheet.html",
    "systems/dungeons-and-kittens/templates/item/item-spell-sheet.html",
    "systems/dungeons-and-kittens/templates/item/item-gear-sheet.html",
    "systems/dungeons-and-kittens/templates/chat/roll-card.html",
    "systems/dungeons-and-kittens/templates/apps/roll-dialog.html"
  ]);
});

Hooks.on("renderChatMessageHTML", (message, html) => activateChatListeners($(html)));
Hooks.on("renderChatMessage", (message, html) => activateChatListeners(html));

Hooks.once("ready", async function () {
  await ensurePregenCompendium();
  await ensureGuideCompendium();
});
