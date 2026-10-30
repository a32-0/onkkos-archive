import type { Collectible, CollectibleRecipe } from "@/domain/catalog/collectibles";
import type { CatalogItem, CatalogResource } from "@/domain/catalog/items";
import type { Relic } from "@/domain/catalog/relics";
import type { Curated } from "@/domain/catalog/sources";
import type { Wiki } from "@/domain/catalog/wiki";
import type { NarrativeSpine } from "@/domain/narrative/schema";
import type { CuratedAcquisition, PlaceRewards, RegionResources } from "@/domain/place/schema";

export interface Opening {
  quest: string | null;
  after: string | null;
}

export interface DropSource {
  kind: "enemy" | "activity" | "object";
  art: string | null;
}

export interface CatalogData {
  wiki: Wiki;
  curated: Curated;
  rewards: PlaceRewards;
  regions: RegionResources;
  acquisition: readonly CuratedAcquisition[];
  spine: NarrativeSpine;
  arsenal: CatalogItem[];
  resources: readonly CatalogResource[];
  relics: ReadonlyMap<string, Relic>;
  collectibles: ReadonlyMap<string, Collectible>;
  gear: ReadonlyMap<string, CollectibleRecipe>;
  vendorArt: Readonly<Record<string, string>>;
  dropSources: Readonly<Record<string, DropSource>>;
  openings: ReadonlyMap<string, Opening>;
}

export function findCollectible(data: CatalogData, name: string): Collectible | null {
  return data.collectibles.get(name) ?? null;
}

export function isCatalogued(data: CatalogData, name: string): boolean {
  return data.arsenal.some((item) => item.name === name) || data.collectibles.has(name);
}
