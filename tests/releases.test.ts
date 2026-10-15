import { describe, expect, it } from "vitest";

import { allPlaces } from "@/domain/catalog/places";
import { ARSENAL_SHELVES, releasesSince, shelfOf } from "@/domain/catalog/releases";

import { testData, testGraph } from "./helpers";

const data = testData();
const known = new Set(allPlaces(testGraph()).map((place) => place.name));

describe("releasesSince", () => {
  it("dates almost the whole catalog and counts what it cannot", () => {
    const catalog = data.arsenal;
    const dated = catalog.filter((item) => item.releaseDate !== null);
    expect(dated.length / catalog.length).toBeGreaterThan(0.9);

    const releases = releasesSince(data, "2024-01", known, null);
    expect(releases.undated).toBe(catalog.length - dated.length);
  });

  it("never lists anything released on or before the month asked for", () => {
    const releases = releasesSince(data, "2025-01", known, null);
    for (const group of releases.groups) {
      for (const entry of group.items) {
        expect((entry.item.releaseDate ?? "").slice(0, 7) > "2025-01").toBe(true);
      }
    }
  });

  it("returns fewer items the more recent the month", () => {
    const wide = releasesSince(data, "2024-01", known, null);
    const narrow = releasesSince(data, "2026-01", known, null);
    expect(narrow.total).toBeLessThan(wide.total);
    expect(wide.total).toBeGreaterThan(0);
  });

  it("shelves the arsenal as drawn, newest first inside each", () => {
    const releases = releasesSince(data, "2024-01", known, null);
    expect(releases.groups.length).toBeGreaterThan(1);
    const order = releases.groups.map((group) => ARSENAL_SHELVES.indexOf(group.group));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    for (const group of releases.groups) {
      expect(group.items.every((entry) => shelfOf(entry.item) === group.group)).toBe(true);
      const dates = group.items.map((entry) => entry.item.releaseDate ?? "");
      expect([...dates].sort().reverse()).toEqual(dates);
    }
  });

  it("says nothing about ownership when the profile cannot prove it", () => {
    const blind = releasesSince(data, "2024-01", known, null);
    expect(blind.ownedReadable).toBe(false);
    expect(blind.owned).toBe(0);
    expect(blind.groups.every((g) => g.items.every((e) => e.owned === null))).toBe(true);
  });

  it("marks what the profile does prove", () => {
    const one = data.arsenal.find(
      (item) => item.releaseDate !== null && item.releaseDate.slice(0, 7) > "2024-01",
    );
    expect(one).toBeDefined();
    const releases = releasesSince(data, "2024-01", known, new Set([one!.uniqueName]));
    expect(releases.ownedReadable).toBe(true);
    expect(releases.owned).toBe(1);
  });

  it("carries the update that introduced an item, with its wiki citation", () => {
    const releases = releasesSince(data, "2024-01", known, null);
    const withUpdate = releases.groups
      .flatMap((group) => group.items)
      .filter((entry) => entry.item.update !== null);
    expect(withUpdate.length).toBeGreaterThan(0);
    for (const entry of withUpdate.slice(0, 20)) {
      if (entry.item.update?.url) {
        expect(entry.item.update.url).toContain("wiki.warframe.com");
      }
    }
  });

  it("puts Necramechs and Archwings in Vehicles and arch-guns in Weapons", () => {
    const named = (name: string) => data.arsenal.find((item) => item.name === name)!;
    expect(shelfOf(named("Voidrig"))).toBe("vehicles");
    expect(shelfOf(named("Itzal"))).toBe("vehicles");
    expect(shelfOf(named("Corvas"))).toBe("weapons");
    expect(shelfOf(named("Ash"))).toBe("warframes");
  });

  it("dates mods and arcanes, and brings in the relics a new Prime drops from", () => {
    const releases = releasesSince(data, "2024-01", known, null);
    const shelves = releases.collection.map((group) => group.group);
    expect(shelves).toContain("mods");
    expect(shelves).toContain("relics");
    for (const group of releases.collection) {
      for (const entry of group.items) expect(entry.releaseDate.slice(0, 7) > "2024-01").toBe(true);
    }
  });

  it("returns no quest: Catch me up is the arsenal and the collection (BR-35)", () => {
    const releases = releasesSince(data, "2015-01", known, null);
    const gates = releases.groups.flatMap((group) => group.items.map((entry) => entry.gate));
    expect(gates.length).toBeGreaterThan(0);
    expect(gates.some((gate) => gate.kind === "quest" || gate.quest !== null)).toBe(false);
    const shelves: string[] = [
      ...releases.groups.map((group) => group.group),
      ...releases.collection.map((group) => group.group),
    ];
    expect(shelves.some((shelf) => /quest/i.test(shelf))).toBe(false);
  });
});
