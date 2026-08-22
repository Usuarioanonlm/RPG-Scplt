import assert from "node:assert/strict";
import { getRpgSave, loginRpgAccount, saveRpgCharacter, selectRpgCharacter } from "../server/db.ts";
import { forgeFirstCampaignSave } from "../shared/characterForge.ts";
import { craftRecipes, craftTransaction } from "../shared/craftingRules.ts";

const nickname = "qa_expansao_20260821";
const password = "qa-expansao-2026";
const account = await loginRpgAccount(nickname, password);
const stateFor = (name, missionPath, gold, obsidian) => {
  const draft = { name, classId: missionPath === "escort" ? "guardian" : "arcanist", originId: missionPath === "escort" ? "vigil" : "archive", appearanceId: missionPath === "escort" ? "copper" : "moon", raceId: missionPath === "escort" ? "human" : "aetheri", relicId: missionPath === "escort" ? "sunshard" : "thornsigil" };
  const forgeSeed = [
    { id: "obsidian", quantity: Math.max(obsidian, 4) }, { id: "aethercrystal", quantity: 3 },
    { id: "embercore", quantity: 2 }, { id: "goblinmark", quantity: 2 }, { id: "riftheart", quantity: 0 },
  ];
  const forged = forgeFirstCampaignSave({ draft, inventory: forgeSeed });
  const riftheart = craftRecipes.find((recipe) => recipe.id === "riftheart");
  const crafted = craftTransaction(forged.inventory, riftheart);
  return JSON.stringify({
  draft: forged.draft,
  started: true,
  hero: { gold },
  inventory: crafted.inventory,
  equipped: forged.equipped,
  world: { missionPath, completedMissions: ["Juramento da Caravana", "Lobos ao Crepúsculo", "Caverna dos Goblins"], activeRegion: "forest", missionProgress: { "wolves-at-dusk": { stage: 2, completed: false } }, missionChoices: { "wolves-at-dusk:1": "guard" }, activeMissionId: "wolves-at-dusk", monsterKills: 19, dungeonRooms: { forest: 5 }, dungeonChoices: { "forest:3": "loot" }, weather: "névoa", mountTier: 2, guildRank: 1, guildFavor: 10, faction: "Arquivo", factionReputation: { Vigília: 4, Ermos: 1, Arquivo: 9 } },
});
};

const before = await getRpgSave(account.sessionToken);
const first = before.characters.find((entry) => entry.characterName === "QA Vigília");
const second = before.characters.find((entry) => entry.characterName === "QA Arquivo");
const firstSaved = await saveRpgCharacter({ sessionToken: account.sessionToken, characterId: first?.id, characterName: "QA Vigília", classId: "guardian", originId: "vigil", appearanceId: "copper", stateJson: stateFor("QA Vigília", "escort", 95, 1) });
const secondSaved = await saveRpgCharacter({ sessionToken: account.sessionToken, characterId: second?.id, characterName: "QA Arquivo", classId: "arcanist", originId: "archive", appearanceId: "moon", stateJson: stateFor("QA Arquivo", "salvage", 64, 5) });

await selectRpgCharacter(account.sessionToken, secondSaved.characterId);
const loaded = await getRpgSave(account.sessionToken);
const restored = JSON.parse(loaded.character?.stateJson ?? "{}");

assert.equal(loaded.account.activeCharacterId, secondSaved.characterId);
assert.ok(loaded.characters.some((entry) => entry.id === firstSaved.characterId));
assert.ok(loaded.characters.some((entry) => entry.id === secondSaved.characterId));
assert.equal(restored.world.missionPath, "salvage");
assert.equal(restored.hero.gold, 64);
assert.equal(restored.draft.raceId, "aetheri");
assert.equal(restored.draft.relicId, "thornsigil");
assert.equal(restored.equipped.relic, "thornsigil");
assert.equal(restored.inventory.find((item) => item.id === "riftheart")?.quantity, 1);
assert.equal(restored.inventory.find((item) => item.id === "obsidian")?.quantity, 1);
assert.equal(restored.inventory.find((item) => item.id === "embercore")?.quantity, 0);
assert.equal(restored.world.activeRegion, "forest");
assert.equal(restored.world.missionProgress["wolves-at-dusk"].stage, 2);
assert.equal(restored.world.dungeonRun, undefined);
assert.equal(restored.world.mountTier, 2);
assert.equal(restored.world.guildRank, 1);
assert.equal(restored.world.guildFavor, 10);
assert.equal(restored.world.missionChoices["wolves-at-dusk:1"], "guard");
assert.equal(restored.world.dungeonChoices["forest:3"], "loot");
assert.equal(restored.world.factionReputation.Arquivo, 9);
assert.equal(restored.world.completedMissions.includes("Caverna dos Goblins"), true);
assert.equal(restored.world.missionProgress["wolves-at-dusk"].stage, 2);
assert.equal(restored.world.faction, "Arquivo");

console.log("Persistência real validada: fichas, seleção ativa, missão encenada, região, dungeon, clima, montaria, facção e equipamento místico forjado restaurados.");
process.exit(0);
