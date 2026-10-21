import { describe, expect, it } from "vitest";

import type { PlaceItem, PlaceView } from "@/domain/place/build";
import type { SystemEntry } from "@/domain/place/schema";
import { firstPlace, startHere } from "@/domain/place/start-here";
import type { RawProfile } from "@/domain/types/profile";

import { testGraph } from "./helpers";

const graph = testGraph();

const SYSTEMS: SystemEntry[] = [
  {
    id: "origin",
    name: "Origin System",
    places: ["Earth", "Venus", "Mars", "Dojo"],
    released: true,
  },
  { id: "tau", name: "Tau System", places: ["Tau"], released: false },
];

const item = (uniqueName: string): PlaceItem =>
  ({ uniqueName, masterable: true, maxRank: 30 }) as PlaceItem;

const view = (place: string, ...items: string[]): PlaceView => ({
  place,
  system: null,
  resources: [],
  items: items.map(item),
});

const INDEX = new Map<string, PlaceView>([
  ["Earth", view("Earth", "/a", "/b")],
  ["Venus", view("Venus", "/c", "/d")],
  ["Mars", view("Mars", "/e")],
  ["Dojo", view("Dojo", "/f", "/g")],
  ["Tau", view("Tau", "/h", "/i")],
]);

const everyJunction: RawProfile = {
  Missions: graph.starChartOrder
    .flatMap((entry) => (entry.junctionTag ? [entry.junctionTag] : []))
    .map((Tag) => ({ Tag, Completes: 1 })),
};

const ranks = (...mastered: string[]) => new Map(mastered.map((name) => [name, 30]));

describe("startHere (BR-44, BR-36, BR-40)", () => {
  it("is the frontier while the player has one", () => {
    expect(startHere(graph, { Missions: [] }, SYSTEMS, INDEX, ranks())).toEqual({
      system: "origin",
      place: "Venus",
    });
  });

  it("is the focus with no frontier: the highest share mastered, short of all", () => {
    expect(startHere(graph, everyJunction, SYSTEMS, INDEX, ranks("/a", "/c", "/d"))).toEqual({
      system: "origin",
      place: "Earth",
    });
  });

  it("leaves out the Dojo and a system not yet released", () => {
    expect(
      startHere(graph, everyJunction, SYSTEMS, INDEX, ranks("/a", "/b", "/c", "/d", "/f", "/h")),
    ).toEqual({ system: "origin", place: "Mars" });
  });

  it("is nothing when everything readable is mastered", () => {
    expect(
      startHere(graph, everyJunction, SYSTEMS, INDEX, ranks("/a", "/b", "/c", "/d", "/e")),
    ).toBeNull();
  });

  it("falls back to the first place of the first system (BR-46)", () => {
    expect(firstPlace(SYSTEMS)).toEqual({ system: "origin", place: "Earth" });
    expect(firstPlace([])).toBeNull();
  });
});
