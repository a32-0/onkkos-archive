import { describe, expect, it } from "vitest";

import { acquisitionRoutes } from "@/domain/catalog/acquisition";
import { allPlaces } from "@/domain/catalog/places";

import { testCatalog, testGraph } from "./helpers";

const places = new Set(allPlaces(testGraph()).map((place) => place.name));

function itemNamed(name: string) {
  const item = testCatalog().find((entry) => entry.name === name);
  if (!item) throw new Error(`${name} is not in the catalog`);
  return item;
}

describe("acquisitionRoutes", () => {
  it("answers without being told a place, best chance first", () => {
    const routes = acquisitionRoutes(itemNamed("Athodai"), places);
    expect(routes.length).toBeGreaterThan(0);
    expect(routes[0]?.place).toBe("Venus");
    expect(routes[0]?.source).toBe("Caches");
    expect(routes[0]?.rotations).toEqual(["B"]);
    expect(routes[0]?.chance).toBe(6.45);
    for (let i = 1; i < routes.length; i += 1) {
      expect(routes[i - 1]?.chance ?? 0).toBeGreaterThanOrEqual(routes[i]?.chance ?? 0);
    }
  });

  it("recovers the component names the drop table hides in its type", () => {
    const routes = acquisitionRoutes(itemNamed("Athodai"), places);
    expect(routes[0]?.parts).toEqual(["Barrel", "Blueprint", "Receiver"]);
  });

  it("keeps every node of one mission type together as a single route", () => {
    const routes = acquisitionRoutes(itemNamed("Athodai"), places);
    expect(routes[0]?.nodes.length).toBeGreaterThan(1);
  });

  it("counts each relic as a route of its own instead of merging them", () => {
    const routes = acquisitionRoutes(itemNamed("Mesa Prime"), places);
    expect(routes.every((route) => route.place === null)).toBe(true);
    expect(routes.every((route) => route.nodes.length === 1)).toBe(true);
    expect(new Set(routes.flatMap((route) => route.nodes)).size).toBeGreaterThan(1);
  });

  it("says nothing at all when the catalog carries no drop", () => {
    expect(acquisitionRoutes(itemNamed("Braton"), places)).toEqual([]);
  });
});
