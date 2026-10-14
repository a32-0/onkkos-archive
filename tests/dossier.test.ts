import { describe, expect, it } from "vitest";

import { stepPlan } from "@/domain/catalog/checks";
import { dossier } from "@/domain/catalog/dossier";
import { buildHours, buildMinutes, oneIn } from "@/domain/catalog/odds";
import { resolveAcquisition } from "@/domain/catalog/scenario";
import { proximaPlace } from "@/domain/place/proxima";

import { testCatalog, testData } from "./helpers";

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

describe("relics as the place a Prime part comes from", () => {
  const data = testData();

  it("groups refinements per relic and never reads a relic as a node", () => {
    for (const part of resolveAcquisition(data, itemNamed("Nyx Prime")).parts) {
      const relics = part.routes.filter((route) => route.kind === "relic");
      expect(relics.length).toBeGreaterThan(0);
      expect(part.routes.every((route) => route.kind === "relic")).toBe(true);
    }
  });

  it("leads every part of a Prime that still drops with a relic that still drops", () => {
    for (const name of ["Nyx Prime", "Caliban Prime"]) {
      for (const part of resolveAcquisition(data, itemNamed(name)).parts) {
        const first = part.routes[0];
        expect(first?.kind === "relic" && !first.offer.vaulted).toBe(true);
      }
    }
  });

  it("marks every relic of a vaulted Prime as vaulted", () => {
    const offers = resolveAcquisition(data, itemNamed("Ember Prime")).parts.flatMap((part) =>
      part.routes.flatMap((route) => (route.kind === "relic" ? [route.offer] : [])),
    );
    expect(offers.length).toBeGreaterThan(0);
    expect(offers.every((offer) => offer.vaulted)).toBe(true);
  });
});

describe("Railjack nodes filed under a planet", () => {
  const data = testData();

  it("are named Proxima, so reaching the planet never ticks them", () => {
    const farms = resolveAcquisition(data, itemNamed("Nyx Prime")).parts.flatMap((part) =>
      part.routes.flatMap((route) => (route.kind === "relic" ? [route.offer.farm] : [])),
    );
    const bifrost = farms.find((farm) => farm?.node === "Bifrost Echo");
    expect(bifrost?.place).toBe("Venus Proxima");
  });

  it("leaves an ordinary cache node on its planet", () => {
    expect(proximaPlace(data.rewards, "Venus", ["Ishtar (Caches)"], "Caches")).toBe("Venus");
    expect(proximaPlace(data.rewards, "Venus", ["Bifrost Echo (Caches)"], "Caches")).toBe(
      "Venus Proxima",
    );
    expect(proximaPlace(data.rewards, "Veil Proxima", ["Flexa"], "Caches")).toBe("Veil Proxima");
  });
});

describe("the relics in the step plan (BR-49, BR-50)", () => {
  const data = testData();
  const plan = stepPlan(data, dossier(itemNamed("Nyx Prime"), catalog), {
    now: Date.UTC(2026, 9, 3),
    masteryRank: 27,
  });
  const parts = plan.sections.filter((section) => section.id.startsWith("part:"));

  it("leads each Prime part with a relic that still drops", () => {
    expect(parts.length).toBeGreaterThan(0);
    const firsts = parts.map((section) => section.groups[0]?.rows[0]);
    expect(firsts.every((row) => row?.title.say === "openRelicTitle")).toBe(true);
    expect(
      firsts.some((row) =>
        row?.detail.some(
          (part) => typeof part !== "string" && part.say === "relicOdds" && !part.vaulted,
        ),
      ),
    ).toBe(true);
  });

  it("opens the first relic and offers the rest as alternatives", () => {
    for (const section of parts) {
      const rows = section.groups.flatMap((group) => group.rows);
      expect(rows[0]?.alternative).toBe(false);
      expect(rows.slice(1).every((row) => row.alternative)).toBe(true);
    }
  });

  it("marks the highest chance as a flag, never as a number in the title", () => {
    const rows = parts.flatMap((section) => section.groups.flatMap((group) => group.rows));
    expect(rows.some((row) => row.best)).toBe(true);
    for (const row of rows) {
      if (row.title.say === "openRelicTitle")
        expect(Object.keys(row.title).sort()).toEqual(["relic", "say", "vaulted"]);
    }
  });
});

describe("a vaulted Prime in Prime Resurgence (BR-49)", () => {
  const data = testData();
  const prime = itemNamed("Ember Prime");
  const relicName = [...data.relics.keys()].find((name) =>
    data.wiki.relics.get(name)?.drops.some((drop) => drop.item === prime.name),
  );
  const relic = relicName === undefined ? undefined : data.relics.get(relicName);
  const plan = stepPlan(data, dossier(prime, catalog), {
    now: Date.UTC(2026, 9, 3),
    masteryRank: 10,
    varzia: {
      location: "Maroo's Bazaar",
      expiry: "2026-10-20",
      offers: [
        { uniqueName: relic?.uniqueName ?? "", aya: 1, regalAya: null },
        { uniqueName: prime.uniqueName, aya: null, regalAya: 3 },
      ],
    },
  });

  it("opens with the relic Varzia sells, then offers the rest with Or", () => {
    expect(relic).toBeDefined();
    const sections = plan.sections.filter((section) => section.id.startsWith("part:"));
    const opened = sections.filter((section) =>
      section.groups[0]?.rows[0]?.id.startsWith("resurgence:"),
    );
    expect(opened.length).toBeGreaterThan(0);
    for (const section of sections) {
      const rows = section.groups.flatMap((group) => group.rows);
      expect(rows[0]?.alternative).toBe(false);
      expect(rows.slice(1).every((row) => row.alternative)).toBe(true);
    }
  });

  it("offers the whole Prime for Regal Aya when her stock holds it", () => {
    const how = plan.sections.find((section) => section.id === "how");
    const whole = how?.groups[0]?.rows.find((row) => row.id === "whole");
    expect(whole?.detail).toEqual([{ say: "wholeDetail", regalAya: 3 }]);
  });
});
