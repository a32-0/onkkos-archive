import type { Collectible, CollectibleGroup } from "@/domain/catalog/collectibles";
import type { CatalogData } from "@/domain/catalog/data";

type SearchGroup = "arsenal" | CollectibleGroup | "places" | "quests";

interface SearchHit {
  kind: "item" | "collectible" | "place" | "quest";
  group: SearchGroup;
  name: string;
  type: string | null;
  family: Collectible["family"];
  vaulted: boolean;
  imageUrl: string | null;
  score: number;
}

interface Entry {
  needle: string;
  hit: Omit<SearchHit, "score">;
}

const MIN_TERM = 2;

const cache = new WeakMap<CatalogData, WeakMap<ReadonlyMap<string, unknown>, Entry[]>>();

export function searchCatalog(
  data: CatalogData,
  places: ReadonlyMap<string, unknown>,
  term: string,
): SearchHit[] {
  const needle = term.trim().toLowerCase();
  if (needle.length < MIN_TERM) return [];

  return index(data, places)
    .map((entry) => ({ entry, score: scoreOf(entry.needle, needle) }))
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.entry.needle.length - b.entry.needle.length ||
        a.entry.needle.localeCompare(b.entry.needle),
    )
    .map((row) => ({ ...row.entry.hit, score: row.score }));
}

function scoreOf(name: string, needle: string): number {
  if (name === needle) return 4;
  if (name.startsWith(needle)) return 3;
  if (name.includes(` ${needle}`)) return 2;
  return name.includes(needle) ? 1 : 0;
}

function index(data: CatalogData, places: ReadonlyMap<string, unknown>): Entry[] {
  let byPlaces = cache.get(data);
  if (!byPlaces) {
    byPlaces = new WeakMap();
    cache.set(data, byPlaces);
  }
  const cached = byPlaces.get(places);
  if (cached) return cached;

  const entries: Entry[] = data.arsenal.map((item) => ({
    needle: item.name.toLowerCase(),
    hit: {
      kind: "item",
      group: "arsenal",
      name: item.name,
      type: item.kind,
      family: null,
      vaulted: false,
      imageUrl: item.imageUrl,
    },
  }));

  for (const entry of data.collectibles.values()) {
    entries.push({
      needle: entry.name.toLowerCase(),
      hit: {
        kind: "collectible",
        group: entry.group,
        name: entry.name,
        type: entry.kind,
        family: entry.family,
        vaulted: entry.relic?.vaulted === true,
        imageUrl: entry.imageUrl,
      },
    });
  }

  for (const quest of data.spine.arcs.flatMap((arc) => arc.quests)) {
    entries.push({
      needle: quest.name.toLowerCase(),
      hit: {
        kind: "quest",
        group: "quests",
        name: quest.name,
        type: null,
        family: null,
        vaulted: false,
        imageUrl: null,
      },
    });
  }

  for (const place of places.keys()) {
    entries.push({
      needle: place.toLowerCase(),
      hit: {
        kind: "place",
        group: "places",
        name: place,
        type: null,
        family: null,
        vaulted: false,
        imageUrl: null,
      },
    });
  }

  byPlaces.set(places, entries);
  return entries;
}
