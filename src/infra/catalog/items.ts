import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

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

interface Snapshot {
  categories: Record<string, unknown[]>;
}

let snapshot: string | undefined;
let cached: CatalogItem[] | undefined;
let cachedResources: CatalogResource[] | undefined;
let cachedGlyphs: Map<string, string> | undefined;

function readSnapshot(): Snapshot {
  snapshot ??= readFileSync(path.join(process.cwd(), "data", "vendor", "items.json"), "utf8");
  return JSON.parse(snapshot) as Snapshot;
}

function byName(a: RawItem, b: RawItem): number {
  return a.name.localeCompare(b.name) || a.uniqueName.localeCompare(b.uniqueName);
}

export function readItems<T>(category?: readonly string[]): T[] {
  const { categories } = readSnapshot();
  const wanted = category ?? Object.keys(categories);
  const items = wanted.flatMap((name) => categories[name] ?? []) as RawItem[];
  return items.sort(byName) as unknown as T[];
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
