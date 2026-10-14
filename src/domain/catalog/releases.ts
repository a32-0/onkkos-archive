import { classify, type Gate } from "@/domain/catalog/acquisition";
import type { CatalogData } from "@/domain/catalog/data";
import type { CatalogItem } from "@/domain/catalog/items";

export const ARSENAL_SHELVES = ["warframes", "weapons", "companions", "vehicles"] as const;
const COLLECTION_SHELVES = [
  "resources",
  "relics",
  "mods",
  "arcanes",
  "incarnons",
  "ephemera",
  "honoria",
] as const;

type ArsenalShelf = (typeof ARSENAL_SHELVES)[number];
type CollectionShelf = (typeof COLLECTION_SHELVES)[number];

interface ReleasedItem {
  item: CatalogItem;
  gate: Gate;
  owned: boolean | null;
}

interface ReleasedGroup {
  group: ArsenalShelf;
  items: ReleasedItem[];
}

interface CollectedItem {
  name: string;
  imageUrl: string | null;
  releaseDate: string;
  kind: string;
}

interface CollectedGroup {
  group: CollectionShelf;
  items: CollectedItem[];
}

interface Releases {
  since: string;
  groups: ReleasedGroup[];
  collection: CollectedGroup[];
  total: number;
  owned: number;
  ownedReadable: boolean;
  undated: number;
  newest: string | null;
}

export function shelfOf(item: CatalogItem): ArsenalShelf {
  if (item.kind === "Necramech" || item.slot === "Archwing") return "vehicles";
  if (item.group === "Warframes") return "warframes";
  if (item.group === "Companions") return "companions";
  return "weapons";
}

function newestFirst<T>(items: T[], date: (one: T) => string, name: (one: T) => string): T[] {
  return items.sort((a, b) => date(b).localeCompare(date(a)) || name(a).localeCompare(name(b)));
}

function collectionSince(data: CatalogData, since: string): CollectedGroup[] {
  const fresh = data.arsenal.filter(
    (item) => item.isPrime && item.releaseDate !== null && item.releaseDate.slice(0, 7) > since,
  );
  const buckets = new Map<CollectionShelf, CollectedItem[]>();
  const add = (group: CollectionShelf, entry: CollectedItem) => {
    const bucket = buckets.get(group) ?? [];
    bucket.push(entry);
    buckets.set(group, bucket);
  };

  for (const collectible of data.collectibles.values()) {
    if (collectible.group === "mods" || collectible.group === "arcanes") {
      const date = collectible.releaseDate;
      if (date === null || date.slice(0, 7) <= since) continue;
      add(collectible.group, {
        name: collectible.name,
        imageUrl: collectible.imageUrl,
        releaseDate: date,
        kind: collectible.kind,
      });
    }
    const relic = collectible.relic;
    if (relic === null || relic.vaulted) continue;
    const brought = fresh.find((item) =>
      relic.rewards.some((reward) => reward.name.startsWith(`${item.name} `)),
    );
    if (!brought?.releaseDate) continue;
    add("relics", {
      name: relic.name,
      imageUrl: relic.imageUrl,
      releaseDate: brought.releaseDate,
      kind: brought.name,
    });
  }

  return COLLECTION_SHELVES.flatMap((group) => {
    const items = buckets.get(group);
    if (!items || items.length === 0) return [];
    return [
      {
        group,
        items: newestFirst(
          items,
          (one) => one.releaseDate,
          (one) => one.name,
        ),
      },
    ];
  });
}

export function releasesSince(
  data: CatalogData,
  since: string,
  known: ReadonlySet<string>,
  owned: ReadonlySet<string> | null,
): Releases {
  const buckets = new Map<ArsenalShelf, ReleasedItem[]>();
  let undated = 0;
  let total = 0;
  let ownedCount = 0;
  let newest: string | null = null;

  for (const item of data.arsenal) {
    if (item.releaseDate === null) {
      undated += 1;
      continue;
    }
    if (item.releaseDate.slice(0, 7) <= since) continue;

    const entry: ReleasedItem = {
      item,
      gate: classify(item, known, null),
      owned: owned === null ? null : owned.has(item.uniqueName),
    };
    const shelf = shelfOf(item);
    const bucket = buckets.get(shelf) ?? [];
    bucket.push(entry);
    buckets.set(shelf, bucket);

    total += 1;
    if (entry.owned === true) ownedCount += 1;
    if (newest === null || item.releaseDate > newest) newest = item.releaseDate;
  }

  const groups = ARSENAL_SHELVES.flatMap((group) => {
    const items = buckets.get(group);
    if (!items || items.length === 0) return [];
    return [
      {
        group,
        items: newestFirst(
          items,
          (one) => one.item.releaseDate ?? "",
          (one) => one.item.name,
        ),
      },
    ];
  });

  return {
    since,
    groups,
    collection: collectionSince(data, since),
    total,
    owned: ownedCount,
    ownedReadable: owned !== null,
    undated,
    newest,
  };
}
