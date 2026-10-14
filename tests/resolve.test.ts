import { describe, expect, it } from "vitest";

import { resolveGoal, topologicalOrder, UnknownGoalError } from "@/domain/graph/resolve";

import { fixture, NEW_PLAYER, testGraph, VETERAN } from "./helpers";

const graph = testGraph();
const veteran = fixture(VETERAN);
const newPlayer = fixture(NEW_PLAYER);

describe("topologicalOrder", () => {
  it("puts dependencies before whoever needs them", () => {
    const order = topologicalOrder(graph, ["necramech_components"]);
    expect(order.indexOf("planet_deimos")).toBeLessThan(order.indexOf("entrati_rank_2"));
    expect(order.indexOf("entrati_rank_2")).toBeLessThan(order.indexOf("necramech_components"));
  });

  it("does not duplicate a node reachable by two paths", () => {
    const order = topologicalOrder(graph, ["planet_deimos", "necramech_components"]);
    expect(new Set(order).size).toBe(order.length);
  });

  it("detects cycles instead of hanging", () => {
    const cyclic = structuredClone(graph);
    cyclic.nodes["planet_deimos"]!.requires = ["necramech_components"];
    expect(() => topologicalOrder(cyclic, ["necramech_components"])).toThrow(/Dependency cycle/);
  });
});

describe("resolveGoal", () => {
  it("fails clearly on an unknown goal", () => {
    expect(() => resolveGoal(graph, "does_not_exist", veteran)).toThrow(UnknownGoalError);
  });

  it("keeps only the three goals that name an item, a quest or a place", () => {
    expect(Object.keys(graph.goals).sort()).toEqual(
      ["build_necramech", "unlock_1999", "unlock_next_planet"].sort(),
    );
  });

  describe("build_necramech", () => {
    it("marks the verifiable and leaves the unreadable as manual", () => {
      const plan = resolveGoal(graph, "build_necramech", veteran);
      const byId = Object.fromEntries(plan.steps.map((s) => [s.id, s]));

      expect(byId["planet_deimos"]?.status).toBe("done");
      expect(byId["entrati_rank_2"]?.status).toBe("done");
      expect(byId["necramech_components"]?.status).toBe("manual");
      expect(byId["necramech_components"]?.question).toBeTruthy();

      expect(plan.complete).toBe(false);
      expect(plan.next?.id).toBe("necramech_components");
    });

    it("does not evaluate a node whose dependencies are missing; it marks it blocked", () => {
      const plan = resolveGoal(graph, "build_necramech", newPlayer);
      const byId = Object.fromEntries(plan.steps.map((s) => [s.id, s]));

      expect(byId["planet_deimos"]?.status).toBe("todo");
      expect(byId["entrati_rank_2"]?.status).toBe("blocked");
      expect(byId["entrati_rank_2"]?.blockedBy).toContain("planet_deimos");
      expect(byId["entrati_rank_2"]?.reason).toEqual({ kind: "after", nodes: ["Deimos"] });
      expect(plan.next?.id).toBe("planet_deimos");
    });
  });

  describe("unlock_1999", () => {
    it("attaches the quest checklist only while access is missing", () => {
      const complete = resolveGoal(graph, "unlock_1999", veteran);
      expect(complete.complete).toBe(true);
      expect(complete.steps.some((step) => step.quest)).toBe(false);

      const missing = resolveGoal(graph, "unlock_1999", newPlayer);
      expect(missing.complete).toBe(false);
      expect(missing.steps.map((step) => step.quest)).toContain("The Duviri Paradox");
    });
  });

  describe("unlock_next_planet", () => {
    it("reports the goal complete once every junction is there", () => {
      const plan = resolveGoal(graph, "unlock_next_planet", veteran);
      expect(plan.complete).toBe(true);
      expect(plan.next).toBeNull();
      expect(plan.junctions).toEqual({ completed: 13, total: 13 });
    });

    it("proposes a single concrete step to a new player", () => {
      const plan = resolveGoal(graph, "unlock_next_planet", newPlayer);
      expect(plan.complete).toBe(false);
      expect(plan.steps).toHaveLength(1);
      expect(plan.next?.label).toBe("Venus");
      expect(plan.next?.reason).toEqual({ kind: "junction", from: "Earth", to: "Venus" });
    });
  });
});
