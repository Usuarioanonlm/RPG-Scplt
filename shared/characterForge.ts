export type RaceId = "human" | "aetheri" | "stoneborn";
export type RelicId = "sunshard" | "moonprayer" | "thornsigil";

export const raceCatalog = [
  { id: "human" as const, name: "Humano de Loran", epithet: "Herança da Vigília", description: "Versáteis, juramentados e obstinados diante das ruínas.", bonus: { force: 1, agility: 0, arcane: 0, defense: 1, hp: 4, mana: 0 } },
  { id: "aetheri" as const, name: "Aetheri", epithet: "Sangue das Estrelas", description: "Descendentes de observadores celestes, sensíveis à mana antiga.", bonus: { force: 0, agility: 0, arcane: 2, defense: 0, hp: 0, mana: 6 } },
  { id: "stoneborn" as const, name: "Petricano", epithet: "Filhos da Pedra", description: "Povos de montanha cuja memória resiste como basalto.", bonus: { force: 1, agility: 0, arcane: 0, defense: 2, hp: 8, mana: 0 } },
];

export const sacredRelicCatalog = [
  { id: "sunshard" as const, name: "Coração de Aurelion", title: "Relíquia do Sol Partido", description: "Uma brasa dourada que desperta coragem no aço.", benefit: "+2 Força", itemId: "sunshard" },
  { id: "moonprayer" as const, name: "Litania da Lua Velada", title: "Relíquia da Guarda Silenciosa", description: "Um fragmento de oração lunar que se fecha sobre o portador.", benefit: "+2 Defesa", itemId: "moonprayer" },
  { id: "thornsigil" as const, name: "Selo da Raiz Ancestral", title: "Relíquia do Éter Verde", description: "Raízes de obsidiana que canalizam a magia da terra.", benefit: "+2 Arcano", itemId: "thornsigil" },
];

export function forgeSummary(raceId: RaceId, relicId: RelicId) {
  const race = raceCatalog.find((entry) => entry.id === raceId) ?? raceCatalog[0];
  const relic = sacredRelicCatalog.find((entry) => entry.id === relicId) ?? sacredRelicCatalog[0];
  return { race, relic };
}

export function restoreForgeChoice(selection: { raceId?: string; relicId?: string }) {
  const raceId = raceCatalog.some((entry) => entry.id === selection.raceId) ? selection.raceId as RaceId : "human";
  const relicId = sacredRelicCatalog.some((entry) => entry.id === selection.relicId) ? selection.relicId as RelicId : "sunshard";
  return { raceId, relicId };
}

export function forgeStarterLoadout(relicId: RelicId) {
  const { relic } = forgeSummary("human", relicId);
  return { relicItemId: relic.itemId, equipped: { weapon: "watchblade", armor: "lorancloak", relic: relic.itemId } };
}

export function forgeCampaignStart(selection: { raceId?: string; relicId?: string }) {
  const choices = restoreForgeChoice(selection);
  const loadout = forgeStarterLoadout(choices.relicId);
  return { ...choices, loadout, inventory: [{ id: loadout.relicItemId, quantity: 1 }] };
}

export function forgeFirstCampaignSave(input: { draft: { raceId?: string; relicId?: string; [key: string]: unknown }; inventory?: Array<{ id: string; quantity: number }> }) {
  const campaign = forgeCampaignStart(input.draft);
  const withoutRelic = (input.inventory ?? []).filter((item) => item.id !== campaign.loadout.relicItemId);
  return { draft: { ...input.draft, raceId: campaign.raceId, relicId: campaign.relicId }, inventory: [...withoutRelic, ...campaign.inventory], equipped: campaign.loadout.equipped };
}
