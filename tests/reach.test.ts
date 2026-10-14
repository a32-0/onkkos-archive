import { describe, expect, it } from "vitest";

import { DOJO } from "@/domain/place/schema";
import { itemGaps, placeGap, rankGap, readReach, systemInReach } from "@/domain/place/reach";
import type { RawProfile } from "@/domain/types/profile";
import { loadSystems } from "@/infra/place/load";

import { CY, fixture, testGraph } from "./helpers";

const graph = testGraph();
const systems = loadSystems().systems;
const system = (id: string) => {
  const found = systems.find((entry) => entry.id === id);
  if (!found) throw new Error(`No system ${id}`);
  return found;
};

const newPlayer: RawProfile = { PlayerLevel: 5, Missions: [] };
const throughMars: RawProfile = {
  PlayerLevel: 9,
  Missions: [{ Tag: "EarthToVenusJunction" }, { Tag: "VenusToMercuryJunction" }],
  GuildId: true,
};

describe("a place's reach", () => {
  it("reaches the planets up to the frontier, and the frontier itself", () => {
    const reach = readReach(graph, newPlayer);
    expect(placeGap(reach, "Earth")).toBeNull();
    expect(placeGap(reach, "Venus")).toBeNull();
    expect(placeGap(reach, "Mercury")).toEqual({ kind: "junction", from: "Earth", to: "Venus" });
  });

  it("names the junction the frontier needs for every place beyond it", () => {
    const reach = readReach(graph, throughMars);
    expect(placeGap(reach, "Mars")).toBeNull();
    expect(placeGap(reach, "Sedna")).toEqual({ kind: "junction", from: "Earth", to: "Mars" });
  });

  it("reaches a place off the chart once the planet it sits after is reached", () => {
    const reach = readReach(graph, newPlayer);
    expect(placeGap(reach, "Duviri")).toBeNull();
    expect(placeGap(reach, "Deimos")).toEqual({ kind: "junction", from: "Earth", to: "Venus" });
    expect(placeGap(reach, "Sanctuary")).not.toBeNull();
    expect(placeGap(reach, "Dark Refractory")).not.toBeNull();
  });

  it("reaches the planets an account older than junctions played", () => {
    const reach = readReach(graph, { Missions: [{ Tag: "SolNode2" }, { Tag: "SolNode12" }] });
    expect(placeGap(reach, "Mercury")).toBeNull();
    expect(placeGap(reach, "Mars")).toBeNull();
    expect(placeGap(reach, "Phobos")).toEqual({ kind: "junction", from: "Earth", to: "Mars" });
  });

  it("opens the Dojo to a profile that names a clan, and only to one", () => {
    expect(placeGap(readReach(graph, throughMars), DOJO)).toBeNull();
    expect(placeGap(readReach(graph, newPlayer), DOJO)).toEqual({ kind: "clan" });
  });

  it("reaches everything for a player with no frontier", () => {
    const reach = readReach(graph, fixture(CY));
    for (const place of systems.flatMap((entry) => entry.places)) {
      expect(placeGap(reach, place)).toBeNull();
    }
  });

  it("reaches every place when Missions[] cannot be read, the Dojo too", () => {
    const reach = readReach(graph, { PlayerLevel: 2 });
    for (const place of systems.flatMap((entry) => entry.places)) {
      expect(placeGap(reach, place)).toBeNull();
    }
  });
});

describe("an item's reach", () => {
  it("needs the rank, said as values", () => {
    const reach = readReach(graph, newPlayer);
    expect(rankGap(reach, 8)).toEqual({ kind: "rank", need: 8, have: 5 });
    expect(rankGap(reach, 5)).toBeNull();
  });

  it("needs its place too, and says both when both stand in the way", () => {
    const reach = readReach(graph, newPlayer);
    expect(itemGaps(reach, { masteryReq: 8, place: "Mars" })).toEqual([
      { kind: "rank", need: 8, have: 5 },
      { kind: "junction", from: "Earth", to: "Venus" },
    ]);
    expect(itemGaps(reach, { masteryReq: 0, place: "Earth" })).toEqual([]);
  });

  it("is measured by rank alone when it has no place", () => {
    const reach = readReach(graph, newPlayer);
    expect(itemGaps(reach, { masteryReq: 0, place: null })).toEqual([]);
  });

  it("reaches every rank when PlayerLevel cannot be read", () => {
    const reach = readReach(graph, { Missions: [] });
    expect(rankGap(reach, 30)).toBeNull();
  });
});

describe("a system's reach", () => {
  it("holds a system with a place in reach, and never Tau", () => {
    const reach = readReach(graph, newPlayer);
    expect(systemInReach(reach, system("origin"))).toBe(true);
    expect(systemInReach(reach, system("duviri"))).toBe(true);
    expect(systemInReach(reach, system("empyrean"))).toBe(false);
    expect(systemInReach(reach, system("tau"))).toBe(false);
    expect(systemInReach(readReach(graph, {}), system("tau"))).toBe(false);
  });
});
