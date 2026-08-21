import { describe, expect, it } from "vitest";
import { craftRecipes, craftTransaction, materialRewards, recipeAffordable } from "../shared/craftingRules";

const stock = [
  { id: "ironore", quantity: 5 }, { id: "wildfiber", quantity: 4 }, { id: "aethercrystal", quantity: 3 },
  { id: "obsidian", quantity: 4 }, { id: "embercore", quantity: 2 }, { id: "goblinmark", quantity: 2 },
  { id: "ironwatch", quantity: 0 }, { id: "mistmantle", quantity: 0 }, { id: "eclipseblade", quantity: 0 }, { id: "riftheart", quantity: 0 },
];

describe("crafting rules", () => {
  it("modela uma receita para cada raridade solicitada", () => {
    expect(craftRecipes.map((recipe) => recipe.rarity)).toEqual(["comum", "raro", "épico", "místico"]);
  });

  it("consome materiais e entrega o equipamento criado", () => {
    const recipe = craftRecipes.find((entry) => entry.id === "mistmantle")!;
    const result = craftTransaction(stock, recipe);
    expect(result.crafted).toBe(true);
    expect(result.inventory.find((entry) => entry.id === "mistmantle")?.quantity).toBe(1);
    expect(result.inventory.find((entry) => entry.id === "wildfiber")?.quantity).toBe(1);
    expect(result.inventory.find((entry) => entry.id === "obsidian")?.quantity).toBe(3);
  });

  it("recusa a criação quando falta algum ingrediente", () => {
    const recipe = craftRecipes.find((entry) => entry.id === "riftheart")!;
    const poorStock = stock.map((entry) => entry.id === "embercore" ? { ...entry, quantity: 1 } : entry);
    expect(recipeAffordable(poorStock, recipe)).toBe(false);
    expect(craftTransaction(poorStock, recipe).crafted).toBe(false);
  });

  it("associa recompensas de materiais a encontros, eventos e escolhas de missão", () => {
    expect(materialRewards.boss).toEqual(expect.arrayContaining([{ id: "embercore", quantity: 1 }]));
    expect(materialRewards.caravan).toEqual(expect.arrayContaining([{ id: "wildfiber", quantity: 2 }]));
    expect(materialRewards.salvage).toEqual(expect.arrayContaining([{ id: "obsidian", quantity: 2 }]));
  });
});
