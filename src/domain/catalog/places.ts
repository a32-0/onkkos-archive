import type { Graph } from "@/domain/graph/schema";

export interface Place {
  name: string;
  order: number;
  onChart: boolean;
  junctionTag: string | null;
  unlockedBy: string | null;
}

const ALIASES: Record<string, string> = {
  "Orb Vallis": "Venus",
  "Plains of Eidolon": "Earth",
  "Cambion Drift": "Deimos",
  Cetus: "Earth",
  Fortuna: "Venus",
  Necralisk: "Deimos",
  "Orokin Derelict": "Deimos",
  "Zariman Ten-Zero": "Zariman",
};

export function allPlaces(graph: Graph): Place[] {
  const chart: Place[] = graph.starChartOrder.map((entry, index) => ({
    name: entry.planet,
    order: index * 10,
    onChart: true,
    junctionTag: entry.junctionTag,
    unlockedBy: null,
  }));

  const anchored: Place[] = [];
  for (const extra of graph.offChartPlaces) {
    const anchor = chart.find((place) => place.name === extra.after);
    anchored.push({
      name: extra.place,
      order: (anchor?.order ?? chart.length * 10) + anchored.length + 1,
      onChart: false,
      junctionTag: null,
      unlockedBy: extra.unlockedBy,
    });
  }

  return [...chart, ...anchored].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

function normalizePlace(raw: string, known: ReadonlySet<string>): string | null {
  const trimmed = raw.trim();
  if (known.has(trimmed)) return trimmed;
  const alias = ALIASES[trimmed];
  if (alias && known.has(alias)) return alias;
  return null;
}

export function placeFromLocation(location: string, known: ReadonlySet<string>): string | null {
  const head = location.includes("/") ? location.slice(0, location.indexOf("/")) : location;
  const direct = normalizePlace(head, known);
  if (direct) return direct;
  const afterComma = head.includes(",") ? head.slice(head.lastIndexOf(",") + 1) : null;
  return afterComma ? normalizePlace(afterComma, known) : null;
}
