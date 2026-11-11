import { describe, expect, it } from "vitest";

import { provenPlan, stepPlan, type Proof, type StepPlan } from "@/domain/catalog/checks";
import { dossier } from "@/domain/catalog/dossier";
import { everyPlan } from "@/domain/catalog/every-plan";
import { confirmedQuests } from "@/domain/narrative/evidence";
import { readReach } from "@/domain/place/reach";
import type { RawProfile } from "@/domain/types/profile";
import { loadEvidenceRules } from "@/infra/narrative/evidence-load";

import { fixture, testData, testGraph } from "./helpers";

const data = testData();
const graph = testGraph();

function proofOf(profile: RawProfile): Proof {
  const reach = readReach(graph, profile);
  return {
    places: reach.places,
    clan: reach.clan,
    intrinsics: profile.PlayerSkills ?? {},
    standing: new Map((profile.Affiliations ?? []).map((one) => [one.Tag, one.Title ?? 0])),
  };
}

function prerequisites(plan: StepPlan) {
  return plan.sections.find((one) => one.id === "prerequisites")?.groups[0]?.rows ?? [];
}

function planFor(name: string, profile: RawProfile): StepPlan {
  const item = data.arsenal.find((one) => one.name === name);
  if (!item) throw new Error(`${name} is not in the catalog`);
  const reach = readReach(graph, profile);
  const done = new Set(confirmedQuests(loadEvidenceRules(), profile).keys());
  const reader = { now: 0, masteryRank: reach.rank ?? undefined, done };
  return provenPlan(data, stepPlan(data, dossier(item, data.arsenal), reader), proofOf(profile));
}

describe("prerequisites the profile proves (BR-88)", () => {
  const cy = fixture("profile-cy");

  it("marks the places a profile reached, and puts them first", () => {
    const rows = prerequisites(planFor("Ivara", cy));
    const places = rows.find((row) => row.id.startsWith("places:"));
    expect(places?.done).toBe(true);
    const firstOpen = rows.findIndex((row) => !row.done);
    expect(rows.slice(firstOpen).every((row) => !row.done)).toBe(true);
    expect(rows.find((row) => row.id === "slot")?.done).toBe(false);
  });

  it("marks Mars reached for Excalibur, and leaves the slot open", () => {
    const rows = prerequisites(planFor("Excalibur", cy));
    expect(rows.find((row) => row.id === "place:Mars")?.done).toBe(true);
    expect(rows.find((row) => row.id === "slot")?.done).toBe(false);
  });

  it("reads Intrinsics only when every Railjack discipline reaches the rank", () => {
    const rows = prerequisites(planFor("Ivara", cy));
    expect(rows.find((row) => row.id === "intrinsics:5")?.done).toBe(false);
    const maxed = {
      ...cy,
      PlayerSkills: {
        LPS_PILOTING: 10,
        LPS_GUNNERY: 10,
        LPS_TACTICAL: 10,
        LPS_ENGINEERING: 10,
        LPS_COMMAND: 10,
      },
    };
    expect(
      prerequisites(planFor("Ivara", maxed)).find((row) => row.id === "intrinsics:5")?.done,
    ).toBe(true);
  });

  it("marks a syndicate rank by the title the profile holds", () => {
    const reader = { now: 0, masteryRank: 30 };
    const ranked = everyPlan(data, new Set(), reader)
      .map(({ plan }) => plan)
      .find((plan) => prerequisites(plan).some((row) => row.id === "rank:Red Veil"));
    if (!ranked) throw new Error("no plan asks for a Red Veil rank");
    const at = (title: number) =>
      prerequisites(
        provenPlan(data, ranked, {
          places: null,
          clan: false,
          intrinsics: {},
          standing: new Map([["RedVeilSyndicate", title]]),
        }),
      ).find((row) => row.id === "rank:Red Veil")?.done;
    expect(at(5)).toBe(true);
    expect(at(0)).toBe(false);
  });

  it("proves nothing for a new player", () => {
    const rows = prerequisites(planFor("Excalibur", fixture("profile-new-player")));
    expect(rows.find((row) => row.id === "place:Mars")?.done).toBe(false);
  });

  it("marks Rising Tide after The New War, Vor's Prize after a Junction, Saya's Vigil with Gara owned", () => {
    const ayanga = prerequisites(planFor("Kuva Ayanga", cy));
    const quests = ayanga.find((row) => row.id.startsWith("quests:"));
    expect(quests?.id).toContain("Rising Tide");
    expect(quests?.done).toBe(true);
    const gara = prerequisites(planFor("Gara", cy));
    expect(gara.find((row) => row.id.includes("Vor's Prize"))?.done).toBe(true);
    expect(gara.find((row) => row.id.includes("Saya's Vigil"))?.done).toBe(true);
  });

  it("reads The Hex rank from the profile", () => {
    const reader = { now: 0, masteryRank: 30 };
    const ranked = everyPlan(data, new Set(), reader)
      .map(({ plan }) => plan)
      .find((plan) => prerequisites(plan).some((row) => row.id === "rank:Amir"));
    if (!ranked) throw new Error("no plan asks for a rank with Amir");
    const row = provenPlan(data, ranked, {
      places: null,
      clan: false,
      intrinsics: {},
      standing: new Map([["HexSyndicate", 5]]),
    });
    expect(prerequisites(row).find((one) => one.id === "rank:Amir")?.done).toBe(true);
  });
});

describe("rows that are not quests", () => {
  const cy = fixture("profile-cy");
  const ids = (name: string) => prerequisites(planFor(name, cy)).map((row) => row.id);

  it("never asks to complete something that is not a quest", () => {
    for (const name of ["Azima", "Hydroid", "Trinity", "Vitrica", "Saryn"]) {
      expect(ids(name).some((id) => id.startsWith("quest:"))).toBe(false);
    }
  });

  it("reads a node's Mastery Rank as the Mastery row and a count of a thing as Acquire", () => {
    const hydroid = prerequisites(planFor("Hydroid", cy));
    expect(hydroid[0]?.title).toEqual({ say: "masteryTitle", rank: 5 });
    expect(ids("Trinity")).toContain("acquire:Animo Nav Beacon");
    expect(ids("Saryn")).toContain("acquire:Judgement Points");
  });

  it("names Prelude to War for Erra, one of its parts", () => {
    const quests = ids("Shedu").find((id) => id.startsWith("quests:"));
    expect(quests).toContain("Prelude to War");
    expect(quests).not.toContain("Erra");
  });
});
