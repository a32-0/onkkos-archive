import { describe, expect, it } from "vitest";

import { allPlaces } from "@/domain/catalog/places";
import { bestPlaces, whatsNew, type NewGroup, type WhatsNew } from "@/domain/catalog/whats-new";
import { readReach } from "@/domain/place/reach";
import type { RawProfile } from "@/domain/types/profile";
import { placeIndex } from "@/infra/place/load";
import { tileLines } from "@/screens/summary/lines";
import { summarySections } from "@/screens/summary/view";

import { fixture, testData, testGraph } from "./helpers";

const data = testData();
const graph = testGraph();
const NOW = Date.UTC(2026, 9, 16);
const SINCE = "2025-08";

function newsFor(
  profile: RawProfile,
  since = SINCE,
  ranks: ReadonlyMap<string, number> | null = null,
): WhatsNew {
  return whatsNew(
    {
      data,
      places: new Set(allPlaces(graph).map((place) => place.name)),
      bestPlaces: bestPlaces(placeIndex()),
      reach: readReach(graph, profile),
      ranks,
      now: NOW,
    },
    since,
  );
}

const groupsOf = (news: WhatsNew): NewGroup[] => [...news.arsenal, ...news.collection];

describe("what shipped since the month (spec 06, BR-12)", () => {
  const news = newsFor(fixture("profile-cy"));

  it("draws only the groups with something new, Arsenal before Collection", () => {
    expect(news.arsenal.map((group) => group.group)).toEqual(
      ["warframes", "weapons", "companions", "vehicles"].filter((name) =>
        news.arsenal.some((group) => group.group === name),
      ),
    );
    expect(news.arsenal.length).toBeGreaterThan(0);
    expect(news.collection.map((group) => group.group)).toEqual(
      expect.arrayContaining(["relics", "mods", "arcanes"]),
    );
    for (const group of groupsOf(news)) expect(group.count, group.group).toBeGreaterThan(0);
  });

  it("counts every new thing, the tiles and the ones beyond reach together (BR-61)", () => {
    for (const group of groupsOf(news)) {
      expect(group.count).toBe(group.tiles.length + (group.beyond?.count ?? 0));
    }
  });

  it("has nothing new after the newest month", () => {
    expect(groupsOf(newsFor(fixture("profile-cy"), "2099-12"))).toEqual([]);
  });

  it("gives a tile the first line of the item's own Summary, in words", () => {
    const tiles = groupsOf(news).flatMap((group) => group.tiles);
    const lines = tiles.map((tile) => tileLines(tile.reading, tile.where));
    expect(lines.some((line) => /^~\d+ Runs?( · Rotation [A-Z])?$/.test(line.reading))).toBe(true);
    for (const line of lines) {
      expect(line.reading).not.toMatch(/\[object|undefined|null/);
      expect(line.place).not.toMatch(/\[object|undefined|null/);
    }
  });
});

describe("a tile opens its item with the Resume tab lit (BR-36, spec 04)", () => {
  it("links to the item page with from=resume", () => {
    const sections = summarySections(newsFor(fixture("profile-cy")), {});
    const tile = sections[0]?.groups[0]?.tiles[0];
    expect(tile?.href).toMatch(/^\/item\?name=.+&from=resume$/);
    expect(new URLSearchParams(tile?.href.split("?")[1]).get("name")).toBe(tile?.name);
  });
});

describe("what the player can reach (BR-59, BR-61)", () => {
  it("holds back what Ordis's Mastery Rank 2 cannot reach, and says the rank", () => {
    const ordis = fixture("profile-ordis");
    expect(ordis.PlayerLevel).toBe(2);
    const groups = groupsOf(newsFor(ordis));
    const held = groups.filter((group) => group.beyond !== null);
    expect(held.length).toBeGreaterThan(0);
    const byName = new Map(data.arsenal.map((item) => [item.name, item]));
    for (const group of newsFor(ordis).arsenal) {
      for (const tile of group.tiles) {
        expect(byName.get(tile.name)?.masteryReq ?? 0, tile.name).toBeLessThanOrEqual(2);
      }
    }
    const rank = held.find((group) => group.beyond?.kinds.includes("rank"));
    expect(rank?.beyond?.have).toBe(2);
    expect(rank?.beyond?.need).toBeGreaterThan(2);
  });

  it("counts nothing away from a profile with no PlayerLevel and no Missions", () => {
    const groups = groupsOf(newsFor({}));
    expect(groups.length).toBeGreaterThan(0);
    for (const group of groups) {
      expect(group.beyond).toBeNull();
      expect(group.tiles.length).toBe(group.count);
    }
  });

  it("files each item under the place of its best route, read once per index", () => {
    const places = bestPlaces(placeIndex());
    expect(places.size).toBeGreaterThan(0);
    expect(bestPlaces(placeIndex())).toBe(places);
  });
});

describe("the end of a group says how many and what stands in the way (BR-61)", () => {
  const group = (beyond: NewGroup["beyond"]): WhatsNew => ({
    arsenal: [{ group: "weapons", count: 5, tiles: [], beyond, lenses: false }],
    collection: [],
  });
  const more = (beyond: NewGroup["beyond"]) => summarySections(group(beyond), {})[0]?.groups[0];

  it("names the lowest rank and the player's own", () => {
    expect(more({ count: 4, kinds: ["rank"], need: 8, have: 5, junction: null })?.more).toEqual({
      title: "4 more out of reach",
      whole: "4 new weapons out of reach",
      line: "They need Mastery Rank 8 or higher. You are Mastery Rank 5.",
    });
  });

  it("names the junction for a place", () => {
    expect(
      more({
        count: 1,
        kinds: ["junction"],
        need: null,
        have: null,
        junction: { from: "Earth", to: "Venus" },
      })?.more?.line,
    ).toBe("Clear the Venus Junction, on Earth, to reach it.");
  });

  it("names both when both stand in the way", () => {
    expect(
      more({
        count: 6,
        kinds: ["rank", "junction"],
        need: 8,
        have: 5,
        junction: { from: "Earth", to: "Venus" },
      })?.more?.line,
    ).toBe("They need Mastery Rank 8 or a place past Venus.");
  });

  it("renders a group whose new things are all beyond reach, with only that state", () => {
    const view = more({ count: 5, kinds: ["rank"], need: 8, have: 5, junction: null });
    expect(view?.tiles).toEqual([]);
    expect(view?.count).toBe("5 New");
    expect(view?.more?.whole).toBe("5 new weapons out of reach");
  });
});

describe("the view on a category's page (BR-15, BR-68)", () => {
  const maxed = new Map(data.arsenal.map((item) => [item.uniqueName, item.maxRank]));
  const news = newsFor(fixture("profile-ordis"), SINCE, maxed);

  it("offers the view only where the profile can tell", () => {
    expect(news.arsenal.every((group) => group.lenses)).toBe(true);
    expect(news.collection.every((group) => !group.lenses)).toBe(true);
    expect(newsFor(fixture("profile-ordis")).arsenal.some((group) => group.lenses)).toBe(false);
  });

  it("marks what is mastered, in reach or not, and counts it in {n} New", () => {
    for (const group of news.arsenal) {
      expect(group.tiles.every((tile) => tile.mastered)).toBe(true);
      expect(group.tiles).toHaveLength(group.count);
      expect(group.beyond).toBeNull();
    }
  });
});
