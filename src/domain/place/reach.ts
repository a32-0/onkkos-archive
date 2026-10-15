import type { Graph } from "@/domain/graph/schema";
import { findNextPlanet, junctionOf, reachedPlaces } from "@/domain/graph/star-chart";
import { DOJO, type SystemEntry } from "@/domain/place/schema";
import type { RawProfile } from "@/domain/types/profile";

export type ReachGap =
  | { kind: "rank"; need: number; have: number }
  | { kind: "junction"; from: string; to: string }
  | { kind: "clan" };

interface Reach {
  places: ReadonlySet<string> | null;
  measured: ReadonlySet<string>;
  junction: { from: string; to: string } | null;
  rank: number | null;
  clan: boolean;
}

export function readReach(graph: Graph, profile: RawProfile): Reach {
  const measured = new Set([
    ...graph.starChartOrder.map((entry) => entry.planet),
    ...graph.offChartPlaces.map((entry) => entry.place),
  ]);
  const rank = typeof profile.PlayerLevel === "number" ? profile.PlayerLevel : null;
  const clan =
    profile.GuildId !== undefined && profile.GuildId !== null && profile.GuildId !== false;

  if (!Array.isArray(profile.Missions)) {
    return { places: null, measured, junction: null, rank, clan };
  }

  const reached = reachedPlaces(graph, profile);
  const places = new Set(reached);
  for (const entry of graph.offChartPlaces) {
    if (reached.has(entry.after)) places.add(entry.place);
  }
  const tag = findNextPlanet(graph, profile).entry?.junctionTag ?? null;
  return { places, measured, junction: tag ? junctionOf(tag) : null, rank, clan };
}

export function placeGap(reach: Reach, place: string): ReachGap | null {
  if (reach.places === null) return null;
  if (place === DOJO) return reach.clan ? null : { kind: "clan" };
  if (!reach.measured.has(place) || reach.places.has(place) || !reach.junction) return null;
  return { kind: "junction", ...reach.junction };
}

export function rankGap(reach: Reach, masteryReq: number): ReachGap | null {
  if (reach.rank === null || reach.rank >= masteryReq) return null;
  return { kind: "rank", need: masteryReq, have: reach.rank };
}

export function itemGaps(
  reach: Reach,
  item: { masteryReq: number; place: string | null },
): ReachGap[] {
  const gaps = [rankGap(reach, item.masteryReq), item.place ? placeGap(reach, item.place) : null];
  return gaps.filter((gap): gap is ReachGap => gap !== null);
}

export function systemInReach(reach: Reach, system: SystemEntry): boolean {
  return system.released && system.places.some((place) => placeGap(reach, place) === null);
}
