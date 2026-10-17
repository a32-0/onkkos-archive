import type { CatalogItem } from "@/domain/catalog/items";
import type { RawProfile } from "@/domain/types/profile";

const FIRST = ["Voidrig", "Bonewidow"];

function lead(item: CatalogItem): number {
  const at = FIRST.indexOf(item.name);
  return at === -1 ? FIRST.length : at;
}

export function lackingNecramechs(
  arsenal: readonly CatalogItem[],
  profile: RawProfile,
): CatalogItem[] {
  const xpInfo = profile.LoadOutInventory?.XPInfo;
  const owned = new Set(Array.isArray(xpInfo) ? xpInfo.map((entry) => entry.ItemType) : []);
  return arsenal
    .filter((item) => item.kind === "Necramech" && !owned.has(item.uniqueName))
    .sort(
      (a, b) =>
        lead(a) - lead(b) ||
        (a.releaseDate ?? "").localeCompare(b.releaseDate ?? "") ||
        a.name.localeCompare(b.name),
    );
}
