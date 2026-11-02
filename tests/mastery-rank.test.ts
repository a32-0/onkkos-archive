import { describe, expect, it } from "vitest";

import { HIGHEST_RANK, rankProgress, rankThreshold } from "@/domain/profile/mastery-rank";
import { masteryCatalog } from "@/infra/catalog/items";
import type { RawProfile } from "@/domain/types/profile";

import { CY, fixture, NEW_PLAYER, testCatalog, testData } from "./helpers";

const catalog = testCatalog();
const sources = { catalog, weights: masteryCatalog(), nodes: testData().wiki.nodes };

function weapon(name: string) {
  const item = catalog.find((one) => one.name === name);
  if (!item) throw new Error(`${name} is not in the catalog`);
  return item;
}

function profileWith(level: number, ranks: Record<string, number>): RawProfile {
  return {
    PlayerLevel: level,
    LoadOutInventory: {
      XPInfo: Object.entries(ranks).map(([name, rank]) => {
        const item = weapon(name);
        return { ItemType: item.uniqueName, XP: item.affinityFactor * rank * rank };
      }),
    },
  };
}

describe("rankThreshold", () => {
  it("follows the wiki's table, 2,500 times the rank squared up to 30", () => {
    expect(rankThreshold(9)).toBe(202_500);
    expect(rankThreshold(30)).toBe(2_250_000);
  });

  it("adds 147,500 for each Legendary rank", () => {
    expect(rankThreshold(31)).toBe(2_397_500);
    expect(rankThreshold(HIGHEST_RANK)).toBe(3_135_000);
  });
});

describe("rankProgress", () => {
  it("reads nothing when the profile has no arsenal", () => {
    expect(rankProgress(fixture(NEW_PLAYER), sources)).toBeNull();
  });

  it("puts Cy between Rank 27 and Rank 28", () => {
    const progress = rankProgress(fixture(CY), sources);
    expect(progress?.state).toBe("progress");
    if (progress?.state !== "progress") return;
    expect(progress.next).toBe(28);
    expect(progress.share).toBeGreaterThan(0);
    expect(progress.share).toBeLessThan(1);
    expect(progress.shown.length).toBeLessThanOrEqual(3);
  });

  it("orders the items by the mastery they have left", () => {
    const progress = rankProgress(profileWith(1, { Lex: 12, Boltor: 18 }), sources);
    if (progress?.state !== "progress") throw new Error("no progress");
    expect(progress.shown.map((one) => one.item.name)).toEqual(["Lex", "Boltor"]);
    expect(progress.covers).toBe(false);
  });

  it("names the fewest items that close the gap", () => {
    const progress = rankProgress(profileWith(0, { Lex: 1, Boltor: 1 }), sources);
    if (progress?.state !== "progress") throw new Error("no progress");
    expect(progress.shown.map((one) => one.item.name)).toEqual(["Boltor"]);
    expect(progress.covers).toBe(true);
    expect(progress.more).toBe(1);
  });

  it("is full once the points reach the next rank", () => {
    const progress = rankProgress(profileWith(0, { Lex: 12, Boltor: 18 }), sources);
    if (progress?.state !== "progress") throw new Error("no progress");
    expect(progress.full).toBe(true);
    expect(progress.share).toBe(1);
    expect(progress.shown).toEqual([]);
  });

  it("shows three and counts the rest", () => {
    const progress = rankProgress(
      profileWith(3, { Lex: 1, Boltor: 1, Paris: 1, Braton: 1, Lato: 1 }),
      sources,
    );
    if (progress?.state !== "progress") throw new Error("no progress");
    expect(progress.shown).toHaveLength(3);
    expect(progress.more).toBe(2);
  });

  it("finds nothing to rank when everything is at max rank", () => {
    const progress = rankProgress(profileWith(4, { Lex: 30 }), sources);
    if (progress?.state !== "progress") throw new Error("no progress");
    expect(progress.full).toBe(false);
    expect(progress.shown).toEqual([]);
    expect(progress.covers).toBe(false);
  });

  it("stops at the highest rank there is", () => {
    expect(rankProgress(profileWith(HIGHEST_RANK, { Lex: 30 }), sources)).toEqual({
      state: "highest",
      rank: HIGHEST_RANK,
    });
  });
});
