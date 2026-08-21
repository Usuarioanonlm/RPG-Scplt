import { describe, expect, it } from "vitest";
import { affinityMultiplier, consumeTurn, gainExperience, isPhaseActive, refreshEffect, xpForNextLevel } from "../shared/rpgRules";

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
    expect(affinityMultiplier("physical", "arcane", "arcane")).toBe(1);
    expect(isPhaseActive(47, 94, .5)).toBe(true);
    expect(isPhaseActive(48, 94, .5)).toBe(false);
  });
});
