import type { Graph } from "@/domain/graph/schema";
import { findFocus, findNextPlanet } from "@/domain/graph/star-chart";
import type { PlaceView } from "@/domain/place/build";
import type { SystemEntry } from "@/domain/place/schema";
import { completionOf, type itemRanks } from "@/domain/place/state";
import type { RawProfile } from "@/domain/types/profile";

export interface PlaceRef {
  system: string;
  place: string;
}

export function startHere(
  graph: Graph,
  profile: RawProfile,
  systems: readonly SystemEntry[],
  index: ReadonlyMap<string, PlaceView>,
  ranks: ReturnType<typeof itemRanks>,
): PlaceRef | null {
  const at = (place: string): PlaceRef | null => {
    const system = systems.find((entry) => entry.places.includes(place));
    return system ? { system: system.id, place } : null;
  };

  const frontier = findNextPlanet(graph, profile).entry;
  if (frontier) return at(frontier.planet);

  const shares = systems
    .filter((system) => system.released)
    .flatMap((system) =>
      system.places.map((place) => {
        const { done, readable } = completionOf(index.get(place)?.items ?? [], ranks);
        return { place, system: system.id, readable, mastered: done };
      }),
    );
  const focus = findFocus(
    graph,
    shares,
    systems.map((system) => system.id),
  );
  return focus ? at(focus) : null;
}

export function firstPlace(systems: readonly SystemEntry[]): PlaceRef | null {
  const origin = systems[0];
  const place = origin?.places[0];
  return origin && place ? { system: origin.id, place } : null;
}
