import { BRIEF, briefLine } from "@/content/checks";
import { shortName } from "@/content/names";
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
import type { PlaceOverviewKind } from "@/ui/PlaceOverview/PlaceOverview";

import { tileLines } from "../summary/lines";
import type {
  MapGroupView,
  MapTileView,
  MapView,
  PlaceListSystem,
  PlaceRowView,
  SystemRowView,
} from "./state";
import { GROUP_SYMBOLS } from "./symbols";

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

function tileView(tile: MapTile, group: string): MapTileView {
  const { state } = tile;
  const words = tileWords(tile);
  return {
    name: shortName(tile.name, group),
    href: itemRoute(tile.name, FROM),
    art: tile.art,
    reading: words.reading,
    place:
      state.kind === "ranked"
        ? briefLine([MAP.rank(state.rank, state.max), words.place])
        : words.place,
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

function groupView(
  group: MapGroup,
  map: PlaceMap,
  input: MapViewInput,
  ranked: boolean,
): MapGroupView {
  return {
    id: `map-${group.group}`,
    key: group.group,
    lenses: ranked,
    name: MAP.groups[group.group].name,
    icon: input.icons[group.group] ?? null,
    ...(GROUP_SYMBOLS[group.group] && { symbol: GROUP_SYMBOLS[group.group] }),
    tiles: group.tiles.map((tile) => tileView(tile, group.group)),
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
    orb: input.orbs[standing.place] ?? null,
    ...(standing.mastered
      ? { mastered: MAP.mastered }
      : standing.readable > 0 && { count: fraction(standing.done, standing.readable) }),
    ...(isStartAt(input.start, system, standing.place) && { startHere: MAP.startHere }),
    ...(input.since !== null && standing.fresh && { isNew: MAP.newItems }),
    ...(gap && { gap }),
    listed: standing.gap === null || onView,
    onView,
  };
}

function isStartAt(start: PlaceRef | null, system: string, place?: string): boolean {
  if (!start || start.system !== system) return false;
  return place === undefined || start.place === place;
}

function moreFor(standings: readonly PlaceStanding[], onView: string | null): string | null {
  const beyond = standings.filter((one) => one.gap !== null && one.place !== onView);
  if (beyond.length === 0) return null;
  const next = beyond.flatMap((one) => (one.gap?.kind === "junction" ? [one.gap] : []))[0];
  const clan = beyond.some((one) => one.gap?.kind === "clan");
  return MAP.morePlaces(beyond.length, next ? { from: next.from, to: next.to } : null, clan);
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
        orb: input.orbs[standing.system.places[0] ?? ""] ?? null,
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
  const places = standing.places.filter((place) => place.readable > 0);
  const done = places.filter((place) => place.mastered).length;
  return {
    id: system.id,
    name: system.name,
    orb: first ? (input.orbs[first] ?? null) : null,
    satellite: second ? (input.orbs[second] ?? null) : null,
    ...(!system.released
      ? { soon: MAP.soon }
      : standing.mastered
        ? { mastered: MAP.mastered }
        : places.length > 0 && { count: fraction(done, places.length) }),
    ...(isStartAt(input.start, system.id) && { startHere: MAP.startHere }),
    onView: system.id === input.map.system.id,
  };
}

function leftByKind(map: PlaceMap, input: MapViewInput): PlaceOverviewKind[] {
  return map.sections
    .filter((section) => section.catalog === "arsenal")
    .flatMap((section) => section.groups)
    .flatMap((group) => {
      const count = group.tiles.filter((tile) => tile.left && tile.need === null).length;
      if (count === 0) return [];
      const symbol = GROUP_SYMBOLS[group.group];
      return [
        {
          name: MAP.groups[group.group].name,
          icon: input.icons[group.group] ?? null,
          ...(symbol && { symbol }),
          count,
        },
      ];
    });
}

export function mapView(input: MapViewInput): MapView {
  const { map } = input;
  const listed = input.standings.filter(
    (standing) =>
      !standing.system.released || standing.inReach || standing.system.id === map.system.id,
  );
  const hidden = input.standings.length - listed.length;
  const kinds = leftByKind(map, input);
  return {
    place: map.place,
    systemName: map.system.name,
    overview: {
      orb: input.orbs[map.place] ?? null,
      done: map.done,
      readable: map.readable,
      count: MAP.fraction(map.done, map.readable),
      label: MAP.itemsMastered,
      progressLabel: MAP.progress(map.place),
      ...(kinds.length > 0 && !map.mastered && { left: { caption: MAP.stillToMaster, kinds } }),
    },
    newLens: input.since !== null,
    nothingLeft: map.nothingLeft
      ? { title: MAP.nothingLeft(map.place), line: MAP.nothingLeftLine }
      : null,
    empty: {
      left: MAP.emptyLens.left(map.place),
      mastered: MAP.emptyLens.mastered(map.place),
      new: MAP.emptyLens.new(map.place),
    },
    sections: map.sections.map((section) => ({
      id: section.catalog,
      label: section.catalog === "arsenal" ? MAP.arsenal : MAP.collection,
      groups: section.groups.map((group) =>
        groupView(group, map, input, section.catalog === "arsenal"),
      ),
    })),
    system: map.system.id,
    places: placeList(input),
    systems: listed.map((standing) => systemRow(standing, input)),
    moreSystems: hidden > 0 ? MAP.moreSystems(hidden) : null,
  };
}
