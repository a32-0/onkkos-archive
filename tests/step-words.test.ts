import { describe, expect, it } from "vitest";

import { everyPlan } from "@/domain/catalog/every-plan";
import { allPlaces } from "@/domain/catalog/places";
import { detailOf, titled } from "@/screens/summary/lines";

import { testData, testGraph } from "./helpers";

const data = testData();
const places = new Set(allPlaces(testGraph()).map((place) => place.name));
const plans = everyPlan(data, places, { now: Date.UTC(2026, 9, 3), masteryRank: 10 });
const TABLE_LABEL = /Endless: |\((Caches|Extra)\)|, Rotation | Rewards\b/;

const steps = plans.flatMap(({ owner, plan }, index) =>
  plan.sections
    .filter((section) => !section.checkable)
    .flatMap((section) =>
      section.groups.flatMap((group) =>
        group.rows.map((row) => ({
          owner,
          index,
          section: section.id,
          row,
          title: titled(row.title),
          where: detailOf(row.where) ?? "",
          detail: detailOf(row.detail) ?? "",
        })),
      ),
    ),
);

function named(list: readonly { owner: string; title: string }[]): string[] {
  return [...new Set(list.map((one) => `${one.owner}: ${one.title}`))].sort();
}

describe("every step says what to do, in the player's words (spec 10)", () => {
  it("starts each title with what to do, never with the bare name of the thing", () => {
    expect(named(steps.filter((one) => one.title === one.owner))).toEqual([]);
  });

  it("never shows a drop table's label as a place to go", () => {
    expect(named(steps.filter((one) => TABLE_LABEL.test(one.title)))).toEqual([]);
  });

  it("names one place a row, never two joined", () => {
    expect(
      named(
        steps.filter(
          (one) =>
            (one.row.title.say === "playTitle" || one.row.title.say === "cachesTitle") &&
            one.row.title.node.includes(", "),
        ),
      ),
    ).toEqual([]);
  });

  it("gives each way in a section once", () => {
    const seen = new Set<string>();
    const twice: { owner: string; title: string }[] = [];
    for (const one of steps) {
      const key = `${one.index}|${one.section}|${one.title}|${one.where}|${one.detail}`;
      if (seen.has(key)) twice.push(one);
      seen.add(key);
    }
    expect(named(twice)).toEqual([]);
  });

  it("says a sure drop drops every run, not 100% a run", () => {
    expect(named(steps.filter((one) => /\b100% (a run|each time)/.test(one.detail)))).toEqual([]);
  });
});
