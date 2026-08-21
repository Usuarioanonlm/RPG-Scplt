import assert from "node:assert/strict";
import { getRpgSave, loginRpgAccount, saveRpgCharacter, selectRpgCharacter } from "../server/db.ts";

const nickname = "qa_expansao_20260821";
const password = "qa-expansao-2026";
const account = await loginRpgAccount(nickname, password);
const stateFor = (name, missionPath, gold, obsidian) => JSON.stringify({
  draft: { name, classId: missionPath === "escort" ? "guardian" : "arcanist", originId: missionPath === "escort" ? "vigil" : "archive", appearanceId: missionPath === "escort" ? "copper" : "moon" },
  started: true,
  hero: { gold },
  inventory: [{ id: "obsidian", quantity: obsidian }],
  world: { missionPath, completedMissions: ["Juramento da Caravana"] },
});

const before = await getRpgSave(account.sessionToken);
const first = before.characters.find((entry) => entry.characterName === "QA Vigília");
const second = before.characters.find((entry) => entry.characterName === "QA Arquivo");
const firstSaved = await saveRpgCharacter({ sessionToken: account.sessionToken, characterId: first?.id, characterName: "QA Vigília", classId: "guardian", originId: "vigil", appearanceId: "copper", stateJson: stateFor("QA Vigília", "escort", 95, 1) });
const secondSaved = await saveRpgCharacter({ sessionToken: account.sessionToken, characterId: second?.id, characterName: "QA Arquivo", classId: "arcanist", originId: "archive", appearanceId: "moon", stateJson: stateFor("QA Arquivo", "salvage", 64, 2) });

await selectRpgCharacter(account.sessionToken, secondSaved.characterId);
const loaded = await getRpgSave(account.sessionToken);
const restored = JSON.parse(loaded.character?.stateJson ?? "{}");

assert.equal(loaded.account.activeCharacterId, secondSaved.characterId);
assert.ok(loaded.characters.some((entry) => entry.id === firstSaved.characterId));
assert.ok(loaded.characters.some((entry) => entry.id === secondSaved.characterId));
assert.equal(restored.world.missionPath, "salvage");
assert.equal(restored.hero.gold, 64);
assert.deepEqual(restored.inventory, [{ id: "obsidian", quantity: 2 }]);

console.log("Persistência real validada: duas fichas, seleção ativa, missão e estado econômico restaurados.");
process.exit(0);
