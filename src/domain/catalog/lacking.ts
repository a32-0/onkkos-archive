import type { CatalogItem } from "@/domain/catalog/items";
import type { RawProfile } from "@/domain/types/profile";

export interface Lacking {
  owned: CatalogItem[];
  lacking: CatalogItem[];
}

export function lackingNamed(
  arsenal: readonly CatalogItem[],
  profile: RawProfile,
  prefix: string,
): Lacking {
  const xpInfo = profile.LoadOutInventory?.XPInfo;
  const owned = new Set(Array.isArray(xpInfo) ? xpInfo.map((entry) => entry.ItemType) : []);
  const named = arsenal.filter((item) => item.name.startsWith(prefix));
  return {
    owned: named.filter((item) => owned.has(item.uniqueName)),
    lacking: named
      .filter((item) => !owned.has(item.uniqueName))
      .sort(
        (a, b) =>
          (a.releaseDate ?? "").localeCompare(b.releaseDate ?? "") || a.name.localeCompare(b.name),
      ),
  };
}
