import { describe, expect, it } from "vitest";
import { forgeCampaignStart, forgeFirstCampaignSave, forgeStarterLoadout, forgeSummary, raceCatalog, restoreForgeChoice, sacredRelicCatalog } from "../shared/characterForge";

describe("forja de personagem", () => {
  it("oferece três heranças e três relíquias de início distintas", () => {
    expect(raceCatalog).toHaveLength(3);
    expect(sacredRelicCatalog).toHaveLength(3);
    expect(new Set(sacredRelicCatalog.map((entry) => entry.itemId)).size).toBe(3);
  });

  it("resolve a herança e a relíquia selecionadas para a ficha", () => {
    const selection = forgeSummary("aetheri", "moonprayer");
    expect(selection.race.name).toBe("Aetheri");
    expect(selection.relic.benefit).toBe("+2 Defesa");
  });

  it("restaura escolhas antigas com valores seguros e preserva escolhas válidas", () => {
    expect(restoreForgeChoice({})).toEqual({ raceId: "human", relicId: "sunshard" });
    expect(restoreForgeChoice({ raceId: "stoneborn", relicId: "thornsigil" })).toEqual({ raceId: "stoneborn", relicId: "thornsigil" });
  });

  it("equipa a relíquia escolhida no primeiro carregamento da campanha", () => {
    expect(forgeStarterLoadout("moonprayer")).toEqual({ relicItemId: "moonprayer", equipped: { weapon: "watchblade", armor: "lorancloak", relic: "moonprayer" } });
  });

  it("transforma a escolha da forja no item e vínculo que serão persistidos", () => {
    const campaign = forgeCampaignStart({ raceId: "aetheri", relicId: "thornsigil" });
    expect(campaign.raceId).toBe("aetheri");
    expect(campaign.inventory).toEqual([{ id: "thornsigil", quantity: 1 }]);
    expect(campaign.loadout.equipped.relic).toBe("thornsigil");
  });

  it("gera o primeiro salvamento da ficha com a relíquia equipada sem estado manual", () => {
    const saved = forgeFirstCampaignSave({ draft: { name: "Lysa", raceId: "stoneborn", relicId: "moonprayer" }, inventory: [{ id: "obsidian", quantity: 2 }] });
    expect(saved.draft).toMatchObject({ raceId: "stoneborn", relicId: "moonprayer" });
    expect(saved.inventory).toEqual([{ id: "obsidian", quantity: 2 }, { id: "moonprayer", quantity: 1 }]);
    expect(saved.equipped.relic).toBe("moonprayer");
  });
});
