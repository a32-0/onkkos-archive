import { describe, expect, it } from "vitest";

import {
  bannerUpdates,
  gameUpdates,
  latestArsenal,
  updateFor,
  updateStanding,
} from "@/domain/catalog/updates";

import { testGraph, testUpdates } from "./helpers";

const graph = testGraph();
const sources = testUpdates();
const updates = gameUpdates(graph, sources);

describe("the updates a returning player might remember", () => {
  it("lists a named minor update beside the majors", () => {
    const minor = updates.find((update) => update.version === "43.5");
    expect(minor?.name).toBe("Amir's Shockwave");
    expect(minor?.yearMonth).toBe("2026-08");
  });

  it("covers every update from 15, newest first by date", () => {
    expect(updates.length).toBeGreaterThanOrEqual(80);
    expect(updates[0]?.version).toBe("44.1");
    expect(updates.at(-1)?.version).toBe("15");
    for (let index = 1; index < updates.length; index += 1) {
      expect(updates[index - 1]!.date >= updates[index]!.date).toBe(true);
    }
  });

  it("lists the numbered updates between the majors, from DE's patch notes (BR-09)", () => {
    expect(updates.find((update) => update.version === "41.1")?.name).toBe("Vauban Heirloom");
    expect(updates.find((update) => update.version === "39.1")?.name).toBe("Caliban Prime");
    expect(updates.find((update) => update.version === "38.5")).toBeDefined();
    expect(updates.some((update) => /Hotfix|Update \d/.test(update.name))).toBe(false);
  });

  it("keeps one card per name: the principal, which holds its later versions", () => {
    const plains = updates.filter((update) => update.name === "Plains of Eidolon");
    expect(plains.map((update) => update.version)).toEqual(["22"]);
    expect(plains[0]?.date).toBe("2017-10-12");
    expect(plains[0]?.versions).toContain("22.11");
    const whispers = updates.find((update) => update.name === "Whispers in the Walls");
    expect(whispers?.version).toBe("35");
    expect(whispers?.versions).toEqual(["35", "35.1"]);
    expect(whispers?.yearMonths).toEqual(["2023-12", "2024-02"]);
    expect(new Set(updates.map((update) => update.name.toLowerCase())).size).toBe(updates.length);
  });

  it("dates an update the patch notes leave undated from the catalog", () => {
    expect(updates.find((update) => update.version === "39.1")?.date).toBe("2025-08-26");
  });

  it("does not let one graph's curated names leak into another's list", () => {
    const bare = { ...graph, updateNames: [] };
    const names = new Map(
      gameUpdates(bare, sources).map((update) => [update.version, update.name]),
    );
    expect(names.get("17")).toBe(undefined);
    expect(names.get("35")).toBe("Whispers in the Walls");
    expect(updates.find((update) => update.version === "17")?.name).toBe("Echoes of the Sentient");
  });

  it("dates Fortuna from the Update 24.0 entry, not the earliest 24.x item", () => {
    const fortuna = updates.find((update) => update.version === "24");
    expect(fortuna?.name).toBe("Fortuna");
    expect(fortuna?.date).toBe("2018-11-08");
  });

  it("dates The Duviri Paradox as DE's patch notes do", () => {
    expect(updates.find((update) => update.version === "33")?.date).toBe("2023-04-26");
  });

  it("names every update it offers", () => {
    for (const update of updates) {
      expect(update.name.length, `U${update.version}`).toBeGreaterThan(3);
      expect(/^\d/.test(update.name), `U${update.version}`).toBe(false);
    }
  });

  it("uses a curated name only where the catalog has none or has it wrong", () => {
    for (const entry of graph.updateNames) {
      const update = updates.find((candidate) => candidate.version === String(entry.version));
      expect(update?.name, `U${entry.version}`).toBe(entry.name);
    }
    expect(graph.updateNames.map((entry) => entry.version)).toEqual([17, 18, 20, 21, 33, 35, 40]);
  });

  it("joins the update to the quest that shipped with it", () => {
    const joined = updates.filter((update) => update.quest !== null);
    expect(joined.length).toBeGreaterThanOrEqual(20);
    expect(updates.find((update) => update.version === "35")?.quest).toBe("Whispers in the Walls");
    expect(updates.find((update) => update.version === "38")?.quest).toBe("The Hex");
  });

  it("carries the version and a month the rest of the app can already read (BR-43)", () => {
    for (const update of updates) {
      expect(update.yearMonth).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      expect(update.date.startsWith(update.yearMonth)).toBe(true);
      expect(update.version).toMatch(/^\d+(\.\d+)?$/);
    }
    expect(updateFor(graph, sources, "2023-12")?.name).toBe("Whispers in the Walls");
    expect(updateFor(graph, sources, "1999-01")).toBeNull();
  });

  it("gives the card each update's name, version, month and art", () => {
    const banner = bannerUpdates(graph, sources);
    expect(banner.map((entry) => entry.version)).toEqual(updates.map((update) => update.version));
    const art = banner.filter((entry) => entry.art !== null);
    expect(art.length).toBeGreaterThan(0);
    const newest = banner[0];
    expect(newest?.art).toBe(sources.patchNotes.find((note) => note.version === "44.1")?.art);
  });
});

describe("whether the player is up to date", () => {
  const newest = updates[0]!;
  const older = updates[3]!;
  const owning = (names: readonly string[]) => ({
    LoadOutInventory: { XPInfo: names.map((ItemType) => ({ ItemType, XP: 1 })) },
  });
  const shipped = latestArsenal(updates, sources.arsenal);

  it("is current when the chosen month is the newest update", () => {
    expect(updateStanding(graph, sources, newest.yearMonth, {})).toEqual({
      update: newest,
      current: true,
    });
  });

  it("is current when the chosen month is after the newest update", () => {
    expect(updateStanding(graph, sources, "9999-12", {})).toEqual({
      update: newest,
      current: true,
    });
  });

  it("keeps the chosen update when the profile cannot show everything new", () => {
    expect(updateStanding(graph, sources, older.yearMonth, {})).toEqual({
      update: older,
      current: false,
    });
    expect(updateStanding(graph, sources, older.yearMonth, owning(shipped.slice(1))).current).toBe(
      false,
    );
  });

  it("turns current on its own once every item of the newest update is in the profile", () => {
    expect(shipped.length).toBeGreaterThan(0);
    expect(updateStanding(graph, sources, older.yearMonth, owning(shipped))).toEqual({
      update: newest,
      current: true,
    });
    expect(updateStanding(graph, sources, null, owning(shipped)).current).toBe(true);
  });
});
