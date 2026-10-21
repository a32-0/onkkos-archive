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

function newsFor(profile: RawProfile, since = SINCE): WhatsNew {
  return whatsNew(
    {
      data,
      places: new Set(allPlaces(graph).map((place) => place.name)),
      bestPlaces: bestPlaces(placeIndex()),
      reach: readReach(graph, profile),
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

describe("the More line says how many, of what, and what stands in the way", () => {
  const group = (beyond: NewGroup["beyond"]): WhatsNew => ({
    arsenal: [{ group: "weapons", count: 5, tiles: [], beyond }],
    collection: [],
  });
  const more = (beyond: NewGroup["beyond"]) => summarySections(group(beyond), {})[0]?.groups[0];

  it("names the lowest rank and the player's own", () => {
    expect(more({ count: 4, kinds: ["rank"], need: 8, have: 5, junction: null })?.more).toBe(
      "4 more weapons need Mastery Rank 8 or higher. You are Mastery Rank 5.",
    );
  });

  it("names the junction for a place", () => {
    expect(
      more({
        count: 1,
        kinds: ["junction"],
        need: null,
        have: null,
        junction: { from: "Earth", to: "Venus" },
      })?.more,
    ).toBe(
      "1 more weapon comes from places past Venus. Clear the Venus Junction, on Earth, to go on.",
    );
  });

  it("names both when both stand in the way", () => {
    expect(
      more({
        count: 6,
        kinds: ["rank", "junction"],
        need: 8,
        have: 5,
        junction: { from: "Earth", to: "Venus" },
      })?.more,
    ).toBe("6 more weapons need Mastery Rank 8 or a place past Venus.");
  });

  it("renders a group whose new things are all beyond reach, with only its line", () => {
    const view = more({ count: 5, kinds: ["rank"], need: 8, have: 5, junction: null });
    expect(view?.tiles).toEqual([]);
    expect(view?.count).toBe("5 New");
    expect(view?.more).toMatch(/^5 more weapons/);
  });
});
