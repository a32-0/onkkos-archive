import { collectibleStepPlan, stepPlan, type Part } from "@/domain/catalog/checks";
import { collectibleView } from "@/domain/catalog/collectibles";
import type { CatalogData } from "@/domain/catalog/data";
import { dossier } from "@/domain/catalog/dossier";
import type { CatalogItem } from "@/domain/catalog/items";
import { releasesSince, type ArsenalShelf, type CollectionShelf } from "@/domain/catalog/releases";
import { briefOf } from "@/domain/catalog/summary";
import type { PlaceView } from "@/domain/place/build";
import { itemGaps, type Reach, type ReachGap } from "@/domain/place/reach";

type NewGroupName = ArsenalShelf | CollectionShelf;

interface NewTile {
  name: string;
  art: string | null;
  reading: Part[];
  where: Part[];
}

export interface Beyond {
  count: number;
  kinds: ReachGap["kind"][];
  need: number | null;
  have: number | null;
  junction: { from: string; to: string } | null;
}

export interface NewGroup {
  group: NewGroupName;
  count: number;
  tiles: NewTile[];
  beyond: Beyond | null;
}

export interface WhatsNew {
  arsenal: NewGroup[];
  collection: NewGroup[];
}

export interface WhatsNewSources {
  data: CatalogData;
  places: ReadonlySet<string>;
  bestPlaces: ReadonlyMap<string, string>;
  reach: Reach;
  now: number;
}

interface Candidate {
  tile: NewTile;
  gaps: ReachGap[];
}

const NO_PARTS: Part[] = [];

const placeCache = new WeakMap<ReadonlyMap<string, PlaceView>, Map<string, string>>();

export function bestPlaces(index: ReadonlyMap<string, PlaceView>): ReadonlyMap<string, string> {
  const cached = placeCache.get(index);
  if (cached) return cached;
  const best = new Map<string, { place: string; chance: number }>();
  for (const view of index.values()) {
    for (const item of view.items) {
      const chance = Math.max(-1, ...item.routes.map((route) => route.chance ?? 0));
      const held = best.get(item.name);
      if (!held || chance > held.chance) best.set(item.name, { place: view.place, chance });
    }
  }
  const found = new Map([...best].map(([name, { place }]) => [name, place]));
  placeCache.set(index, found);
  return found;
}

function firstLine(parts: ReturnType<typeof briefOf>): { reading: Part[]; where: Part[] } {
  const line = parts[0]?.lines[0];
  return { reading: line?.reading ?? NO_PARTS, where: line?.where ?? NO_PARTS };
}

function arsenalCandidate(
  sources: WhatsNewSources,
  item: CatalogItem,
  masteryRank: number | undefined,
): Candidate {
  const { data, bestPlaces: places, reach, now } = sources;
  const plan = stepPlan(data, dossier(item, data.arsenal), { now, masteryRank });
  return {
    tile: { name: item.name, art: item.imageUrl, ...firstLine(briefOf(plan)) },
    gaps: itemGaps(reach, { masteryReq: item.masteryReq, place: places.get(item.name) ?? null }),
  };
}

function collectionCandidate(
  sources: WhatsNewSources,
  name: string,
  art: string | null,
): Candidate {
  const { data, places, bestPlaces: best, reach, now } = sources;
  const collectible = data.collectibles.get(name);
  if (!collectible) {
    return {
      tile: { name, art, reading: NO_PARTS, where: NO_PARTS },
      gaps: itemGaps(reach, { masteryReq: 0, place: best.get(name) ?? null }),
    };
  }
  const view = collectibleView(data, collectible, places, reach.places ?? places);
  const place = view.routes[0]?.place ?? best.get(name) ?? null;
  return {
    tile: { name, art, ...firstLine(briefOf(collectibleStepPlan(data, view, { now }))) },
    gaps: itemGaps(reach, { masteryReq: 0, place }),
  };
}

function beyondOf(gapped: readonly ReachGap[][]): Beyond | null {
  if (gapped.length === 0) return null;
  const all = gapped.flat();
  const ranks = all.flatMap((gap) => (gap.kind === "rank" ? [gap] : []));
  const junction = all.find((gap) => gap.kind === "junction");
  return {
    count: gapped.length,
    kinds: [...new Set(all.map((gap) => gap.kind))],
    need: ranks.length > 0 ? Math.min(...ranks.map((gap) => gap.need)) : null,
    have: ranks[0]?.have ?? null,
    junction: junction ? { from: junction.from, to: junction.to } : null,
  };
}

function groupOf(group: NewGroupName, candidates: readonly Candidate[]): NewGroup {
  return {
    group,
    count: candidates.length,
    tiles: candidates.filter((one) => one.gaps.length === 0).map((one) => one.tile),
    beyond: beyondOf(candidates.filter((one) => one.gaps.length > 0).map((one) => one.gaps)),
  };
}

export function whatsNew(sources: WhatsNewSources, since: string): WhatsNew {
  const releases = releasesSince(sources.data, since, sources.places, null);
  const masteryRank = sources.reach.rank ?? undefined;
  return {
    arsenal: releases.groups.map(({ group, items }) =>
      groupOf(
        group,
        items.map(({ item }) => arsenalCandidate(sources, item, masteryRank)),
      ),
    ),
    collection: releases.collection.map(({ group, items }) =>
      groupOf(
        group,
        items.map((item) => collectionCandidate(sources, item.name, item.imageUrl)),
      ),
    ),
  };
}
