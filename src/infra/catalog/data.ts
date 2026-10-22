import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { parse as parseYaml } from "yaml";

import { buildCollectibleCatalog, buildGearRecipes } from "@/domain/catalog/collectibles";
import type { CatalogData, Opening } from "@/domain/catalog/data";
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
import { loadGraph } from "@/infra/graph/load";
import { patchNotes } from "@/infra/catalog/patch-notes";
import { updateArt, vendorArt } from "@/infra/catalog/update-art";
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
  const curated = normalizeSources(
    parseYaml(readFileSync(path.join(process.cwd(), "data", "sources.yaml"), "utf8")),
  );
  cached = {
    wiki,
    curated,
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
      curated: curated.items,
    }),
    gear: buildGearRecipes(gearEntries()),
    vendorArt: vendorArt(),
    openings: openings(),
  };
  return cached;
}

export function updateSources(): UpdateSources {
  cachedUpdates ??= {
    entries: introducedEntries(),
    patchNotes: patchNotes(),
    spine: loadSpine(),
    art: updateArt(),
    arsenal: arsenalCatalog(),
  };
  return cachedUpdates;
}

function openings(): Map<string, Opening> {
  const graph = loadGraph();
  const first = graph.starChartOrder[0]?.planet;
  return new Map<string, Opening>([
    ...(first ? [[first, { quest: null, after: null }] as const] : []),
    ...graph.offChartPlaces.map(
      (entry) => [entry.place, { quest: entry.unlockedBy, after: entry.after }] as const,
    ),
  ]);
}
