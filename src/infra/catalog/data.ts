import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { parse as parseYaml } from "yaml";

import { buildCollectibleCatalog, buildGearRecipes } from "@/domain/catalog/collectibles";
import type { CatalogData } from "@/domain/catalog/data";
import { buildRelicCatalog } from "@/domain/catalog/relics";
import { normalizeSources } from "@/domain/catalog/sources";
import type { UpdateSources } from "@/domain/catalog/updates";
import {
  arsenalCatalog,
  collectibleEntries,
  gearEntries,
  introducedEntries,
  relicEntries,
  resourceCatalog,
} from "@/infra/catalog/items";
import { updateArt } from "@/infra/catalog/update-art";
import { loadSpine } from "@/infra/narrative/load";
import { loadAcquisition, loadPlaceRewards, loadRegionResources } from "@/infra/place/load";
import { wikiModules } from "@/infra/wiki/modules";

let cached: CatalogData | undefined;
let cachedUpdates: UpdateSources | undefined;

export function catalogData(): CatalogData {
  if (cached) return cached;
  const wiki = wikiModules();
  const rewards = loadPlaceRewards();
  const regions = loadRegionResources();
  const arsenal = arsenalCatalog();
  const relics = buildRelicCatalog(relicEntries(), rewards);
  cached = {
    wiki,
    curated: normalizeSources(
      parseYaml(readFileSync(path.join(process.cwd(), "data", "sources.yaml"), "utf8")),
    ),
    rewards,
    regions,
    acquisition: loadAcquisition(),
    spine: loadSpine(),
    arsenal,
    resources: resourceCatalog(),
    relics,
    collectibles: buildCollectibleCatalog({
      raw: collectibleEntries(),
      arsenal,
      relics,
      regions,
      wiki,
    }),
    gear: buildGearRecipes(gearEntries()),
  };
  return cached;
}

export function updateSources(): UpdateSources {
  cachedUpdates ??= {
    entries: introducedEntries(),
    spine: loadSpine(),
    art: updateArt(),
    arsenal: arsenalCatalog(),
  };
  return cachedUpdates;
}
