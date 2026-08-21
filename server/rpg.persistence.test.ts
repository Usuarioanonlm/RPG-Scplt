import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  registerRpgAccount: vi.fn(),
  loginRpgAccount: vi.fn(),
  getRpgSave: vi.fn(),
  saveRpgCharacter: vi.fn(),
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
    const stateJson = JSON.stringify({ hero: { gold: 86 }, inventory: [], world: { reputation: 4, campRank: 1, events: ["Caravana Perdida"], achievements: ["Fogueira Restaurada"], checkpoint: { label: "Descanso de expedição", nodeId: "camp", encounterIndex: 1, savedAt: 1 } } });
    await caller.rpg.save({
      sessionToken: "token-para-teste-com-mais-de-vinte-caracteres",
      characterName: "Mira Voss",
      classId: "guardian",
      originId: "vigil",
      appearanceId: "copper",
      stateJson,
    });
    expect(mocks.saveRpgCharacter).toHaveBeenCalledWith(expect.objectContaining({ characterName: "Mira Voss", stateJson }));
    expect(JSON.parse(stateJson).world).toMatchObject({ reputation: 4, campRank: 1, events: ["Caravana Perdida"], checkpoint: { nodeId: "camp", encounterIndex: 1 } });
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
});
