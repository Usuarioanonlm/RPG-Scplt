import { describe, expect, it } from "vitest";
import { advanceMission, advanceMissionAfterDungeon, deterministicDungeonRoom, factionRewardUnlocked, missionDungeonSatisfied, missionThreatLabel, regionCatalog, regionUnlocked, regionalBossDirective, worldMissions } from "../shared/campaignWorld";

describe("campanha regional", () => {
  it("bloqueia regiões acima do nível e libera a aldeia inicial", () => {
    expect(regionUnlocked(1, [], regionCatalog[0])).toBe(true);
    expect(regionUnlocked(1, [], regionCatalog[1])).toBe(false);
    expect(regionUnlocked(3, [], regionCatalog[1])).toBe(true);
  });

  it("avança uma missão encenada até a conclusão", () => {
    const mission = worldMissions.find((entry) => entry.id === "wolves-at-dusk")!;
    let progress = {};
    for (let index = 0; index < mission.steps.length; index += 1) progress = advanceMission(progress, mission, index === 2);
    expect(progress[mission.id]).toEqual({ stage: mission.steps.length, completed: true });
  });

  it("mantém salas de dungeon determinísticas", () => {
    expect(deterministicDungeonRoom("forest", 2)).toEqual(deterministicDungeonRoom("forest", 2));
    expect(deterministicDungeonRoom("forest", 2).label).toBe("Passagem lacrada");
  });

  it("altera as táticas dos chefes regionais em cada fase", () => {
    expect(regionalBossDirective("volcano", .8)).toMatchObject({ phase: "opening", damageMultiplier: 1 });
    expect(regionalBossDirective("volcano", .5)).toMatchObject({ phase: "breaking", intent: "Ruptura territorial", damageMultiplier: 1.18 });
    expect(regionalBossDirective("volcano", .2)).toMatchObject({ phase: "final", intent: "Golpe de execução", damageMultiplier: 1.35 });
  });

  it("libera a oferta de facção quando o favor necessário é alcançado", () => {
    expect(factionRewardUnlocked(7)).toBe(false);
    expect(factionRewardUnlocked(8)).toBe(true);
  });

  it("exige a conclusão da dungeon antes da etapa de exploração regional", () => {
    expect(missionDungeonSatisfied([], "Caverna dos Goblins")).toBe(false);
    expect(missionDungeonSatisfied(["Caverna dos Goblins"], "Caverna dos Goblins")).toBe(true);
  });

  it("só avança a etapa regional depois que a dungeon foi concluída", () => {
    const mission = worldMissions.find((entry) => entry.id === "wolves-at-dusk")!;
    const progress = { [mission.id]: { stage: 1, completed: false } };
    expect(advanceMissionAfterDungeon(progress, mission, [], "Caverna dos Goblins")).toEqual(progress);
    expect(advanceMissionAfterDungeon(progress, mission, ["Caverna dos Goblins"], "Caverna dos Goblins")[mission.id]).toEqual({ stage: 2, completed: false });
  });

  it("mantém a ameaça nos dados da missão, independente da ordem do quadro", () => {
    const legendary = worldMissions.find((entry) => entry.id === "dragon-legacy")!;
    const daily = worldMissions.find((entry) => entry.id === "daily-bounty")!;
    expect(missionThreatLabel(legendary)).toBe("EXTREMA");
    expect(missionThreatLabel(daily)).toBe("BAIXA");
  });
});
