export type CraftRarity = "comum" | "raro" | "épico" | "místico";
export type CraftMaterialId = "ironore" | "wildfiber" | "aethercrystal" | "obsidian" | "embercore" | "goblinmark";
export type CraftOutputId = "ironwatch" | "mistmantle" | "eclipseblade" | "riftheart";

export type CraftIngredient = { id: CraftMaterialId; quantity: number };
export type CraftRecipe = {
  id: CraftOutputId;
  name: string;
  rarity: CraftRarity;
  slot: "weapon" | "armor" | "relic";
  description: string;
  lore: string;
  bonus: { force?: number; arcane?: number; defense?: number; guard?: number };
  ingredients: CraftIngredient[];
};

export type CraftStock = { id: string; quantity: number };

export const craftRecipes: CraftRecipe[] = [
  {
    id: "ironwatch", name: "Faca da Vigília", rarity: "comum", slot: "weapon",
    description: "+2 Força ao atacar.", lore: "Ferro arrancado das fendas e afiado ao lado da primeira fogueira.",
    bonus: { force: 2 }, ingredients: [{ id: "ironore", quantity: 2 }, { id: "wildfiber", quantity: 1 }],
  },
  {
    id: "mistmantle", name: "Manto de Bruma", rarity: "raro", slot: "armor",
    description: "+3 Defesa e +5% de guarda.", lore: "Fibra dos ermos e obsidiana polida costuradas contra a névoa das ruínas.",
    bonus: { defense: 3, guard: .05 }, ingredients: [{ id: "wildfiber", quantity: 3 }, { id: "ironore", quantity: 2 }, { id: "obsidian", quantity: 1 }],
  },
  {
    id: "eclipseblade", name: "Lâmina do Eclipse", rarity: "épico", slot: "weapon",
    description: "+5 Força e +2 Arcano.", lore: "Aço negro aquecido por brasas antigas, feito para romper a vigília do Abismo.",
    bonus: { force: 5, arcane: 2 }, ingredients: [{ id: "ironore", quantity: 4 }, { id: "aethercrystal", quantity: 2 }, { id: "embercore", quantity: 1 }],
  },
  {
    id: "riftheart", name: "Coração da Fenda", rarity: "místico", slot: "relic",
    description: "+5 Arcano, +2 Defesa e +8% de guarda.", lore: "O núcleo de uma fenda domada. Seu pulso responde apenas a quem atravessou Loran.",
    bonus: { arcane: 5, defense: 2, guard: .08 }, ingredients: [{ id: "aethercrystal", quantity: 3 }, { id: "obsidian", quantity: 4 }, { id: "embercore", quantity: 2 }, { id: "goblinmark", quantity: 2 }],
  },
];

export const materialRewards = {
  mob: [{ id: "ironore", quantity: 1 }, { id: "wildfiber", quantity: 1 }],
  subboss: [{ id: "ironore", quantity: 2 }, { id: "aethercrystal", quantity: 1 }, { id: "obsidian", quantity: 1 }],
  boss: [{ id: "embercore", quantity: 1 }, { id: "aethercrystal", quantity: 2 }, { id: "obsidian", quantity: 2 }],
  caravan: [{ id: "wildfiber", quantity: 2 }, { id: "ironore", quantity: 1 }],
  escort: [{ id: "aethercrystal", quantity: 1 }],
  salvage: [{ id: "obsidian", quantity: 2 }, { id: "goblinmark", quantity: 1 }],
} as const satisfies Record<string, readonly CraftIngredient[]>;

export function recipeAffordable(inventory: CraftStock[], recipe: CraftRecipe) {
  return recipe.ingredients.every((ingredient) => (inventory.find((entry) => entry.id === ingredient.id)?.quantity ?? 0) >= ingredient.quantity);
}

export function craftTransaction<T extends CraftStock>(inventory: T[], recipe: CraftRecipe) {
  if (!recipeAffordable(inventory, recipe)) return { crafted: false as const, inventory };
  return {
    crafted: true as const,
    inventory: inventory.map((entry) => {
      const ingredient = recipe.ingredients.find((requirement) => requirement.id === entry.id);
      if (ingredient) return { ...entry, quantity: entry.quantity - ingredient.quantity };
      if (entry.id === recipe.id) return { ...entry, quantity: entry.quantity + 1 };
      return entry;
    }),
  };
}
