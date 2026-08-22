export type RegionId = "village" | "forest" | "desert" | "orcs" | "frost" | "volcano" | "sky" | "abyss" | "kingdom";
export type MissionKind = "principal" | "secundária" | "regional" | "oculta" | "diária" | "lendária";

export type RegionDefinition = {
  id: RegionId;
  order: number;
  name: string;
  subtitle: string;
  level: number;
  unlockLevel: number;
  resource: string;
  mobs: string[];
  dungeon: string;
  minBosses: string[];
  boss: string;
  tone: "copper" | "verdant" | "sand" | "ember" | "frost" | "sky" | "void" | "crown";
};

export type WorldMission = {
  id: string;
  kind: MissionKind;
  region: RegionId;
  threat: "baixa" | "média" | "alta" | "extrema";
  title: string;
  patron: string;
  description: string;
  steps: string[];
  encounterKey: string;
  reward: { gold: number; reputation: number; material: string; quantity: number };
};

export type MissionProgress = Record<string, { stage: number; completed: boolean }>;

export const regionCatalog: RegionDefinition[] = [
  { id: "village", order: 1, name: "Aldeia da Vigília", subtitle: "Mercado, forja e juramentos", level: 1, unlockLevel: 1, resource: "Minério de Vigília", mobs: ["Batedor Goblin", "Lobo da Cerca"], dungeon: "Catacumbas do Sino", minBosses: ["Capataz da Estrada"], boss: "Vigia de Loran", tone: "copper" },
  { id: "forest", order: 2, name: "Floresta Sombria", subtitle: "Raízes que escutam", level: 3, unlockLevel: 3, resource: "Fibra de Veyra", mobs: ["Lobo de Breu", "Aranha do Dossel", "Saqueador Verde"], dungeon: "Caverna dos Goblins", minBosses: ["Matriarca da Teia"], boss: "Eremita de Espinhos", tone: "verdant" },
  { id: "desert", order: 3, name: "Deserto de Arkan", subtitle: "Areia, ossos e miragens", level: 5, unlockLevel: 5, resource: "Vidro de Areia", mobs: ["Escorpião de Cinza", "Múmia Errante", "Verme Jovem"], dungeon: "Templo Perdido", minBosses: ["Guardião de Sal"], boss: "Oráculo Sem Rosto", tone: "sand" },
  { id: "orcs", order: 4, name: "Montanhas Orcs", subtitle: "Fortalezas acima das nuvens", level: 7, unlockLevel: 7, resource: "Aço de Guerra", mobs: ["Orc Guerreiro", "Orc Arqueiro", "Orc Xamã"], dungeon: "Fortaleza Orc", minBosses: ["General Grom"], boss: "Rei Vorgath", tone: "ember" },
  { id: "frost", order: 5, name: "Terras Congeladas", subtitle: "Onde o vento guarda memórias", level: 9, unlockLevel: 9, resource: "Cristal de Geada", mobs: ["Lobo de Gelo", "Elemental Frio", "Gigante Menor"], dungeon: "Santuário da Neve", minBosses: ["Caçadora de Marfim"], boss: "Jarl de Gelo", tone: "frost" },
  { id: "volcano", order: 6, name: "Vulcão de Khar", subtitle: "Brasa antiga sob pedra viva", level: 11, unlockLevel: 11, resource: "Núcleo de Brasa", mobs: ["Salamandra de Lava", "Demônio de Cinza", "Draco Jovem"], dungeon: "Covil do Dragão", minBosses: ["Forjador Infernal"], boss: "Aurelion Desperto", tone: "ember" },
  { id: "sky", order: 7, name: "Ilhas do Céu", subtitle: "Pontes quebradas entre estrelas", level: 13, unlockLevel: 13, resource: "Pena Celeste", mobs: ["Harpia de Tempestade", "Anjo Caído", "Elemental Celeste"], dungeon: "Templo Celestial", minBosses: ["Arconte Partida"], boss: "Serafim do Crepúsculo", tone: "sky" },
  { id: "abyss", order: 8, name: "Abismo Silencioso", subtitle: "O selo que nunca deveria abrir", level: 15, unlockLevel: 15, resource: "Essência Abissal", mobs: ["Mortovivo de Breu", "Demônio de Fenda", "Vigia Oco"], dungeon: "Labirinto da Ruptura", minBosses: ["Devorador de Ecos"], boss: "Rainha do Abismo", tone: "void" },
  { id: "kingdom", order: 9, name: "Reino Final", subtitle: "A última muralha do mundo", level: 18, unlockLevel: 18, resource: "Selo Real", mobs: ["Cavaleiro Corrompido", "Mago da Coroa", "Besta do Trono"], dungeon: "Palácio do Último Rei", minBosses: ["Campeão da Coroa"], boss: "Rei Sem Aurora", tone: "crown" },
];

