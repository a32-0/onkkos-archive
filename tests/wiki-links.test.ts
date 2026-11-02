import { describe, expect, it } from "vitest";

import { everyPlan, linkedTitles } from "@/domain/catalog/every-plan";
import { allPlaces } from "@/domain/catalog/places";
import { linkedPage, pageOf } from "@/domain/catalog/wiki";

import { testData, testGraph } from "./helpers";

const data = testData();
const places = new Set(allPlaces(testGraph()).map((place) => place.name));
const plans = everyPlan(data, places, { now: Date.UTC(2026, 9, 3), masteryRank: 10 });
const REFRESH = "run pnpm data:wiki-pages";

describe("every Wiki link opens a page the wiki has", () => {
  it("has checked every page a step links to or quotes", () => {
    const unchecked = linkedTitles(data, plans).filter(
      (title) => pageOf(data.wiki, title) === undefined,
    );
    expect(unchecked, REFRESH).toEqual([]);
  });

  it("links each row to its own page, or to the page of what it is for", () => {
    const verified = new Set(
      [...data.wiki.pages.values()].filter((page): page is string => page !== null),
    );
    const broken: string[] = [];
    for (const { owner, plan } of plans) {
      for (const row of plan.sections.flatMap((one) => one.groups.flatMap((g) => g.rows))) {
        if (row.wikiTitle === null) continue;
        const page = linkedPage(data.wiki, row.wikiTitle, owner);
        if (page !== null && !verified.has(page)) broken.push(`${owner}: ${row.wikiTitle}`);
      }
    }
    expect(broken, REFRESH).toEqual([]);
  });
});
