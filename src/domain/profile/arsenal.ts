import { catalogByUniqueName, type CatalogItem } from "@/domain/catalog/items";
import { rankFromXp } from "@/domain/catalog/mastery";
import type { RawProfile } from "@/domain/types/profile";

interface OwnedItem {
  item: CatalogItem;
  rank: number;
  maxed: boolean;
}

type OwnedArsenal = { readable: false } | { readable: true; items: OwnedItem[]; maxed: number };

export function ownedArsenal(profile: RawProfile, catalog: CatalogItem[]): OwnedArsenal {
  const xpInfo = profile.LoadOutInventory?.XPInfo;
  if (!Array.isArray(xpInfo) || xpInfo.length === 0) return { readable: false };

  const byUniqueName = catalogByUniqueName(catalog);
  const items: OwnedItem[] = [];

  for (const entry of xpInfo) {
    const item = byUniqueName.get(entry.ItemType);
    if (!item) continue;
    const rank = rankFromXp(entry.XP ?? 0, item.affinityFactor, item.maxRank);
    items.push({ item, rank, maxed: rank >= item.maxRank });
  }

  items.sort((a, b) => a.rank - b.rank || a.item.name.localeCompare(b.item.name));
  return { readable: true, items, maxed: items.filter((i) => i.maxed).length };
}