export const worldMissions: WorldMission[] = [
  { id: "trail-oath", kind: "principal", region: "village", threat: "baixa", title: "O Juramento da Trilha", patron: "Oren Vale", description: "Descubra por que os selos de Loran voltaram a pulsar.", steps: ["Ouça o aviso de Oren", "Patrulhe a estrada da aldeia", "Derrote a ameaça na ponte", "Reclame o mapa queimado"], encounterKey: "road-captain", reward: { gold: 48, reputation: 8, material: "ironore", quantity: 3 } },
  { id: "lanterns-of-vigil", kind: "secundária", region: "village", threat: "baixa", title: "Lanternas da Vigília", patron: "Irmã Mavra", description: "Três lanternas se apagaram ao redor da muralha e algo observa a aldeia no escuro.", steps: ["Aceite as lanternas de Mavra", "Atravesse o pátio em ruínas", "Afaste o vigia faminto", "Acenda o último farol"], encounterKey: "vigil-lantern", reward: { gold: 42, reputation: 7, material: "ironore", quantity: 2 } },
  { id: "well-below-stone", kind: "regional", region: "village", threat: "média", title: "O Poço Sob a Pedra", patron: "Ancião Gald", description: "Batidas sob o poço antigo ameaçam contaminar a água e acordar os ecos da aldeia.", steps: ["Ouça os golpes sob o poço", "Desça pelas correntes", "Derrote a matilha subterrânea", "Sele o veio corrompido"], encounterKey: "well-echo", reward: { gold: 58, reputation: 9, material: "obsidian", quantity: 1 } },
  { id: "road-bounty", kind: "diária", region: "village", threat: "baixa", title: "Recompensa da Estrada", patron: "Quadro da Vigília", description: "A estrada precisa de um protetor. Escolha uma rota, cace a ameaça e recolha o selo de pagamento.", steps: ["Tome o aviso do quadro", "Procure rastros no capim", "Vença o caçador de estrada", "Receba o pagamento"], encounterKey: "road-bounty", reward: { gold: 34, reputation: 4, material: "wildfiber", quantity: 1 } },
  { id: "wolves-at-dusk", kind: "secundária", region: "forest", threat: "média", title: "Lobos ao Crepúsculo", patron: "Mestre Rhel", description: "A matilha caça viajantes sob as raízes da Floresta Sombria.", steps: ["Siga pegadas na neblina", "Proteja a carroça abandonada", "Enfrente o Alfa de Breu", "Devolva o amuleto encontrado"], encounterKey: "forest-alpha", reward: { gold: 72, reputation: 10, material: "wildfiber", quantity: 4 } },
  { id: "arkan-lost-sword", kind: "oculta", region: "desert", threat: "alta", title: "A Espada Soterrada", patron: "Uma inscrição sem nome", description: "Um fragmento de mapa aponta para uma lâmina enterrada no mar de vidro.", steps: ["Examine a estela quebrada", "Atravesse a miragem", "Derrote o guardião de sal", "Desenterre a lâmina perdida"], encounterKey: "salt-guardian", reward: { gold: 110, reputation: 12, material: "aethercrystal", quantity: 3 } },
  { id: "orcs-banner", kind: "regional", region: "orcs", threat: "alta", title: "Estandarte da Montanha", patron: "Capitã Veya", description: "Derrube o estandarte de Vorgath e corte as linhas de guerra orcs.", steps: ["Infiltre a fortaleza", "Sabote as catapultas", "Vença o General Grom", "Queime o estandarte de guerra"], encounterKey: "general-grom", reward: { gold: 168, reputation: 18, material: "embercore", quantity: 2 } },
  { id: "daily-bounty", kind: "diária", region: "village", threat: "baixa", title: "Bênção da Vigília", patron: "Quadro de recompensas", description: "Derrote criaturas da rota e prove que a aldeia pode dormir em paz.", steps: ["Aceite a recompensa", "Derrote três criaturas", "Volte à aldeia"], encounterKey: "road-captain", reward: { gold: 36, reputation: 4, material: "obsidian", quantity: 1 } },
  { id: "dragon-legacy", kind: "lendária", region: "volcano", threat: "extrema", title: "O Legado de Aurelion", patron: "Cinzas do antigo dragão", description: "Enfrente o despertar dracônico antes que Khar reduza o mundo a brasa.", steps: ["Desça ao covil", "Rompa três selos de brasa", "Sobreviva ao despertar", "Derrote Aurelion"], encounterKey: "aurelion", reward: { gold: 360, reputation: 40, material: "embercore", quantity: 6 } },
];

