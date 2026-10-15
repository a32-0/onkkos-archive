import { describe, expect, it } from "vitest";

import { resolveGoal } from "@/domain/graph/resolve";
import { confirmedQuests } from "@/domain/narrative/evidence";
import { loadEvidenceRules } from "@/infra/narrative/evidence-load";
import { loadSpine } from "@/infra/narrative/load";
import type { RawProfile } from "@/domain/types/profile";

import { CY, fixture, NEW_PLAYER, testGraph, VETERAN } from "./helpers";

const graph = testGraph();
const spine = loadSpine();
const rules = loadEvidenceRules();
const veteran = fixture(VETERAN);
const newPlayer = fixture(NEW_PLAYER);
const cy = fixture(CY);

const OFF_SPINE = new Set(["Veilbreaker", "Chimera Prologue"]);

const NATARUK = "/Lotus/Weapons/Tenno/Bows/Omicrus/OmicrusPlayerWep";
const PARACESIS = "/Lotus/Weapons/Orokin/BallasSword/BallasSwordWeapon";

describe("quest_evidence.yaml", () => {
  it("every rule cites the wiki and names a quest on the spine", () => {
    const spineQuests = new Set(spine.arcs.flatMap((arc) => arc.quests.map((q) => q.name)));
    for (const rule of rules.rules) {
      expect(rule.source).toMatch(/^https:\/\/wiki\.warframe\.com\//);
      expect(
        spineQuests.has(rule.quest) || OFF_SPINE.has(rule.quest),
        `${rule.quest} is spelled differently from narrative_spine.yaml`,
      ).toBe(true);
    }
  });

  it("every goal's quest and checklist use the same names as the spine", () => {
    const spineQuests = new Set(spine.arcs.flatMap((arc) => arc.quests.map((q) => q.name)));
    for (const goal of Object.values(graph.goals)) {
      for (const quest of [...goal.manualChecklistIfMissing, ...(goal.quest ? [goal.quest] : [])]) {
        expect(spineQuests.has(quest), quest).toBe(true);
      }
    }
  });
});

describe("confirmedQuests", () => {
  it("only confirms: a profile without clues confirms nothing", () => {
    expect(confirmedQuests(rules, newPlayer).size).toBe(0);
    expect(confirmedQuests(rules, {}).size).toBe(0);
  });

  it("reads Cy: operator, syndicates and hubs", () => {
    const confirmed = confirmedQuests(rules, cy);
    expect(confirmed.get("The Second Dream")?.[0]?.via).toBe("flag");
    expect(confirmed.get("The War Within")?.length).toBeGreaterThanOrEqual(2);
    expect(confirmed.get("The New War")?.[0]?.via).toBe("affiliation");
    expect(confirmed.get("Whispers in the Walls")?.map((p) => p.via)).toContain("mission");
    expect(confirmed.get("The Hex")?.[0]?.via).toBe("mission");
  });

  it("accepts any one proof of a quest, it does not require all of them", () => {
    const angels = confirmedQuests(rules, cy).get("Angels of the Zariman");
    expect(angels?.map((p) => p.via)).toEqual(["affiliation"]);
  });

  it("a false flag is not a proof", () => {
    const profile: RawProfile = { UnlockedOperator: false };
    expect(confirmedQuests(rules, profile).has("The Second Dream")).toBe(false);
  });

  it("a played Archwing node confirms The Archwing", () => {
    const proof = confirmedQuests(rules, veteran).get("The Archwing");
    expect(proof?.[0]?.via).toBe("mission_type");
    expect(confirmedQuests(rules, cy).has("The Archwing")).toBe(true);
    expect(confirmedQuests(rules, newPlayer).has("The Archwing")).toBe(false);
  });

  it("an item that only exists as the quest's reward confirms it", () => {
    const profile: RawProfile = {
      LoadOutInventory: { XPInfo: [{ ItemType: NATARUK, XP: 100 }] },
    };
    const confirmed = confirmedQuests(rules, profile);
    expect(confirmed.get("The New War")?.map((p) => p.via)).toEqual(["item"]);
    expect(confirmed.has("The Sacrifice")).toBe(false);
  });

  it("Paracesis proves Chimera Prologue and, with it, The Sacrifice", () => {
    const profile: RawProfile = {
      LoadOutInventory: { XPInfo: [{ ItemType: PARACESIS, XP: 100 }] },
    };
    const confirmed = confirmedQuests(rules, profile);
    expect(confirmed.has("Chimera Prologue")).toBe(true);
    expect(confirmed.get("The Sacrifice")?.[0]?.source).toBe(
      "https://wiki.warframe.com/w/Chimera_Prologue",
    );
  });

  it("Umbra does not prove The Sacrifice: it is handed over before the last mission", () => {
    const umbraOnly: RawProfile = {
      LoadOutInventory: {
        XPInfo: [{ ItemType: "/Lotus/Powersuits/Excalibur/ExcaliburUmbra", XP: 900000 }],
      },
    };
    expect(confirmedQuests(rules, umbraOnly).size).toBe(0);
  });

  it("Cy proves The Sacrifice and The New War through their exclusive items", () => {
    const confirmed = confirmedQuests(rules, cy);
    expect(confirmed.get("The Sacrifice")?.[0]?.via).toBe("item");
    expect(confirmed.get("The New War")?.map((p) => p.via)).toContain("item");
  });
});

describe("resolveGoal with evidence", () => {
  it("turns the checklist into steps: confirmed with proof, the rest manual", () => {
    const withoutHub: RawProfile = { ...cy, Missions: [] };
    const plan = resolveGoal(
      graph,
      "unlock_1999",
      withoutHub,
      {},
      { confirmedQuests: confirmedQuests(rules, withoutHub) },
    );
    expect(plan.complete).toBe(false);

    const whispers = plan.steps.find((s) => s.id === "quest:Whispers in the Walls");
    expect(whispers?.status).toBe("done");
    expect(whispers?.quest).toBe("Whispers in the Walls");

    const duviri = plan.steps.find((s) => s.id === "quest:The Duviri Paradox");
    expect(duviri?.status).toBe("manual");
  });

  it("asks about the whole checklist without evidence", () => {
    const plan = resolveGoal(graph, "unlock_1999", newPlayer);
    const quests = plan.steps.filter((s) => s.id.startsWith("quest:"));
    expect(quests).toHaveLength(4);
    expect(quests.every((s) => s.status === "manual")).toBe(true);
  });
});
