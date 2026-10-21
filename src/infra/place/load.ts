import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { parse as parseYaml } from "yaml";

import { buildPlaceIndex, type PlaceView } from "@/domain/place/build";
import { buildPlaceCatalog, type PlaceCatalog, type RawEntry } from "@/domain/place/catalog";
import { hubAcquisition } from "@/domain/place/hubs";
import {
  normalizeAcquisition,
  normalizePlaceRewards,
  normalizeRegionResources,
  normalizeResearch,
  normalizeSystems,
  withCanonicalPlaces,
  type CuratedAcquisition,
  type PlaceRewards,
  type RegionResources,
  type Research,
  type Systems,
} from "@/domain/place/schema";
import { readItems } from "@/infra/catalog/items";
import { wikiModules } from "@/infra/wiki/modules";

function readYaml(file: string): unknown {
  return parseYaml(readFileSync(path.join(process.cwd(), "data", file), "utf8"));
}

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(path.join(process.cwd(), "data", "vendor", file), "utf8"));
}

let cachedAcquisition: CuratedAcquisition[] | undefined;
let cachedSystems: Systems | undefined;
let cachedRewards: PlaceRewards | undefined;
let cachedResources: RegionResources | undefined;
let cachedResearch: Research | undefined;
let cachedCatalog: PlaceCatalog | undefined;
let cachedIndex: ReadonlyMap<string, PlaceView> | undefined;

export function loadAcquisition(): CuratedAcquisition[] {
  cachedAcquisition ??= normalizeAcquisition(readYaml("acquisition.yaml"));
  return cachedAcquisition;
}

export function loadSystems(): Systems {
  cachedSystems ??= normalizeSystems(readYaml("systems.yaml"));
  return cachedSystems;
}

export function loadPlaceRewards(): PlaceRewards {
  cachedRewards ??= withCanonicalPlaces(
    normalizePlaceRewards(readJson("place-rewards.json")),
    loadSystems().aliases,
  );
  return cachedRewards;
}

export function loadRegionResources(): RegionResources {
  cachedResources ??= withCanonicalPlaces(
    normalizeRegionResources(readJson("region-resources.json")),
    loadSystems().aliases,
  );
  return cachedResources;
}

export function loadResearch(): Research {
  cachedResearch ??= normalizeResearch(readJson("wiki-research.json"));
  return cachedResearch;
}

export function placeCatalog(): PlaceCatalog {
  cachedCatalog ??= buildPlaceCatalog(readItems<RawEntry>());
  return cachedCatalog;
}

export function placeIndex(): ReadonlyMap<string, PlaceView> {
  cachedIndex ??= buildPlaceIndex({
    catalog: placeCatalog(),
    rewards: loadPlaceRewards(),
    resources: loadRegionResources(),
    systems: loadSystems().systems,
    acquisition: [
      ...loadAcquisition(),
      ...hubAcquisition(placeCatalog().entries, wikiModules(), loadSystems().hubs),
    ],
    research: loadResearch(),
  });
  return cachedIndex;
}
