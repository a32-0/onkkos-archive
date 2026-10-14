import { describe, expect, it } from "vitest";

import { evaluateCheck, readField } from "@/domain/graph/evaluate";
import { parseFieldPath, type Check } from "@/domain/graph/schema";

import { fixture, NEW_PLAYER, testGraph, VETERAN } from "./helpers";

const graph = testGraph();
const veteran = fixture(VETERAN);
const newPlayer = fixture(NEW_PLAYER);

describe("readField", () => {
  it("extracts one property from every array element", () => {
    const tags = readField(veteran, parseFieldPath("Missions[].Tag"));
    expect(Array.isArray(tags)).toBe(true);
    expect(tags).toContain("DeimosHub");
  });

  it("returns a scalar as is", () => {
    expect(readField(veteran, parseFieldPath("PlayerLevel"))).toBe(27);
  });

  it("returns undefined when the field does not exist", () => {
    expect(readField(newPlayer, parseFieldPath("DoesNotExist"))).toBeUndefined();
  });
});

describe("evaluateCheck: array-contains", () => {
  it("detects a present hub", () => {
    const node = graph.nodes["planet_deimos"]!;
    expect(evaluateCheck(node.check, veteran).status).toBe("done");
  });

  it("detects a missing hub", () => {
    const node = graph.nodes["hub_1999"]!;
    expect(evaluateCheck(node.check, newPlayer).status).toBe("todo");
  });
});

describe("evaluateCheck: array-where", () => {
  it("passes when the syndicate meets the rank", () => {
    const node = graph.nodes["entrati_rank_2"]!;
    expect(evaluateCheck(node.check, veteran).status).toBe("done");
  });

  it("gives 'todo', not a crash, when the syndicate is missing from the profile", () => {
    const node = graph.nodes["entrati_rank_2"]!;
    expect(evaluateCheck(node.check, newPlayer)).toEqual({
      status: "todo",
      reason: { kind: "not-joined" },
    });
  });

  it("gives 'todo' with the gap when the syndicate sits below the rank", () => {
    const lowRank = {
      Affiliations: [{ Tag: "EntratiSyndicate", Standing: 100, Title: 1 }],
    };
    const node = graph.nodes["entrati_rank_2"]!;
    expect(evaluateCheck(node.check, lowRank)).toEqual({
      status: "todo",
      reason: { kind: "rank", tree: null, actual: 1, target: 2 },
    });
  });

  it("does not pass a negative rank (adverse standing)", () => {
    const adverse = {
      Affiliations: [{ Tag: "EntratiSyndicate", Standing: -71000, Title: -2 }],
    };
    const node = graph.nodes["entrati_rank_2"]!;
    expect(evaluateCheck(node.check, adverse).status).toBe("todo");
  });
});

describe("evaluateCheck: manual", () => {
  it("returns the question instead of inventing a result", () => {
    const node = graph.nodes["necramech_components"]!;
    const outcome = evaluateCheck(node.check, veteran);
    expect(outcome.status).toBe("manual");
    if (outcome.status === "manual") {
      expect(outcome.question).toMatch(/Necramech/);
    }
  });
});

describe("evaluateCheck: scalar with a parameter", () => {
  const check: Check = {
    kind: "scalar",
    path: parseFieldPath("PlayerLevel"),
    op: ">=",
    value: "{target_rank}",
  };

  it("compares PlayerLevel against the target given", () => {
    expect(evaluateCheck(check, veteran, { target_rank: 20 }).status).toBe("done");
    expect(evaluateCheck(check, veteran, { target_rank: 30 }).status).toBe("todo");
    expect(evaluateCheck(check, veteran, { target_rank: 27 }).status).toBe("done");
  });

  it("accepts the parameter as a numeric string", () => {
    expect(evaluateCheck(check, veteran, { target_rank: "20" }).status).toBe("done");
  });

  it("reads the gap as Mastery Rank", () => {
    expect(evaluateCheck(check, veteran, { target_rank: 30 })).toEqual({
      status: "todo",
      reason: { kind: "mastery", actual: 27, target: 30 },
    });
  });
});

describe("evaluateCheck: scalar with a placeholder in the field", () => {
  const check: Check = {
    kind: "scalar",
    path: parseFieldPath("PlayerSkills.{tree}"),
    op: ">=",
    value: "{target_rank}",
  };
  const withIntrinsics = {
    PlayerSkills: { LPS_PILOTING: 7, LPS_DRIFT_RIDING: 3 },
  };

  it("reads the property named by the 'tree' parameter", () => {
    if (check.kind !== "scalar") throw new Error("a scalar check");
    expect(readField(withIntrinsics, check.path, { tree: "LPS_PILOTING" })).toBe(7);
  });

  it("passes when the chosen tree's rank meets the target", () => {
    const outcome = evaluateCheck(check, withIntrinsics, {
      tree: "LPS_PILOTING",
      target_rank: 5,
    });
    expect(outcome.status).toBe("done");
  });

  it("gives 'todo' when the chosen tree falls short, naming the tree", () => {
    expect(
      evaluateCheck(check, withIntrinsics, { tree: "LPS_DRIFT_RIDING", target_rank: 5 }),
    ).toEqual({
      status: "todo",
      reason: { kind: "rank", tree: "LPS_DRIFT_RIDING", actual: 3, target: 5 },
    });
  });

  it("gives 'todo', not a crash, when the profile has no PlayerSkills", () => {
    const outcome = evaluateCheck(check, newPlayer, {
      tree: "LPS_PILOTING",
      target_rank: 1,
    });
    expect(outcome.status).toBe("todo");
  });
});
