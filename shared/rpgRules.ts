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
