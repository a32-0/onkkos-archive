import "server-only";

import Items from "@wfcd/items";

import {
  ARSENAL_SOURCES,
  buildArsenalCatalog,
  type CatalogItem,
  type RawItem,
} from "@/domain/catalog/items";

let cached: CatalogItem[] | undefined;

export function arsenalCatalog(): CatalogItem[] {
  if (!cached) {
    const raw = new Items({
      category: ARSENAL_SOURCES,
      ignoreEnemies: true,
    } as ConstructorParameters<typeof Items>[0]) as unknown as RawItem[];
    cached = buildArsenalCatalog(raw);
  }
  return cached;
}