export function missionThreatLabel(mission: WorldMission): string {
  return mission.threat.toUpperCase();
}

export function regionById(id: RegionId): RegionDefinition {
  return regionCatalog.find((region) => region.id === id) ?? regionCatalog[0];
}

export function regionUnlocked(level: number, completedMissions: string[], region: RegionDefinition): boolean {
  return level >= region.unlockLevel && (region.order < 4 || completedMissions.length >= region.order - 3);
}

export function initialMissionProgress(): MissionProgress {
  return {};
}

export function advanceMission(progress: MissionProgress, mission: WorldMission, encounterWon = false): MissionProgress {
  const current = progress[mission.id] ?? { stage: 0, completed: false };
  if (current.completed) return progress;
  const nextStage = Math.min(mission.steps.length, current.stage + (encounterWon ? 1 : 1));
  return { ...progress, [mission.id]: { stage: nextStage, completed: nextStage >= mission.steps.length } };
}

export function missionStage(progress: MissionProgress, mission: WorldMission): number {
  return Math.min(mission.steps.length, progress[mission.id]?.stage ?? 0);
}

export function deterministicDungeonRoom(regionId: RegionId, room: number): { room: number; label: string; reward: "combat" | "cache" | "event" } {
  const labels = ["Galeria de entrada", "Câmara de ecos", "Passagem lacrada", "Tesouro velado", "Santuário do chefe"];
  const seed = regionId.length * 17 + room * 11;
  const rewards: Array<"combat" | "cache" | "event"> = ["combat", "cache", "event"];
  return { room, label: labels[Math.min(labels.length - 1, room)], reward: rewards[seed % rewards.length] };
}

const bossDirectives: Record<RegionId, { opening: string; breaking: string; final: string }> = {
  village: { opening: "Sentinela da muralha", breaking: "Olho de Loran", final: "Juramento em ruínas" },
  forest: { opening: "Raízes predadoras", breaking: "Esporos do dossel", final: "Coração de espinhos" },
  desert: { opening: "Miragem cortante", breaking: "Areia sem rosto", final: "Profecia de sal" },
  orcs: { opening: "Grito de guerra", breaking: "Muralha de aço", final: "Coroa de sangue" },
  frost: { opening: "Inverno paciente", breaking: "Nevasca de marfim", final: "Trono congelado" },
  volcano: { opening: "Brasa recolhida", breaking: "Asas de escória", final: "Coração de dragão" },
  sky: { opening: "Voo crepuscular", breaking: "Relâmpago partido", final: "Julgamento celeste" },
  abyss: { opening: "Sussurro do vazio", breaking: "Fenda faminta", final: "Rainha sem eco" },
  kingdom: { opening: "Decreto do trono", breaking: "Aurora corrompida", final: "Última sentença" },
};

export function regionalBossDirective(regionId: RegionId, hpPercent: number): { phase: "opening" | "breaking" | "final"; label: string; intent: string; damageMultiplier: number } {
  const directive = bossDirectives[regionId];
  if (hpPercent <= .3) return { phase: "final", label: directive.final, intent: "Golpe de execução", damageMultiplier: 1.35 };
  if (hpPercent <= .62) return { phase: "breaking", label: directive.breaking, intent: "Ruptura territorial", damageMultiplier: 1.18 };
  return { phase: "opening", label: directive.opening, intent: "Investida de domínio", damageMultiplier: 1 };
}

export function factionRewardUnlocked(favor: number, minimum = 8): boolean {
  return favor >= minimum;
}

export function missionDungeonSatisfied(completedMissions: string[], dungeonName: string): boolean {
  return completedMissions.includes(dungeonName);
}

export function advanceMissionAfterDungeon(progress: MissionProgress, mission: WorldMission, completedMissions: string[], dungeonName: string): MissionProgress {
  if (!missionDungeonSatisfied(completedMissions, dungeonName)) return progress;
  const current = progress[mission.id] ?? { stage: 0, completed: false };
  return current.stage <= 1 ? advanceMission(progress, mission) : progress;
}
