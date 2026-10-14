import { describe, expect, it } from "vitest";

import { dossier } from "@/domain/catalog/dossier";
import type { PlaceItem } from "@/domain/place/build";
import {
  completionOf,
  isComplete,
  itemRanks,
  relatedStates,
  stateByName,
  stateOf,
} from "@/domain/place/state";
import { placeCatalog } from "@/infra/place/load";

import { CY, fixture, testCatalog, VETERAN } from "./helpers";

function item(patch: Partial<PlaceItem>): PlaceItem {
  return {
    uniqueName: "/Test/Item",
    name: "Test",
    catalog: "arsenal",
    group: "warframes",
    verb: "drop",
    from: null,
    imageUrl: null,
    wikiUrl: null,
    masterable: true,
    canonical: false,
    releaseDate: null,
    maxRank: 30,
    routes: [],
    ...patch,
  };
}

describe("item state", () => {
  const ranks = new Map([
    ["/Test/Maxed", 30],
    ["/Test/Half", 12],
  ]);

  it("reads a maxed item as done", () => {
    expect(stateOf(item({ uniqueName: "/Test/Maxed" }), ranks)).toEqual({ kind: "done" });
  });

  it("carries the fraction on a partly ranked item", () => {
    expect(stateOf(item({ uniqueName: "/Test/Half" }), ranks)).toEqual({
      kind: "ranked",
      rank: 12,
      max: 30,
    });
  });

  it("treats a readable item the player does not own as absent, not unknown", () => {
    expect(stateOf(item({ uniqueName: "/Test/Missing" }), ranks)).toEqual({ kind: "absent" });
  });

  it("never claims to know about an unmasterable item", () => {
    const mod = item({ uniqueName: "/Test/Maxed", masterable: false, group: "mods" });
    expect(stateOf(mod, ranks)).toEqual({ kind: "unknown" });
  });

  it("falls back to unknown for every item when the profile has no XP at all", () => {
    expect(stateOf(item({ uniqueName: "/Test/Maxed" }), null)).toEqual({ kind: "unknown" });
  });
});

describe("completion", () => {
  const ranks = new Map([
    ["/a", 30],
    ["/b", 5],
  ]);
  const items = [
    item({ uniqueName: "/a" }),
    item({ uniqueName: "/b" }),
    item({ uniqueName: "/c" }),
    item({ uniqueName: "/d", masterable: false, group: "mods" }),
  ];

  it("counts only what the profile can answer for", () => {
    expect(completionOf(items, ranks)).toEqual({ done: 1, readable: 3, unreadable: 1 });
  });

  it("keeps unreadable rows out of the denominator", () => {
    const { readable, unreadable } = completionOf(items, ranks);
    expect(readable + unreadable).toBe(items.length);
    expect(readable).toBeLessThan(items.length);
  });

  it("is complete only when every readable item is done", () => {
    expect(isComplete(completionOf(items, ranks))).toBe(false);
    expect(isComplete(completionOf([item({ uniqueName: "/a" })], ranks))).toBe(true);
  });

  it("is never complete when nothing is readable", () => {
    const onlyMods = [item({ uniqueName: "/d", masterable: false, group: "mods" })];
    expect(isComplete(completionOf(onlyMods, ranks))).toBe(false);
  });
});

describe("the profile read against the place catalog", () => {
  const { entries } = placeCatalog();
  const cy = fixture(CY);

  it("ranks every masterable item in XPInfo, and nothing without it", () => {
    const ranks = itemRanks(cy, entries);
    expect(ranks?.size).toBeGreaterThan(100);
    expect(itemRanks(fixture(VETERAN), entries)).toBeNull();
  });

  it("reads an item by name, and an unknown name as unknown", () => {
    const ranks = itemRanks(cy, entries);
    expect(stateByName("Ember", ranks, entries)).toEqual({ kind: "done" });
    expect(stateByName("Not An Item", ranks, entries)).toEqual({ kind: "unknown" });
  });

  it("gives what a weapon is built from and into a state each", () => {
    const catalog = testCatalog();
    const bolto = catalog.find((item) => item.name === "Bolto");
    if (!bolto) throw new Error("Bolto is not in the catalog");
    const states = relatedStates(dossier(bolto, catalog), itemRanks(cy, entries), entries);
    expect(Object.keys(states)).toEqual(expect.arrayContaining(["Akbolto", "Hystrix"]));
    for (const state of Object.values(states)) {
      expect(["done", "ranked", "absent", "unknown"]).toContain(state.kind);
    }
  });
});
