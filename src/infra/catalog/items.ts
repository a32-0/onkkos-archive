import "server-only";

import Items from "@wfcd/items";

import { glyphArt, GLYPH_SOURCES, type RawGlyph } from "@/domain/profile/avatar";
import { COLLECTIBLE_SOURCES, GEAR_SOURCES, type RawEntry } from "@/domain/catalog/collectibles";
import {
  ARSENAL_SOURCES,
  buildArsenalCatalog,
  buildResourceCatalog,
  RESOURCE_SOURCES,
  type CatalogItem,
  type CatalogResource,
  type RawItem,
} from "@/domain/catalog/items";
import { RELIC_SOURCES, type RawRelic } from "@/domain/catalog/relics";
import type { Introduced } from "@/domain/catalog/updates";

let cached: CatalogItem[] | undefined;
let cachedResources: CatalogResource[] | undefined;
let cachedGlyphs: Map<string, string> | undefined;

function readItems<T>(category?: readonly string[]): T[] {
  return new Items({
    ...(category ? { category: [...category] } : {}),
    ignoreEnemies: true,
  } as ConstructorParameters<typeof Items>[0]) as unknown as T[];
}

export function arsenalCatalog(): CatalogItem[] {
  cached ??= buildArsenalCatalog(readItems<RawItem>(ARSENAL_SOURCES));
  return cached;
}

export function resourceCatalog(): CatalogResource[] {
  cachedResources ??= buildResourceCatalog(readItems<RawItem>(RESOURCE_SOURCES));
  return cachedResources;
}

export function glyphImages(): ReadonlyMap<string, string> {
  cachedGlyphs ??= glyphArt(readItems<RawGlyph>(GLYPH_SOURCES));
  return cachedGlyphs;
}

export function relicEntries(): RawRelic[] {
  return readItems<RawRelic>(RELIC_SOURCES);
}

export function collectibleEntries(): RawEntry[] {
  return readItems<RawEntry>(COLLECTIBLE_SOURCES);
}

export function gearEntries(): RawEntry[] {
  return readItems<RawEntry>(GEAR_SOURCES);
}

export function introducedEntries(): Introduced[] {
  return readItems<Introduced>();
}
