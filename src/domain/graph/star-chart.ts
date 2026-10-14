import type { Graph, StarChartEntry } from "@/domain/graph/schema";
import type { RawProfile } from "@/domain/types/profile";

interface NextPlanetResult {
  entry: StarChartEntry | null;
  unlocked: string[];
  junctionsCompleted: number;
  junctionsTotal: number;
}

type PlanetStatus = "start" | "done" | "next" | "ahead";

interface PlanetProgress extends StarChartEntry {
  status: PlanetStatus;
}

export interface PlaceShare {
  place: string;
  system: string;
  readable: number;
  mastered: number;
}

const JUNCTION_TAG_RE = /^(.+?)To(.+?)Junction$/;

export function missionTags(profile: RawProfile): Set<string> {
  const missions = profile.Missions;
  if (!Array.isArray(missions)) return new Set();
  return new Set(
    missions.map((mission) => mission?.Tag).filter((tag): tag is string => typeof tag === "string"),
  );
}

export function findNextPlanet(graph: Graph, profile: RawProfile): NextPlanetResult {
  const tags = missionTags(profile);
  const unlocked: string[] = [];
  const junctionsTotal = graph.starChartOrder.filter((entry) => entry.junctionTag !== null).length;
  let junctionsCompleted = 0;

  for (const entry of graph.starChartOrder) {
    if (entry.junctionTag === null) {
      unlocked.push(entry.planet);
      continue;
    }
    if (tags.has(entry.junctionTag)) {
      unlocked.push(entry.planet);
      junctionsCompleted += 1;
      continue;
    }
    return { entry, unlocked, junctionsCompleted, junctionsTotal };
  }

  return { entry: null, unlocked, junctionsCompleted, junctionsTotal };
}

export function findFocus(
  graph: Graph,
  shares: readonly PlaceShare[],
  systemOrder: readonly string[],
): string | null {
  const candidates = shares.filter(
    (share) =>
      share.readable > 0 && share.mastered < share.readable && onTheChart(graph, share.place),
  );
  const rank = (share: PlaceShare): [number, number] => [
    systemRank(share.system, systemOrder),
    chartRank(graph, share.place),
  ];
  let best: PlaceShare | null = null;
  for (const share of candidates) {
    if (!best) {
      best = share;
      continue;
    }
    const byShare = share.mastered * best.readable - best.mastered * share.readable;
    if (byShare > 0) {
      best = share;
      continue;
    }
    if (byShare < 0) continue;
    const [system, chart] = rank(share);
    const [bestSystem, bestChart] = rank(best);
    if (system < bestSystem || (system === bestSystem && chart < bestChart)) best = share;
  }
  return best?.place ?? null;
}

export function asksWhenLastPlayed(graph: Graph, profile: RawProfile): boolean {
  if (!Array.isArray(profile.Missions)) return true;
  const second = graph.starChartOrder[1];
  if (!second || second.junctionTag === null) return true;
  return missionTags(profile).has(second.junctionTag);
}

export function starChartProgress(graph: Graph, profile: RawProfile): PlanetProgress[] {
  const { entry: next, unlocked } = findNextPlanet(graph, profile);
  const done = new Set(unlocked);

  return graph.starChartOrder.map((entry) => {
    if (entry.junctionTag === null) return { ...entry, status: "start" };
    if (done.has(entry.planet)) return { ...entry, status: "done" };
    return { ...entry, status: entry.planet === next?.planet ? "next" : "ahead" };
  });
}

export function reachedPlaces(graph: Graph, profile: RawProfile): Set<string> {
  return new Set(
    starChartProgress(graph, profile)
      .filter((entry) => entry.status !== "ahead")
      .map((entry) => entry.planet),
  );
}

export function junctionOf(tag: string): { from: string; to: string } | null {
  const match = JUNCTION_TAG_RE.exec(tag);
  return match?.[1] && match[2] ? { from: match[1], to: match[2] } : null;
}

function onTheChart(graph: Graph, place: string): boolean {
  return (
    graph.starChartOrder.some((entry) => entry.planet === place) ||
    graph.offChartPlaces.some((entry) => entry.place === place)
  );
}

function systemRank(system: string, systemOrder: readonly string[]): number {
  const index = systemOrder.indexOf(system);
  return index < 0 ? systemOrder.length : index;
}

function chartRank(graph: Graph, place: string): number {
  const chart = graph.starChartOrder.map((entry) => entry.planet);
  const onChart = chart.indexOf(place);
  if (onChart >= 0) return onChart * (graph.offChartPlaces.length + 1);
  const offChart = graph.offChartPlaces.findIndex((entry) => entry.place === place);
  const entry = graph.offChartPlaces[offChart];
  if (!entry) return chart.length * (graph.offChartPlaces.length + 1);
  return chart.indexOf(entry.after) * (graph.offChartPlaces.length + 1) + offChart + 1;
}
