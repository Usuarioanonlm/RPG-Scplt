export type AttributeKey = "force" | "agility" | "arcane" | "defense";
export type StatusId = "venom" | "burn" | "barrier" | "stun";
export type DamageAffinity = "physical" | "arcane";

export type StatusEffect = {
  id: StatusId;
  label: string;
  turns: number;
  value: number;
};

export type ProgressState = {
  level: number;
  xp: number;
  attributePoints: number;
  talentPoints: number;
};

export const xpForNextLevel = (level: number) => 110 + Math.max(0, level - 1) * 90;

export function gainExperience(state: ProgressState, awardedXp: number): { state: ProgressState; levelsGained: number } {
  let level = state.level;
  let xp = state.xp + Math.max(0, awardedXp);
  let levelsGained = 0;

  while (xp >= xpForNextLevel(level)) {
    xp -= xpForNextLevel(level);
    level += 1;
    levelsGained += 1;
  }

  return {
    state: {
      level,
      xp,
      attributePoints: state.attributePoints + levelsGained * 2,
      talentPoints: state.talentPoints + levelsGained,
    },
    levelsGained,
  };
}

export function refreshEffect(effects: StatusEffect[], effect: StatusEffect): StatusEffect[] {
  const current = effects.find((entry) => entry.id === effect.id);
  if (!current) return [...effects, effect];
  return effects.map((entry) => entry.id === effect.id ? { ...entry, turns: Math.max(entry.turns, effect.turns), value: Math.max(entry.value, effect.value) } : entry);
}

export function consumeTurn(effects: StatusEffect[]): StatusEffect[] {
  return effects.flatMap((effect) => effect.turns <= 1 ? [] : [{ ...effect, turns: effect.turns - 1 }]);
}

export function affinityMultiplier(affinity: DamageAffinity, weakness: DamageAffinity, resistance: DamageAffinity): number {
  if (affinity === weakness) return 1.35;
  if (affinity === resistance) return .72;
  return 1;
}

export function isPhaseActive(currentHp: number, maxHp: number, threshold?: number): boolean {
  return Boolean(threshold && currentHp <= maxHp * threshold);
}

export type MissionPath = "escort" | "salvage";

export function missionOutcome(path: MissionPath) {
  return path === "escort"
    ? { reputation: 8, gold: 25, obsidian: 0, ending: "Pacto da Vigília" }
    : { reputation: 3, gold: 10, obsidian: 2, ending: "Espólio das Fendas" };
}

export function rotatingStock<T>(catalog: T[], rotation: number, count: number): T[] {
  if (!catalog.length || count <= 0) return [];
  const size = Math.min(catalog.length, count);
  const start = Math.abs(rotation) % catalog.length;
  return Array.from({ length: size }, (_, index) => catalog[(start + index) % catalog.length]);
}

export function materialSaleValue(value: number): number {
  return Math.max(1, Math.floor(Math.max(0, value) * .75));
}

export function marketCatalog<T extends { id: string }>(catalog: T[], rotation: number, stapleIds: string[], rotatingCount = 3): T[] {
  const staples = catalog.filter((entry) => stapleIds.includes(entry.id));
  const travelling = rotatingStock(catalog.filter((entry) => !stapleIds.includes(entry.id)), rotation, rotatingCount);
  return [...staples, ...travelling];
}

export function sellMaterial<T extends { id: string; quantity: number; value: number }>(inventory: T[], itemId: string): { inventory: T[]; gold: number } {
  const item = inventory.find((entry) => entry.id === itemId);
  if (!item || item.quantity <= 0) return { inventory, gold: 0 };
  return { inventory: inventory.map((entry) => entry.id === itemId ? { ...entry, quantity: entry.quantity - 1 } : entry), gold: materialSaleValue(item.value) };
}
