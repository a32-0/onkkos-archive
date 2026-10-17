import { BRIEF, briefLine } from "@/content/checks";
import { REACH } from "@/content/reach";
import { MAP } from "@/content/system";
import type {
  MapGroup,
  MapTile,
  PlaceMap,
  PlaceStanding,
  SystemStanding,
} from "@/domain/place/map";
import type { ReachGap } from "@/domain/place/reach";
import type { PlaceRef } from "@/domain/place/start-here";
import { itemRoute, placeRoute } from "@/routes";

import { tileLines } from "../summary/lines";
import type {
  MapGroupView,
  MapTileView,
  MapView,
  PlaceListSystem,
  PlaceRowView,
  SystemRowView,
} from "./state";

const FROM = "navigation";

type Art = Readonly<Record<string, string>>;

export interface MapViewInput {
  map: PlaceMap;
  standings: readonly SystemStanding[];
  start: PlaceRef | null;
  since: string | null;
  icons: Art;
  orbs: Art;
}

function tileWords(tile: MapTile): { reading: string; place: string } {
  if (tile.route) {
    const { runs, rotation, chance, node, mission } = tile.route;
    return {
      reading: BRIEF.oddsBrief({ runs, rotation, stage: null, chance }) ?? "",
      place: briefLine([node, mission]),
    };
  }
  const words = tileLines(tile.line?.reading ?? [], tile.line?.where ?? []);
  return { reading: words.reading, place: words.place || (tile.from ?? "") };
}

function tileView(tile: MapTile): MapTileView {
  const { state } = tile;
  return {
    name: tile.name,
    href: itemRoute(tile.name, FROM),
    art: tile.art,
    ...tileWords(tile),
    ...(state.kind === "done" && { state: { kind: "mastered", label: MAP.mastered } }),
    ...(state.kind === "ranked" && {
      state: { kind: "rank", label: MAP.rank(state.rank, state.max) },
    }),
    left: tile.left,
    mastered: tile.mastered,
    fresh: tile.fresh,
    beyond: tile.need !== null,
  };
}

function moreLine(group: MapGroup, have: number | null, shown: (tile: MapTile) => boolean) {
  const needs = group.tiles.flatMap((tile) =>
    shown(tile) && tile.need !== null ? [tile.need] : [],
  );
  if (needs.length === 0 || have === null) return null;
  return REACH.rank(needs.length, MAP.groups[group.group], Math.min(...needs), have);
}

function groupView(group: MapGroup, map: PlaceMap, input: MapViewInput): MapGroupView {
  return {
    id: `map-${group.group}`,
    name: MAP.groups[group.group].name,
    icon: input.icons[group.group] ?? null,
    ...(input.since !== null && group.fresh > 0 && { count: MAP.count(group.fresh) }),
    tiles: group.tiles.map(tileView),
    more: {
      left: moreLine(group, map.rank, (tile) => tile.left),
      fresh: moreLine(group, map.rank, (tile) => tile.fresh),
    },
  };
}

function fraction(done: number, readable: number): { count: string; label: string } {
  return { count: MAP.fraction(done, readable), label: MAP.mastered };
}

function gapWords(gap: ReachGap | null): string | undefined {
  if (gap?.kind === "junction") return MAP.junctionGap(gap.from, gap.to);
  if (gap?.kind === "clan") return MAP.clanGap;
  return undefined;
}

function placeRow(
  standing: PlaceStanding,
  system: string,
  input: MapViewInput,
  onView: boolean,
): PlaceRowView {
  const gap = gapWords(standing.gap);
  return {
    name: standing.place,
    href: placeRoute(system, standing.place),
    art: input.orbs[standing.place] ?? null,
    ...(standing.mastered
      ? { mastered: MAP.mastered }
      : standing.readable > 0 && { count: fraction(standing.done, standing.readable) }),
    ...(isStartAt(input.start, system, standing.place) && { startHere: MAP.startHere }),
    ...(input.since !== null && standing.fresh && { isNew: MAP.new }),
    ...(gap && { gap }),
    listed: standing.gap === null || onView,
    onView,
  };
}

function isStartAt(start: PlaceRef | null, system: string, place?: string): boolean {
  if (!start || start.system !== system) return false;
  return place === undefined || start.place === place;
}

function moreFor(standings: readonly PlaceStanding[], onView: string | null): string[] {
  const beyond = standings.filter((one) => one.gap !== null && one.place !== onView);
  const junction = beyond.flatMap((one) => (one.gap?.kind === "junction" ? [one.gap] : []));
  const lines: string[] = [];
  const next = junction[0];
  if (next) lines.push(MAP.morePlaces(junction.length, next.from, next.to));
  if (beyond.some((one) => one.gap?.kind === "clan")) lines.push(MAP.moreDojo);
  return lines;
}

function placeList(input: MapViewInput): PlaceListSystem[] {
  const { map } = input;
  return input.standings
    .filter((standing) => standing.system.released)
    .map((standing) => {
      const here = standing.system.id === map.system.id;
      const onView = here ? map.place : null;
      return {
        id: standing.system.id,
        name: standing.system.name,
        art: input.orbs[standing.system.places[0] ?? ""] ?? null,
        rows: standing.places.map((place) =>
          placeRow(place, standing.system.id, input, place.place === onView),
        ),
        more: moreFor(standing.places, onView),
      };
    });
}

function systemRow(standing: SystemStanding, input: MapViewInput): SystemRowView {
  const { system } = standing;
  const [first, second] = system.places;
  const satellite = second ? input.orbs[second] : undefined;
  return {
    id: system.id,
    name: system.name,
    art: first ? (input.orbs[first] ?? null) : null,
    ...(satellite && { satellite }),
    ...(!system.released
      ? { soon: MAP.soon }
      : standing.mastered
        ? { mastered: MAP.mastered }
        : standing.readable > 0 && { count: fraction(standing.done, standing.readable) }),
    ...(isStartAt(input.start, system.id) && { startHere: MAP.startHere }),
    onView: system.id === input.map.system.id,
  };
}

export function mapView(input: MapViewInput): MapView {
  const { map } = input;
  const listed = input.standings.filter(
    (standing) =>
      !standing.system.released || standing.inReach || standing.system.id === map.system.id,
  );
  const hidden = input.standings.length - listed.length;
  return {
    card: {
      system: map.system.name,
      name: map.place,
      art: input.orbs[map.place] ?? null,
      ...(map.nodes &&
        map.nodes.total > 0 && {
          nodes: {
            title: MAP.nodes,
            lines: [
              { count: MAP.fraction(map.nodes.done, map.nodes.total), label: MAP.normal },
              { count: MAP.fraction(map.nodes.steelPath, map.nodes.total), label: MAP.steelPath },
            ],
          },
        }),
      items: { count: MAP.fraction(map.done, map.readable), label: MAP.items, word: MAP.mastered },
      ...(map.mastered && { mastered: MAP.mastered }),
      progress: { value: map.done, max: map.readable, label: MAP.progress(map.place) },
    },
    newLens: input.since !== null,
    nothingLeft: map.nothingLeft
      ? { title: MAP.nothingLeft(map.place), line: MAP.nothingLeftLine }
      : null,
    sections: map.sections.map((section) => ({
      id: section.catalog,
      label: section.catalog === "arsenal" ? MAP.arsenal : MAP.collection,
      groups: section.groups.map((group) => groupView(group, map, input)),
    })),
    system: map.system.id,
    places: placeList(input),
    systems: listed.map((standing) => systemRow(standing, input)),
    moreSystems: hidden > 0 ? MAP.moreSystems(hidden) : null,
  };
}
