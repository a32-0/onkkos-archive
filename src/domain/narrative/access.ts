import type { Graph } from "@/domain/graph/schema";
import { missionTags } from "@/domain/graph/star-chart";
import type { Quest } from "@/domain/narrative/schema";
import { regionsPlayed } from "@/domain/profile/nodes";
import type { RawProfile } from "@/domain/types/profile";

export interface QuestAccess {
  planets: string[];
  reached: boolean;
  missing: string[];
}

export function questAccess(quest: Quest, profile: RawProfile, graph: Graph): QuestAccess | null {
  if (quest.availableAt.length === 0 || !Array.isArray(profile.Missions)) return null;
  const tags = missionTags(profile);
  const regions = regionsPlayed(profile);
  const missing = quest.availableAt.filter(
    (planet) => !planetReached(planet, tags, regions, graph),
  );
  return { planets: quest.availableAt, reached: missing.length === 0, missing };
}

function planetReached(
  planet: string,
  tags: Set<string>,
  regions: Set<string>,
  graph: Graph,
): boolean {
  const entry = graph.starChartOrder.find((e) => e.planet === planet);
  if (entry && entry.junctionTag === null) return true;
  if (entry?.junctionTag && tags.has(entry.junctionTag)) return true;
  return regions.has(planet);
}
