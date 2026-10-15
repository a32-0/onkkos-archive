import { describe, expect, it } from "vitest";

import { rankFromXp } from "@/domain/catalog/mastery";
import { ownedArsenal } from "@/domain/profile/arsenal";

import { CY, fixture, testCatalog, VETERAN } from "./helpers";

const catalog = testCatalog();
const veteran = fixture(VETERAN);
const cy = fixture(CY);

describe("rankFromXp", () => {
  it("500 * n^2 for weapons, 1000 * n^2 for anything you pilot", () => {
    expect(rankFromXp(500 * 30 * 30, 500, 30)).toBe(30);
    expect(rankFromXp(1000 * 21 * 21, 1000, 30)).toBe(21);
  });

  it("never exceeds the item's cap", () => {
    expect(rankFromXp(10_000_000, 500, 30)).toBe(30);
    expect(rankFromXp(10_000_000, 500, 40)).toBe(40);
  });

  it("missing or zero XP is rank 0, not a crash", () => {
    expect(rankFromXp(0, 500, 30)).toBe(0);
    expect(rankFromXp(Number.NaN, 500, 30)).toBe(0);
  });
});

describe("ownedArsenal", () => {
  it("returns 'not readable' without LoadOutInventory, not an empty list", () => {
    expect(ownedArsenal(veteran, catalog)).toEqual({ readable: false });
  });

  it("reads XPInfo from LoadOutInventory", () => {
    const owned = ownedArsenal(cy, catalog);
    expect(owned.readable).toBe(true);
    if (!owned.readable) return;

    expect(owned.items.length).toBeGreaterThan(100);
    expect(owned.maxed).toBeGreaterThan(0);
    expect(owned.maxed).toBeLessThanOrEqual(owned.items.length);

    const ember = owned.items.find((i) => i.item.name === "Ember");
    expect(ember?.rank).toBe(30);
    expect(ember?.maxed).toBe(true);
  });

  it("reads every catalog item in XPInfo, each ranked from its own XP", () => {
    const owned = ownedArsenal(cy, catalog);
    if (!owned.readable) throw new Error("Cy's arsenal should be readable");
    const known = new Set(catalog.map((item) => item.uniqueName));
    const entries = (cy.LoadOutInventory?.XPInfo ?? []).filter((entry) =>
      known.has(entry.ItemType),
    );
    expect(owned.items).toHaveLength(entries.length);
    for (const entry of entries) {
      const read = owned.items.find((one) => one.item.uniqueName === entry.ItemType);
      expect(read?.rank).toBe(
        rankFromXp(entry.XP ?? 0, read?.item.affinityFactor ?? 0, read?.item.maxRank ?? 0),
      );
    }
  });

  it("ignores a root-level XPInfo: that is not where DE puts it", () => {
    expect(ownedArsenal({ XPInfo: [{ ItemType: "x", XP: 1 }] }, catalog)).toEqual({
      readable: false,
    });
  });
});
