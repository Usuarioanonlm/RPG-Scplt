import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  registerRpgAccount: vi.fn(),
  loginRpgAccount: vi.fn(),
  getRpgSave: vi.fn(),
  saveRpgCharacter: vi.fn(),
  selectRpgCharacter: vi.fn(),
}));

vi.mock("./db", () => mocks);

import { appRouter } from "./routers";

const ctx = {
  user: null,
  req: { protocol: "https", headers: {} },
  res: { clearCookie: vi.fn() },
} as any;

describe("contratos de conta e persistência do RPG", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejeita credenciais abaixo do mínimo antes de consultar o banco", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.rpg.register({ nickname: "ab", password: "123" })).rejects.toThrow();
    expect(mocks.registerRpgAccount).not.toHaveBeenCalled();
  });

  it("encaminha cadastro válido para a camada de conta", async () => {
    mocks.registerRpgAccount.mockResolvedValue({ id: 3, nickname: "mira_voss", sessionToken: "token-para-teste-com-mais-de-vinte-caracteres" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.rpg.register({ nickname: "mira_voss", password: "senha-segura" });
    expect(mocks.registerRpgAccount).toHaveBeenCalledWith("mira_voss", "senha-segura");
    expect(result.nickname).toBe("mira_voss");
  });

  it("persiste a ficha e a progressão de mundo serializadas", async () => {
    mocks.saveRpgCharacter.mockResolvedValue({ savedAt: 1 });
    const caller = appRouter.createCaller(ctx);
    const stateJson = JSON.stringify({ hero: { gold: 86 }, inventory: [{ id: "obsidian", quantity: 2 }], world: { reputation: 4, campRank: 1, missionPath: "salvage", events: ["Caravana Perdida"], achievements: ["Fogueira Restaurada"], checkpoint: { label: "Descanso de expedição", nodeId: "camp", encounterIndex: 1, savedAt: 1 } } });
    await caller.rpg.save({
      sessionToken: "token-para-teste-com-mais-de-vinte-caracteres",
      characterName: "Mira Voss",
      classId: "guardian",
      originId: "vigil",
      appearanceId: "copper",
      stateJson,
    });
    expect(mocks.saveRpgCharacter).toHaveBeenCalledWith(expect.objectContaining({ characterName: "Mira Voss", stateJson }));
    expect(JSON.parse(stateJson).world).toMatchObject({ reputation: 4, campRank: 1, missionPath: "salvage", events: ["Caravana Perdida"], checkpoint: { nodeId: "camp", encounterIndex: 1 } });
    expect(JSON.parse(stateJson).inventory).toEqual([{ id: "obsidian", quantity: 2 }]);
  });

  it("restaura o checkpoint completo ao carregar a ficha", async () => {
    const checkpoint = { label: "Descanso após Bruto das Fendas", nodeId: "rest", encounterIndex: 1, savedAt: 1724239000000 };
    mocks.getRpgSave.mockResolvedValue({
      characterName: "Mira Voss",
      classId: "guardian",
      originId: "vigil",
      appearanceId: "copper",
      stateJson: JSON.stringify({ encounterIndex: 1, world: { checkpoint } }),
    });
    const caller = appRouter.createCaller(ctx);

    const restored = await caller.rpg.load({ sessionToken: "token-para-teste-com-mais-de-vinte-caracteres" });

    expect(mocks.getRpgSave).toHaveBeenCalledWith("token-para-teste-com-mais-de-vinte-caracteres");
    const restoredState = JSON.parse(restored!.stateJson);
    expect(restoredState.world.checkpoint).toEqual(checkpoint);
    expect(restoredState.world.checkpoint).toMatchObject({ label: "Descanso após Bruto das Fendas", nodeId: "rest", encounterIndex: 1 });
  });

  it("salva e seleciona fichas independentes da mesma conta", async () => {
    mocks.saveRpgCharacter.mockResolvedValue({ savedAt: 1, characterId: 9 });
    mocks.selectRpgCharacter.mockResolvedValue({ id: 9, characterName: "Mira Voss" });
    const caller = appRouter.createCaller(ctx);
    await caller.rpg.save({ sessionToken: "token-para-teste-com-mais-de-vinte-caracteres", characterId: 9, characterName: "Mira Voss", classId: "guardian", originId: "vigil", appearanceId: "copper", stateJson: "{}" });
    await caller.rpg.selectCharacter({ sessionToken: "token-para-teste-com-mais-de-vinte-caracteres", characterId: 9 });
    expect(mocks.saveRpgCharacter).toHaveBeenCalledWith(expect.objectContaining({ characterId: 9 }));
    expect(mocks.selectRpgCharacter).toHaveBeenCalledWith("token-para-teste-com-mais-de-vinte-caracteres", 9);
  });

  it("expõe a ficha ativa e o arquivo completo ao carregar a conta", async () => {
    const stateJson = JSON.stringify({ hero: { gold: 95 }, inventory: [{ id: "obsidian", quantity: 1 }], world: { missionPath: "escort" } });
    mocks.getRpgSave.mockResolvedValue({ account: { nickname: "mira_voss", activeCharacterId: 9 }, character: { id: 9, characterName: "Mira Voss", stateJson }, characters: [{ id: 9, characterName: "Mira Voss", classId: "guardian", originId: "vigil", appearanceId: "copper" }, { id: 10, characterName: "Ilen", classId: "arcanist", originId: "archive", appearanceId: "moon" }] });
    const caller = appRouter.createCaller(ctx);
    const loaded = await caller.rpg.load({ sessionToken: "token-para-teste-com-mais-de-vinte-caracteres" });
    expect(loaded.account.activeCharacterId).toBe(9);
    expect(loaded.characters).toHaveLength(2);
    expect(loaded.characters[1]).toMatchObject({ id: 10, characterName: "Ilen" });
    expect(JSON.parse(loaded.character.stateJson)).toMatchObject({ hero: { gold: 95 }, world: { missionPath: "escort" }, inventory: [{ id: "obsidian", quantity: 1 }] });
  });
});
