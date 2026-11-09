import { describe, expect, it } from "vitest";

import { goalsProvenDone, goalsWaiting, suggestedGoals } from "@/domain/graph/suggest";
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

  it("proves The Steel Path from a node cleared on it, and nothing less", () => {
    expect(proven({ Missions: [{ Tag: "SolNode1", Completes: 3 }] }).has("unlock_steel_path")).toBe(
      false,
    );
    expect(
      proven({ Missions: [{ Tag: "SolNode1", Completes: 3, Tier: 1 }] }).has("unlock_steel_path"),
    ).toBe(true);
  });

  it("proves Jade Shadows: Constellations from its Honoria, and Jade Shadows with it", () => {
    const titled: RawProfile = {
      ChallengeProgress: [{ Name: "JadeShadows2TitleChallenge", Progress: 1 }],
    };
    expect(proven(titled).has("play_constellations")).toBe(true);
    expect(proven(titled).has("play_jade_shadows")).toBe(true);
    expect(
      proven({ ChallengeProgress: [{ Name: "JadeShadows2TitleChallenge", Progress: 0 }] }).has(
        "play_constellations",
      ),
    ).toBe(false);
  });

  it("proves a Kuva Lich from the title for vanquishing one", () => {
    expect(
      proven({ ChallengeProgress: [{ Name: "LichKillerTitleChallenge", Progress: 1 }] }).has(
        "hunt_kuva_lich",
      ),
    ).toBe(true);
  });

  it("reads the Hex from the quest, not from Höllvania's hub", () => {
    const hexOnly: RawProfile = { Affiliations: [{ Tag: "HexSyndicate", Title: 1 }] };
    expect(proven(hexOnly).has("unlock_1999")).toBe(true);
  });
});

describe("goalsWaiting (BR-86)", () => {
  const offered = (profile: RawProfile) => {
    const quests = confirmedQuests(rules, profile);
    const done = goalsProvenDone(graph, profile, quests);
    const hidden = new Set([...done, ...goalsWaiting(graph, profile, quests, done)]);
    return suggestedGoals(graph, profile.PlayerLevel, hidden);
  };

  it("offers a new player only the next planet", () => {
    expect(offered(fixture(NEW_PLAYER))).toEqual(["unlock_next_planet"]);
  });

  it("offers Cy only the walls the profile cannot yet prove", () => {
    expect(offered(fixture(CY))).toEqual([
      "build_necramech",
      "play_constellations",
      "hunt_kuva_lich",
    ]);
  });

  it("waits for the Mastery Rank a wall asks for", () => {
    const quills = (rank: number): RawProfile => ({
      PlayerLevel: rank,
      Affiliations: [{ Tag: "QuillsSyndicate", Title: 1 }],
    });
    expect(offered(quills(4))).not.toContain("hunt_kuva_lich");
    expect(offered(quills(5))).toContain("hunt_kuva_lich");
  });

  it("opens The New War and a Kuva Lich after The War Within", () => {
    const before = offered({ PlayerLevel: 9 });
    expect(before).not.toContain("play_new_war");
    expect(before).not.toContain("hunt_kuva_lich");
    const after = offered({ PlayerLevel: 9, Affiliations: [{ Tag: "QuillsSyndicate", Title: 1 }] });
    expect(after).toContain("play_new_war");
    expect(after).toContain("hunt_kuva_lich");
  });

  it("offers a wall only once the one before it is done", () => {
    const quests = confirmedQuests(rules, {});
    const waiting = (done: string[]) => goalsWaiting(graph, {}, quests, new Set(done));
    expect(waiting([]).has("play_jade_shadows")).toBe(true);
    expect(waiting([]).has("hunt_archon")).toBe(true);
    expect(waiting(["play_new_war"]).has("play_jade_shadows")).toBe(false);
    expect(waiting(["play_new_war"]).has("hunt_archon")).toBe(false);
    expect(waiting(["play_new_war"]).has("play_constellations")).toBe(true);
    expect(waiting(["play_jade_shadows"]).has("play_constellations")).toBe(false);
    expect(waiting([]).has("unlock_steel_path")).toBe(true);
    expect(waiting(["unlock_next_planet"]).has("unlock_steel_path")).toBe(false);
  });
});
