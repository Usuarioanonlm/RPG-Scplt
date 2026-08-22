import { describe, expect, it } from "vitest";
import { affinityMultiplier, consumeTurn, gainExperience, isPhaseActive, marketCatalog, materialSaleValue, missionOutcome, refreshEffect, rotatingStock, sellMaterial, xpForNextLevel } from "../shared/rpgRules";

describe("regras de progressão do RPG", () => {
  it("converte XP suficiente em nível, pontos de atributo e ponto de talento", () => {
    const result = gainExperience({ level: 1, xp: 90, attributePoints: 0, talentPoints: 0 }, 30);
    expect(xpForNextLevel(1)).toBe(110);
    expect(result).toEqual({ state: { level: 2, xp: 10, attributePoints: 2, talentPoints: 1 }, levelsGained: 1 });
  });

  it("renova o efeito sem duplicá-lo e reduz sua duração por turno", () => {
    const refreshed = refreshEffect([{ id: "venom", label: "Veneno", turns: 1, value: 3 }], { id: "venom", label: "Veneno", turns: 3, value: 4 });
    expect(refreshed).toEqual([{ id: "venom", label: "Veneno", turns: 3, value: 4 }]);
    expect(consumeTurn(refreshed)).toEqual([{ id: "venom", label: "Veneno", turns: 2, value: 4 }]);
  });

  it("amplia fraquezas, reduz resistências e ativa a fase na faixa correta de vitalidade", () => {
    expect(affinityMultiplier("arcane", "arcane", "physical")).toBe(1.35);
    expect(affinityMultiplier("physical", "arcane", "physical")).toBe(.72);
    expect(affinityMultiplier("fire", "fire", "ice")).toBe(1.35);
    expect(affinityMultiplier("physical", "arcane", "arcane")).toBe(1);
    expect(isPhaseActive(47, 94, .5)).toBe(true);
    expect(isPhaseActive(48, 94, .5)).toBe(false);
  });

  it("mantém recompensas de rota e estoque determinísticos", () => {
    expect(missionOutcome("escort")).toMatchObject({ reputation: 8, gold: 25, ending: "Pacto da Vigília" });
    expect(missionOutcome("salvage")).toMatchObject({ obsidian: 2, ending: "Espólio das Fendas" });
    expect(rotatingStock(["a", "b", "c", "d"], 3, 3)).toEqual(["d", "a", "b"]);
    expect(materialSaleValue(12)).toBe(9);
    expect(materialSaleValue(0)).toBe(1);
  });

  it("monta o catálogo rotativo e liquida materiais sem afetar os demais itens", () => {
    const catalog = [{ id: "healing" }, { id: "mana" }, { id: "greaterheal" }, { id: "ward" }, { id: "sabre" }, { id: "seal" }, { id: "cloak" }];
    expect(marketCatalog(catalog, 2, ["healing", "mana", "greaterheal"]).map((entry) => entry.id)).toEqual(["healing", "mana", "greaterheal", "seal", "cloak", "ward"]);
    const sale = sellMaterial([{ id: "obsidian", quantity: 2, value: 8 }, { id: "mark", quantity: 1, value: 12 }], "obsidian");
    expect(sale).toEqual({ gold: 6, inventory: [{ id: "obsidian", quantity: 1, value: 8 }, { id: "mark", quantity: 1, value: 12 }] });
  });
});
