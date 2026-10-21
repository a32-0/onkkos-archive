import { describe, expect, it } from "vitest";

import { lackingNecramechs } from "@/domain/catalog/necramechs";
import { goalAtPlace, suggestedGoals } from "@/domain/graph/suggest";
import type { SearchInput } from "@/screens/goals/state";
import { goalCards, suggestionRows } from "@/screens/goals/view";

import { CY, fixture, testData, testGraph } from "./helpers";

const data = testData();
const graph = testGraph();

describe("Build a Necramech (BR-54)", () => {
  it("names Voidrig first, then Bonewidow, when the profile shows none", () => {
    const names = lackingNecramechs(data.arsenal, {}).map((item) => item.name);
    expect(names.slice(0, 2)).toEqual(["Voidrig", "Bonewidow"]);
  });

  it("skips a Necramech the profile shows in XPInfo", () => {
    const voidrig = data.arsenal.find((item) => item.name === "Voidrig")!;
    const lacking = lackingNecramechs(data.arsenal, {
      LoadOutInventory: { XPInfo: [{ ItemType: voidrig.uniqueName, XP: 1 }] },
    });
    expect(lacking[0]?.name).toBe("Bonewidow");
  });

  it("reads the veteran's Necramechs from the profile", () => {
    const all = lackingNecramechs(data.arsenal, {}).length;
    expect(lackingNecramechs(data.arsenal, fixture(CY)).length).toBeLessThanOrEqual(all);
  });
});

describe("the goals offered (BR-05)", () => {
  it("puts the goal on the frontier first", () => {
    expect(goalAtPlace(graph, "Mars", "Mars")).toBe("unlock_next_planet");
    expect(suggestedGoals(graph, 20, new Set(), "unlock_next_planet")[0]).toBe(
      "unlock_next_planet",
    );
  });

  it("puts the goal at the focus first when there is no frontier", () => {
    expect(goalAtPlace(graph, null, "Deimos")).toBe("build_necramech");
    expect(suggestedGoals(graph, 2, new Set(), "build_necramech")[0]).toBe("build_necramech");
    expect(goalAtPlace(graph, null, "Venus")).toBeNull();
  });

  it("names the junction on the planet card and drops a card it cannot word", () => {
    const cards = goalCards([
      {
        id: "unlock_next_planet",
        kind: "planet",
        href: "/system?system=origin&place=Mars",
        junction: { from: "Earth", to: "Mars" },
      },
      { id: "unlock_next_planet", kind: "planet", href: "/system", junction: null },
      { id: "build_necramech", kind: "necramech", href: "/item?name=Voidrig", junction: null },
    ]);
    expect(cards.map((card) => [card.title, card.icon])).toEqual([
      ["Unlock the next planet", "flag"],
      ["Build a Necramech", "precision-manufacturing"],
    ]);
    expect(cards[0]?.line).toBe("Clear the Mars Junction, on Earth, to open the next planet.");
  });
});

describe("the search rows (BR-53, BR-62)", () => {
  const hit = (
    name: string,
    gap: SearchInput["gap"],
    kind: SearchInput["kind"] = "item",
    score = 1,
  ) =>
    ({
      kind,
      name,
      catalogue: kind === "place" ? "place" : "primary",
      art: null,
      system: kind === "place" ? "origin" : null,
      gap,
      score,
    }) satisfies SearchInput;

  it("puts what is in reach first and says the gap of the rest", () => {
    const rows = suggestionRows([
      hit("Rubico", { kind: "rank", need: 8, have: 5 }),
      hit("Braton", null),
      hit("Jupiter", { kind: "junction", from: "Earth", to: "Mars" }, "place"),
      hit("Dojo", { kind: "clan" }, "place"),
    ]);
    expect(rows.map((row) => [row.name, row.catalogue])).toEqual([
      ["Braton", "Primary"],
      ["Rubico", "Primary · Needs Mastery Rank 8, you are 5"],
      ["Jupiter", "Place · Clear the Mars Junction, on Earth"],
      ["Dojo", "Place · Join a clan"],
    ]);
  });

  it("opens an item beyond reach on Step by step, and a place on the map", () => {
    const rows = suggestionRows([
      hit("Braton", null),
      hit("Rubico", { kind: "rank", need: 8, have: 5 }),
      hit("Mars", null, "place"),
    ]);
    expect(rows[0]?.href).toBe("/item?name=Braton&from=goal");
    expect(rows[1]).toMatchObject({ href: "/system?system=origin&place=Mars", round: true });
    expect(rows[2]?.href).toBe("/item?name=Rubico&from=goal&view=steps");
  });

  it("keeps a closer name above what is in reach (owner, 2026-10-21)", () => {
    const rows = suggestionRows([
      hit("Ash", { kind: "rank", need: 8, have: 5 }, "item", 4),
      ...Array.from({ length: 9 }, (_, index) => hit(`Crash ${index}`, null)),
    ]);
    expect(rows[0]?.name).toBe("Ash");
  });

  it("keeps eight", () => {
    const many = Array.from({ length: 12 }, (_, index) => hit(`Item ${index}`, null));
    expect(suggestionRows(many)).toHaveLength(8);
  });
});
