import type { Part } from "@/domain/catalog/checks";
import type { PlaceItem, PlaceView } from "@/domain/place/build";
import type { Catalog, Group } from "@/domain/place/catalog";
import { placeGap, rankGap, systemInReach, type Reach, type ReachGap } from "@/domain/place/reach";
import type { SystemEntry } from "@/domain/place/schema";
import {
  completionOf,
  isComplete,
  stateOf,
  type ItemState,
  type itemRanks,
} from "@/domain/place/state";
import { tileFor } from "@/domain/place/tile";

type Ranks = ReturnType<typeof itemRanks>;

const MAP_GROUPS: readonly { catalog: Catalog; groups: readonly Group[] }[] = [
  {
    catalog: "arsenal",
    groups: [
      "warframes",
      "primary",
      "secondary",
      "melee",
      "archgun",
      "archmelee",
      "amp",
      "companion",
      "necramech",
      "archwing",
      "railjack",
    ],
  },
  {
    catalog: "collection",
    groups: ["resources", "relics", "mods", "arcanes", "incarnons", "ephemera", "honoria"],
  },
];

interface ItemLine {
  reading: Part[];
  where: Part[];
}

interface TileRoute {
  runs: number | null;
  rotation: string | null;
  chance: number | null;
  node: string | null;
  mission: string | null;
}

export interface MapTile {
  name: string;
  art: string | null;
  state: ItemState;
  left: boolean;
  mastered: boolean;
  fresh: boolean;
  need: number | null;
  route: TileRoute | null;
  line: ItemLine | null;
  from: string | null;
}

export interface MapGroup {
  group: Group;
  tiles: MapTile[];
  fresh: number;
}

export interface PlaceMap {
  system: SystemEntry;
  place: string;
  done: number;
  readable: number;
  mastered: boolean;
  rank: number | null;
  sections: { catalog: Catalog; groups: MapGroup[] }[];
  nothingLeft: boolean;
}

export interface MapInput {
  system: SystemEntry;
  place: string;
  view: PlaceView | null;
  ranks: Ranks;
  reach: Reach;
  since: string | null;
  lineOf: (name: string) => ItemLine;
  masteryReqOf: (name: string) => number;
}

function isFresh(item: PlaceItem, since: string | null): boolean {
  return since !== null && item.releaseDate !== null && item.releaseDate.slice(0, 7) > since;
}

function routeOf(item: PlaceItem): TileRoute | null {
  if (item.routes.length === 0) return null;
  const reading = tileFor(item);
  return {
    runs: reading.runs,
    rotation: reading.rotation,
    chance: item.routes[0]?.chance ?? null,
    node: reading.node,
    mission: reading.mission,
  };
}

function tileOf(input: MapInput, item: PlaceItem, whole: boolean): MapTile {
  const state = stateOf(item, input.ranks);
  const route = routeOf(item);
  const gap = whole ? null : rankGap(input.reach, input.masteryReqOf(item.name));
  return {
    name: item.name,
    art: item.imageUrl,
    state,
    left: state.kind !== "done",
    mastered: state.kind === "done",
    fresh: isFresh(item, input.since),
    need: gap?.kind === "rank" ? gap.need : null,
    route,
    line: route ? null : input.lineOf(item.name),
    from: item.from,
  };
}

export function placeMap(input: MapInput): PlaceMap {
  const items = input.view?.items ?? [];
  const whole = placeGap(input.reach, input.place) !== null;
  const byGroup = new Map<Group, MapTile[]>();
  for (const item of items) {
    const tiles = byGroup.get(item.group) ?? [];
    tiles.push(tileOf(input, item, whole));
    byGroup.set(item.group, tiles);
  }
  const sections = MAP_GROUPS.map(({ catalog, groups }) => ({
    catalog,
    groups: groups.flatMap((group) => {
      const tiles = byGroup.get(group);
      if (!tiles || tiles.length === 0) return [];
      return [{ group, tiles, fresh: tiles.filter((tile) => tile.fresh).length }];
    }),
  })).filter((section) => section.groups.length > 0);
  const completion = completionOf(items, input.ranks);
  return {
    system: input.system,
    place: input.place,
    done: completion.done,
    readable: completion.readable,
    mastered: isComplete(completion),
    rank: whole ? null : input.reach.rank,
    sections,
    nothingLeft: sections.every((section) =>
      section.groups.every((group) => group.tiles.every((tile) => !tile.left)),
    ),
  };
}

export interface PlaceStanding {
  place: string;
  done: number;
  readable: number;
  mastered: boolean;
  fresh: boolean;
  gap: ReachGap | null;
}

export interface SystemStanding {
  system: SystemEntry;
  places: PlaceStanding[];
  done: number;
  readable: number;
  mastered: boolean;
  inReach: boolean;
}

export function systemStandings(
  systems: readonly SystemEntry[],
  index: ReadonlyMap<string, PlaceView>,
  ranks: Ranks,
  reach: Reach,
  since: string | null,
): SystemStanding[] {
  return systems.map((system) => {
    const places = system.places.map((place) => {
      const items = index.get(place)?.items ?? [];
      const completion = completionOf(items, ranks);
      return {
        place,
        done: completion.done,
        readable: completion.readable,
        mastered: isComplete(completion),
        fresh: items.some((item) => isFresh(item, since)),
        gap: placeGap(reach, place),
      };
    });
    const done = places.reduce((sum, place) => sum + place.done, 0);
    const readable = places.reduce((sum, place) => sum + place.readable, 0);
    return {
      system,
      places,
      done,
      readable,
      mastered: readable > 0 && done === readable,
      inReach: systemInReach(reach, system),
    };
  });
}
