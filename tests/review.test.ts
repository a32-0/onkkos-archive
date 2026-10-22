import { describe, expect, it } from "vitest";

import { isReviewed, reviewOf, rowChanges, type ReviewSources } from "@/domain/catalog/review";
import type { GameUpdate } from "@/domain/catalog/updates";

import { isEmpty, renderReport } from "../scripts/review-report";
import { testData } from "./helpers";

const data = testData();
const now = Date.UTC(2026, 9, 21);

const ash = data.arsenal.find((item) => item.name === "Ash");
const told = data.spine.arcs[0]?.quests[0]?.name ?? "";

function update(version: string, name: string, date: string): GameUpdate {
  return {
    version,
    versions: [version],
    name,
    date,
    yearMonth: date.slice(0, 7),
    yearMonths: [date.slice(0, 7)],
    wikiUrl: null,
    items: 0,
    quest: null,
    art: null,
  };
}

function sources(overrides: Partial<ReviewSources> = {}): ReviewSources {
  return {
    data,
    updates: [
      update("99.1", "The Test", "2027-01-20"),
      update("99", "Test Mainline", "2027-01-01"),
    ],
    entries: [
      {
        uniqueName: ash?.uniqueName,
        name: "Ash",
        category: "Warframes",
        introduced: { name: "Hotfix 99.1.2" },
      },
      {
        uniqueName: "/Test/Hotfix",
        name: "Example Hotfix Mod",
        category: "Mods",
        introduced: { name: "Hotfix 99.1.10" },
      },
      {
        uniqueName: "/Test/Quest",
        name: told.toUpperCase(),
        category: "Quests",
        introduced: { name: "Update 99.1" },
      },
      {
        uniqueName: "/Test/NewQuest",
        name: "The Unwritten",
        category: "Quests",
        introduced: { name: "Update 99.1" },
      },
      {
        uniqueName: "/Test/Dice",
        name: "Example Dice",
        category: "Dice",
        introduced: { name: "Update 99.1" },
      },
      {
        uniqueName: "/Test/Mod",
        name: "Example Mod",
        category: "Mods",
        introduced: { name: "Update 99.0" },
      },
      {
        uniqueName: "/Test/Part",
        name: "Example Part",
        category: "Components",
        introduced: { name: "Update 99.0" },
      },
      {
        uniqueName: "/Test/Late",
        name: "Late Mod",
        category: "Mods",
        introduced: { name: "Update 44.0" },
      },
      {
        uniqueName: "/Test/Old",
        name: "Old Mod",
        category: "Mods",
        introduced: { name: "Update 43.0" },
      },
    ],
    before: new Set(["/Test/Old"]),
    nodes: [
      { name: "Old Node", planet: "Earth" },
      { name: "New Node", planet: "Earth" },
      { name: "Far Node", planet: "Nowhere" },
    ],
    nodesBefore: new Set(["Old Node"]),
    places: new Set(["Earth"]),
    now,
    ...overrides,
  };
}

describe("which updates a review covers", () => {
  it("reviews what came after the mark, or from the update asked for", () => {
    expect(isReviewed("44", { after: "44.1", from: null })).toBe(true);
    expect(isReviewed("44.1", { after: "44.1", from: null })).toBe(true);
    expect(isReviewed("44.2", { after: "44.1", from: null })).toBe(false);
    expect(isReviewed("44", { after: "44.1", from: "44" })).toBe(false);
    expect(isReviewed("43.5", { after: "44.1", from: "44" })).toBe(true);
    expect(isReviewed("10", { after: null, from: null })).toBe(false);
  });
});

describe("the three levels", () => {
  const review = reviewOf(sources(), { after: "44.1", from: null });
  const newest = review.updates[0];
  const mainline = review.updates[1];
  const named = (name: string) =>
    [...review.updates.flatMap((one) => one.findings), ...review.late, ...review.nodes].find(
      (one) => one.name === name,
    );

  it("lists every update since the mark, the newest first, a hotfix folded into its update", () => {
    expect(review.updates.map((one) => one.version)).toEqual(["99.1", "99"]);
    expect(newest?.name).toBe("The Test");
    expect(newest?.date).toBe("2027-01-20");
    expect(newest?.hotfixes).toEqual(["Hotfix 99.1.2", "Hotfix 99.1.10"]);
  });

  it("lets an item with a route enter on its own, and says where it comes from", () => {
    expect(named("Ash")?.level).toBe("own");
    expect(named("Ash")?.route).not.toBeNull();
  });

  it("asks for a source where none says how to get it, or where the story is silent", () => {
    expect(named("Example Mod")).toMatchObject({ level: "source", missing: "route" });
    expect(named("The Unwritten")).toMatchObject({ level: "source", missing: "story" });
    expect(named(told.toUpperCase())?.level).toBe("own");
  });

  it("calls a kind no list knows new to the app, and passes over the parts", () => {
    expect(named("Example Dice")?.level).toBe("new");
    expect(named("Example Part")).toBeUndefined();
    expect(newest?.findings[0]?.name).toBe("Example Dice");
  });

  it("keeps what arrived late in the catalog apart, and leaves out what was there before", () => {
    expect(review.late.map((one) => one.name)).toEqual(["Late Mod"]);
    expect(named("Old Mod")).toBeUndefined();
    expect(mainline?.findings.map((one) => one.name)).toEqual(["Example Mod"]);
  });

  it("lets a new node on a known planet in, and asks for the planet of one that is not", () => {
    expect(named("New Node")?.level).toBe("own");
    expect(named("Far Node")).toMatchObject({ level: "source", missing: "planet" });
    expect(named("Old Node")).toBeUndefined();
  });

  it("finds nothing when no update and no entry is new", () => {
    const quiet = reviewOf(sources({ updates: [], entries: [], nodes: [] }), {
      after: "44.1",
      from: null,
    });
    expect(isEmpty(quiet)).toBe(true);
  });
});

describe("the report", () => {
  const review = reviewOf(sources(), { after: "44.1", from: null });
  const report = renderReport(review, {
    date: "2027-01-21",
    catalogFrom: "1.1276.21",
    catalogTo: "1.1277.0",
    passed: true,
    drops: { changed: 2, added: 1, removed: 0 },
    modules: ["vendors", "nodes"],
  });

  it("speaks in the game's names, never a path or a rule id", () => {
    expect(report).not.toMatch(/data\/|src\/|scripts\/|\.ya?ml|\.json|\.tsx?\b|BR-\d+/);
    expect(report).toContain("# Content review of 2027-01-21");
    expect(report).toContain(
      "Catalog 1.1276.21 → 1.1277.0. Every check passes with the new data: types, lint, format and tests.",
    );
    expect(report).toContain("## Update 99.1: The Test");
    expect(report).toContain("**Example Dice** (Dice)");
    expect(report).toContain("Wiki data: Vendors and Missions changed.");
    expect(report).toContain("Drop tables: 2 rows changed, 1 added, 0 removed.");
  });

  it("counts what it found in the three levels", () => {
    expect(report).toContain(
      "9 new things: 3 enter on their own, 5 need a source, 1 is new to the app.",
    );
  });
});

describe("what else changed", () => {
  it("counts the rows changed, added and removed", () => {
    const before = new Map([
      ["a", "1"],
      ["b", "2"],
      ["c", "3"],
    ]);
    const after = new Map([
      ["a", "1"],
      ["b", "5"],
      ["d", "4"],
    ]);
    expect(rowChanges(before, after)).toEqual({ changed: 1, added: 1, removed: 1 });
  });
});
