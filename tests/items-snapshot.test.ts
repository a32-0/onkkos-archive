import { readFileSync } from "node:fs";
import path from "node:path";

import Items from "@wfcd/items";
import { describe, expect, it } from "vitest";

import {
  buildCollectibleCatalog,
  buildGearRecipes,
  COLLECTIBLE_SOURCES,
  GEAR_SOURCES,
} from "@/domain/catalog/collectibles";
import {
  ARSENAL_SOURCES,
  buildArsenalCatalog,
  buildResourceCatalog,
  RESOURCE_SOURCES,
} from "@/domain/catalog/items";
import { buildRelicCatalog, RELIC_SOURCES } from "@/domain/catalog/relics";
import { gameUpdates } from "@/domain/catalog/updates";
import { buildPlaceCatalog } from "@/domain/place/catalog";
import { glyphArt, GLYPH_SOURCES } from "@/domain/profile/avatar";
import { readItems } from "@/infra/catalog/items";

import { testData, testGraph, testUpdates } from "./helpers";

function fromPackage<T>(category?: readonly string[]): T[] {
  return new Items({
    ...(category ? { category: [...category] } : {}),
    ignoreEnemies: true,
  } as ConstructorParameters<typeof Items>[0]) as unknown as T[];
}

function both<T, R>(category: readonly string[] | undefined, build: (raw: T[]) => R): [R, R] {
  return [build(readItems<T>(category)), build(fromPackage<T>(category))];
}

describe("the items snapshot", () => {
  it("was written from the installed @wfcd/items", () => {
    const root = process.cwd();
    const snapshot = JSON.parse(
      readFileSync(path.join(root, "data", "vendor", "items.json"), "utf8"),
    ) as { version: string };
    const installed = JSON.parse(
      readFileSync(path.join(root, "node_modules", "@wfcd", "items", "package.json"), "utf8"),
    ) as { version: string };
    expect(snapshot.version).toBe(installed.version);
  });

  it("builds the arsenal, the resources and the glyphs as the package does", () => {
    const [arsenal, arsenalThen] = both(ARSENAL_SOURCES, buildArsenalCatalog);
    expect(arsenal).toEqual(arsenalThen);
    const [resources, resourcesThen] = both(RESOURCE_SOURCES, buildResourceCatalog);
    expect(resources).toEqual(resourcesThen);
    const [glyphs, glyphsThen] = both(GLYPH_SOURCES, glyphArt);
    expect(glyphs).toEqual(glyphsThen);
  });

  it("builds the relics, the collectibles and the gear as the package does", () => {
    const data = testData();
    const relicsOf = (raw: Parameters<typeof buildRelicCatalog>[0]) =>
      buildRelicCatalog(raw, data.rewards);
    const [relics, relicsThen] = both(RELIC_SOURCES, relicsOf);
    expect(relics).toEqual(relicsThen);
    const collectiblesOf = (raw: Parameters<typeof buildGearRecipes>[0]) =>
      buildCollectibleCatalog({
        raw,
        arsenal: data.arsenal,
        relics: data.relics,
        regions: data.regions,
        wiki: data.wiki,
        curated: data.curated.items,
      });
    const [collectibles, collectiblesThen] = both(COLLECTIBLE_SOURCES, collectiblesOf);
    expect(collectibles).toEqual(collectiblesThen);
    const [gear, gearThen] = both(GEAR_SOURCES, buildGearRecipes);
    expect(gear).toEqual(gearThen);
  });

  it("builds the places' catalog and the updates as the package does", () => {
    const [places, placesThen] = both(undefined, buildPlaceCatalog);
    expect(places).toEqual(placesThen);
    const graph = testGraph();
    const sources = testUpdates();
    const updatesOf = (entries: (typeof sources.entries)[number][]) =>
      gameUpdates(graph, { ...sources, entries });
    const [updates, updatesThen] = both(undefined, updatesOf);
    expect(updates).toEqual(updatesThen);
  });
});
