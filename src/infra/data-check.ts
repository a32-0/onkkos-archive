import "server-only";

import { catalogData, updateSources } from "@/infra/catalog/data";
import {
  arsenalCatalog,
  glyphImages,
  introducedEntries,
  masteryCatalog,
  resourceCatalog,
} from "@/infra/catalog/items";
import { loadModStats } from "@/infra/catalog/mod-stats";
import { patchNotes } from "@/infra/catalog/patch-notes";
import { dropSources, updateArt, vendorArt } from "@/infra/catalog/update-art";
import { loadGraph } from "@/infra/graph/load";
import { loadEvidenceRules } from "@/infra/narrative/evidence-load";
import { loadSpine } from "@/infra/narrative/load";
import {
  loadAcquisition,
  loadPlaceRewards,
  loadRegionResources,
  loadResearch,
  loadSystems,
  placeCatalog,
  placeIndex,
} from "@/infra/place/load";
import { wikiModules } from "@/infra/wiki/modules";

const READERS = [
  loadGraph,
  loadEvidenceRules,
  loadModStats,
  loadSpine,
  loadSystems,
  loadAcquisition,
  loadPlaceRewards,
  loadRegionResources,
  loadResearch,
  wikiModules,
  arsenalCatalog,
  masteryCatalog,
  resourceCatalog,
  glyphImages,
  introducedEntries,
  patchNotes,
  updateArt,
  vendorArt,
  dropSources,
  placeCatalog,
  placeIndex,
  catalogData,
  updateSources,
];

export function readAllData(): void {
  for (const read of READERS) read();
}
