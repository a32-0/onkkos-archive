import { describe, expect, it } from "vitest";

import type { CatalogItem } from "@/domain/catalog/items";
import type { RankProgress } from "@/domain/profile/mastery-rank";
import { builtIntoChips } from "@/screens/item/view";
import type { ItemFacts } from "@/screens/item/state";
import { rankCard, rankOverview, rankSteps } from "@/screens/rank/view";

import { testCatalog } from "./helpers";

const catalog = testCatalog();

function item(name: string): CatalogItem {
  const found = catalog.find((one) => one.name === name);
  if (!found) throw new Error(`${name} is not in the catalog`);
  return found;
}

type Progress = Extract<RankProgress, { state: "progress" }>;

function progress(over: Partial<Progress> = {}): Progress {
  return {
    state: "progress",
    rank: 8,
    next: 9,
    share: 0.92,
    full: false,
    left: 3_000,
    shown: [
      { item: item("Lex"), rank: 12, left: 1_800 },
      { item: item("Boltor"), rank: 18, left: 1_200 },
    ],
    more: 0,
    covers: true,
    newWeapons: 1,
    newWarframes: 1,
    unlocks: [],
    ...over,
  };
}

const HREF = "/goals/rank";

describe("rankCard", () => {
  it("asks to reach the next rank, naming what takes the player there", () => {
    expect(rankCard(progress(), HREF)).toEqual({
      seal: "9",
      title: "Reach Mastery Rank 9",
      line: "Ranking Lex and Boltor takes you there.",
      href: HREF,
    });
  });

  it("asks for the test once the bar is full", () => {
    expect(rankCard(progress({ full: true, share: 1, shown: [] }), HREF)?.title).toBe(
      "Take the Rank 9 test",
    );
  });

  it("is gone at the highest rank, and when the profile cannot tell", () => {
    expect(rankCard({ state: "highest", rank: 36 }, HREF)).toBeNull();
    expect(rankCard(null, HREF)).toBeNull();
  });
});

describe("rankOverview", () => {
  it("counts the items beyond the three it shows", () => {
    const view = rankOverview(
      progress({
        shown: [
          { item: item("Lex"), rank: 12, left: 1_800 },
          { item: item("Boltor"), rank: 18, left: 1_200 },
          { item: item("Paris"), rank: 2, left: 2_800 },
        ],
        more: 4,
      }),
      {},
      null,
      "goal",
    );
    expect(view.left?.chips.map((chip) => chip.label)).toEqual(["Lex", "Boltor", "Paris", "+4"]);
    expect(view.left?.chips.map((chip) => chip.href)).toEqual([
      "/item?name=Lex&from=goal",
      "/item?name=Boltor&from=goal",
      "/item?name=Paris&from=goal",
      undefined,
    ]);
    expect(view.figure).toBe("92%");
  });

  it("shows an empty state when nothing is left to rank", () => {
    const view = rankOverview(progress({ shown: [], covers: false }), {}, null, "goal");
    expect(view.left).toBeUndefined();
    expect(view.empty?.title).toBe("Everything you own is at max rank");
  });

  it("closes in the mastered colour at the highest rank", () => {
    const view = rankOverview({ state: "highest", rank: 36 }, {}, null, "goal");
    expect(view.highest).toBe(true);
    expect(view.label).toBe("The highest rank there is");
    expect(view.empty?.title).toBe("Every rank reached");
  });
});

describe("rankSteps", () => {
  it("lays out the shortest way, then the test", () => {
    const view = rankSteps(progress());
    expect(view.blocks.map((block) => block.title)).toEqual(["The shortest way", "The test"]);
    const rows = view.blocks[0]?.cards[0]?.groups[0]?.rows ?? [];
    expect(rows.map((row) => row.title)).toEqual([
      "Rank Lex and Boltor to 30",
      "Or rank one new weapon",
    ]);
    expect(rows[0]?.detail).toBe("You took them to ranks 12 and 18. That is enough for Rank 9.");
  });

  it("leaves only the test when the bar is full", () => {
    const view = rankSteps(progress({ full: true, shown: [] }));
    expect(view.blocks.map((block) => block.title)).toEqual(["The test"]);
  });
});

describe("builtIntoChips", () => {
  const facts = (builtInto: ItemFacts["builtInto"]) => ({ builtInto }) as ItemFacts;

  it("dims a recipe already mastered", () => {
    const chips = builtIntoChips(
      facts([
        { name: "Akbolto", count: 2, icon: null, done: false },
        { name: "Hystrix", count: 1, icon: null, done: true },
      ]),
      "goal",
    );
    expect(chips.map((chip) => chip.href)).toEqual([
      "/item?name=Akbolto&from=goal",
      "/item?name=Hystrix&from=goal",
    ]);
    expect(chips.map((chip) => [chip.label, chip.state])).toEqual([
      ["Akbolto ×2", "default"],
      ["Hystrix ×1", "done"],
    ]);
  });

  it("is gone once every recipe is mastered", () => {
    expect(
      builtIntoChips(facts([{ name: "Hystrix", count: 1, icon: null, done: true }]), "goal"),
    ).toEqual([]);
  });
});
