import { describe, expect, it } from "vitest";

import { questAccess } from "@/domain/narrative/access";
import { loadSpine } from "@/infra/narrative/load";
import { arcLocations } from "@/domain/narrative/schema";
import type { RawProfile } from "@/domain/types/profile";

import { fixture, NEW_PLAYER, testGraph, VETERAN } from "./helpers";

const graph = testGraph();
const spine = loadSpine();
const veteran = fixture(VETERAN);
const newPlayer = fixture(NEW_PLAYER);

const quests = spine.arcs.flatMap((arc) => arc.quests);
const questNamed = (name: string) => {
  const quest = quests.find((q) => q.name === name);
  if (!quest) throw new Error(`${name} is not on the spine`);
  return quest;
};

describe("narrative_spine.yaml links", () => {
  it("every quest link points at the wiki, never at warframe.com", () => {
    const withLink = quests.filter((q) => q.wikiUrl !== null);
    expect(withLink.length).toBeGreaterThan(10);
    for (const quest of withLink) {
      expect(quest.wikiUrl).toMatch(/^https:\/\/wiki\.warframe\.com\/w\/\S+$/);
    }
  });

  it("every planet in available_at exists in star_chart_order", () => {
    const planets = new Set(graph.starChartOrder.map((e) => e.planet));
    for (const quest of quests) {
      for (const planet of quest.availableAt) {
        expect(planets.has(planet), `${quest.name}: ${planet}`).toBe(true);
      }
    }
  });

  it("splits the quests into the wiki's three lists", () => {
    const byKind = (kind: string) => quests.filter((q) => q.kind === kind).map((q) => q.name);
    expect(byKind("side").sort()).toEqual(
      [
        "A Man of Few Words",
        "Howl of the Kubrow",
        "Patient Zero",
        "Saya's Vigil",
        "Stolen Dreams",
        "Veilbreaker",
      ].sort(),
    );
    expect(byKind("warframe")).toHaveLength(12);
    expect(byKind("main")).toHaveLength(24);
  });

  it("every off-path quest states its requirement and never moves the player", () => {
    for (const quest of quests) {
      if (quest.kind === "main") continue;
      expect(quest.requirement, quest.name).toBeTruthy();
      expect(quest.sideArc, quest.name).toBe(true);
    }
    expect(questNamed("Jade Shadows").sideArc).toBe(true);
    expect(questNamed("The Second Dream").sideArc).toBe(false);
  });

  it("every quest knows where it starts, where it goes and which wiki page tells it", () => {
    for (const quest of quests) {
      expect(quest.wikiTitle, quest.name).toBeTruthy();
      expect(quest.start, quest.name).toBeTruthy();
      expect(quest.requirement, quest.name).toBeTruthy();
      expect(quest.locations.length, quest.name).toBeGreaterThan(0);
    }
    expect(questNamed("Vox Solaris").wikiTitle).toBe("Vox Solaris (Quest)");
    expect(questNamed("The Hex").wikiTitle).toBe("The Hex (Quest)");
  });

  it("an arc's locations come from its quests, without repeats", () => {
    const arc = spine.arcs.find((a) => a.id === "void_war_saga");
    expect(arc && arcLocations(arc)).toEqual(["Deimos", "Höllvania", "Zariman", "Uranus", "Venus"]);
  });

  it("arcs carry the official guide's names", () => {
    expect(spine.arcs.map((a) => a.label)).toEqual([
      "Arc 1: Awakening",
      "Arc 2: The War Within Saga",
      "Arc 3: The New War Saga",
      "Arc 4: The Void War Saga",
    ]);
  });
});

describe("questAccess", () => {
  it("a quest without a planet gate has no readable access", () => {
    expect(questAccess(questNamed("The New War"), veteran, graph)).toBeNull();
    expect(questAccess(questNamed("Rising Tide"), veteran, graph)).toBeNull();
  });

  it("the new player can start Saya's Vigil but not Vox Solaris", () => {
    expect(questAccess(questNamed("Saya's Vigil"), newPlayer, graph)?.reached).toBe(true);
    expect(questAccess(questNamed("Vox Solaris"), newPlayer, graph)).toEqual({
      planets: ["Venus"],
      reached: false,
      missing: ["Venus"],
    });
  });

  it("The War Within needs both planets and names the missing one", () => {
    const onlyPluto: RawProfile = { Missions: [{ Tag: "NeptuneToPlutoJunction" }] };
    expect(questAccess(questNamed("The War Within"), onlyPluto, graph)).toEqual({
      planets: ["Pluto", "Sedna"],
      reached: false,
      missing: ["Sedna"],
    });
    expect(questAccess(questNamed("The War Within"), veteran, graph)?.reached).toBe(true);
  });

  it("a played node of the planet counts even without the junction tag", () => {
    const oldAccount: RawProfile = { Missions: [{ Tag: "SolNode1", Completes: 3 }] };
    expect(questAccess(questNamed("The Second Dream"), oldAccount, graph)?.reached).toBe(true);
  });

  it("a profile without missions reaches nothing but Earth", () => {
    expect(questAccess(questNamed("Saya's Vigil"), {}, graph)?.reached).toBe(true);
    expect(questAccess(questNamed("The Duviri Paradox"), {}, graph)?.reached).toBe(false);
  });
});

describe("grafo.yaml pathways", () => {
  it("every goal carries one of the official guide's four paths", () => {
    for (const goal of Object.values(graph.goals)) {
      expect(["star_chart", "collect", "grow", "explore"], goal.id).toContain(goal.pathway);
    }
  });
});
