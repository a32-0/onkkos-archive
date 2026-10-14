import { describe, expect, it } from "vitest";

import { goalsProvenDone, suggestedGoals } from "@/domain/graph/suggest";
import { confirmedQuests } from "@/domain/narrative/evidence";
import type { RawProfile } from "@/domain/types/profile";
import { loadEvidenceRules } from "@/infra/narrative/evidence-load";

import { CY, fixture, NEW_PLAYER, testGraph } from "./helpers";

const graph = testGraph();
const rules = loadEvidenceRules();
const proven = (profile: RawProfile) =>
  goalsProvenDone(graph, profile, confirmedQuests(rules, profile));

describe("goalsProvenDone", () => {
  it("proves nothing for a new player", () => {
    expect(proven(fixture(NEW_PLAYER)).size).toBe(0);
  });

  it("proves the star chart once there is no frontier, and the Hex once the quest is confirmed", () => {
    const done = proven(fixture(CY));
    expect(done.has("unlock_next_planet")).toBe(true);
    expect(done.has("unlock_1999")).toBe(true);
  });

  it("never proves the Necramech, whose parts the profile cannot show", () => {
    expect(proven(fixture(CY)).has("build_necramech")).toBe(false);
  });

  it("reads the Hex from the quest, not from Höllvania's hub", () => {
    const hexOnly: RawProfile = { Affiliations: [{ Tag: "HexSyndicate", Title: 1 }] };
    expect(proven(hexOnly).has("unlock_1999")).toBe(true);
  });
});

describe("suggestedGoals", () => {
  it("offers every goal to a new player, theirs first", () => {
    expect(suggestedGoals(graph, 2)).toEqual([
      "unlock_next_planet",
      "build_necramech",
      "unlock_1999",
    ]);
  });

  it("does not suggest a goal the profile proves done", () => {
    const cy = fixture(CY);
    expect(suggestedGoals(graph, cy.PlayerLevel, proven(cy))).toEqual(["build_necramech"]);
  });
});
