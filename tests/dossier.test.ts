import { describe, expect, it } from "vitest";

import { dossier } from "@/domain/catalog/dossier";
import { buildHours, buildMinutes, oneIn } from "@/domain/catalog/odds";

import { testCatalog } from "./helpers";

const catalog = testCatalog();

function itemNamed(name: string) {
  const item = catalog.find((entry) => entry.name === name);
  if (!item) throw new Error(`${name} is not in the catalog`);
  return item;
}

describe("the recipe read off the catalog", () => {
  it("splits crafted parts from the resources they cost", () => {
    const view = dossier(itemNamed("Mesa"), catalog);
    expect(view.parts.map((part) => part.name).sort()).toEqual([
      "Blueprint",
      "Chassis",
      "Neuroptics",
      "Systems",
    ]);
    expect(itemNamed("Mesa").recipe?.ingredients.map((one) => one.name)).toContain("Orokin Cell");
  });

  it("keeps a resource out of the parts list even when only one is needed", () => {
    const view = dossier(itemNamed("Mesa"), catalog);
    expect(view.parts.some((part) => part.name === "Orokin Cell")).toBe(false);
  });

  it("counts a part as a part when only its name says so", () => {
    const view = dossier(itemNamed("Voidrig"), catalog);
    expect(view.parts.map((part) => part.name)).toContain("Voidrig Capsule");
    const ingredients = itemNamed("Voidrig").recipe?.ingredients ?? [];
    expect(ingredients.some((one) => one.name.startsWith("Voidrig"))).toBe(false);
  });

  it("does not mistake a stacked resource for a part just because of its name", () => {
    const view = dossier(itemNamed("Javlok"), catalog);
    expect(view.parts.some((part) => part.name === "Javlok Capacitor")).toBe(false);
    const ingredients = itemNamed("Javlok").recipe?.ingredients ?? [];
    expect(ingredients.find((one) => one.name === "Javlok Capacitor")?.count).toBeGreaterThan(1);
  });

  it("reads build time when the catalog has it", () => {
    expect(buildHours(dossier(itemNamed("Mesa"), catalog).buildSeconds)).toBeGreaterThan(0);
  });

  it("says nothing rather than guessing when an item has no recipe", () => {
    const noRecipe = catalog.find((entry) => entry.recipe === null);
    expect(noRecipe).toBeDefined();
    const view = dossier(noRecipe!, catalog);
    expect(view.parts).toEqual([]);
    expect(view.buildSeconds).toBeNull();
  });
});

describe("one in N restates the chance and never invents a denominator", () => {
  it("rounds the reciprocal of a real chance", () => {
    expect(oneIn(50)).toBe(2);
    expect(oneIn(25)).toBe(4);
    expect(oneIn(6.45)).toBe(16);
  });

  it("refuses a chance that cannot be read", () => {
    expect(oneIn(null)).toBeNull();
    expect(oneIn(0)).toBeNull();
    expect(oneIn(-1)).toBeNull();
    expect(oneIn(140)).toBeNull();
  });

  it("refuses a build time that cannot be read", () => {
    expect(buildHours(null)).toBeNull();
    expect(buildHours(0)).toBeNull();
  });

  it("reads a build under an hour in minutes", () => {
    expect(buildMinutes(60)).toBe(1);
    expect(buildMinutes(1800)).toBe(30);
    expect(buildMinutes(3600)).toBeNull();
  });
});

describe("weapons that go into other weapons", () => {
  it("lifts a weapon ingredient out of the costs and merges its count", () => {
    const view = dossier(itemNamed("Akbolto"), catalog);
    expect(view.builtFrom).toEqual([expect.objectContaining({ name: "Bolto", count: 2 })]);
  });

  it("lists what a weapon is built into", () => {
    const view = dossier(itemNamed("Bolto"), catalog);
    expect(view.usedIn.map((one) => [one.name, one.count])).toEqual(
      expect.arrayContaining([
        ["Akbolto", 2],
        ["Hystrix", 1],
      ]),
    );
  });
});
