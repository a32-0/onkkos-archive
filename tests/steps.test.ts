import { describe, expect, it } from "vitest";

import { planLock, questStepPlan, stepPlan, type StepPlan } from "@/domain/catalog/checks";
import { dossier } from "@/domain/catalog/dossier";
import type { Reach } from "@/domain/place/reach";
import type { StepsFacts } from "@/screens/item/steps/state";
import { stepsView } from "@/screens/item/steps/view";

import { testData } from "./helpers";

const data = testData();
const reader = { now: Date.UTC(2026, 9, 3), masteryRank: 10 };

function planOf(name: string, rank = 10): StepPlan {
  const item = data.arsenal.find((entry) => entry.name === name);
  if (!item) throw new Error(`${name} is not in the catalog`);
  return stepPlan(data, dossier(item, data.arsenal), { ...reader, masteryRank: rank });
}

function factsOf(plan: StepPlan, lock: StepsFacts["lock"] = null): StepsFacts {
  return {
    sections: plan.sections.map((section) => ({
      ...section,
      groups: section.groups.map((group) => ({
        title: group.title,
        rows: group.rows.map((row) => ({ ...row, prose: null, wikiUrl: null })),
      })),
    })),
    lock,
  };
}

function viewOf(name: string) {
  return stepsView(factsOf(planOf(name)), name, "goal");
}

function reach(rank: number | null): Reach {
  return { places: null, measured: new Set(), junction: null, rank, clan: true };
}

const SCENARIOS: [string, string[]][] = [
  ["Dante", ["Prerequisites", "How to get", "Blueprints", "Components"]],
  ["Ash", ["Prerequisites", "Blueprints", "Components"]],
  ["Ember", ["Prerequisites", "How to get", "Blueprints", "Components"]],
  ["Gyre", ["Prerequisites", "How to get", "Blueprints", "Components"]],
  ["Nezha", ["Prerequisites", "How to get", "Blueprints", "Components"]],
  ["Kuva Sobek", ["Prerequisites", "Acquisition", "Components"]],
  ["Tenet Tetra", ["Prerequisites", "Acquisition", "Components"]],
  ["Prisma Gorgon", ["Prerequisites", "Acquisition", "Components"]],
  ["Gyre Prime", ["Prerequisites", "Blueprints", "Components"]],
  ["Ember Prime", ["Prerequisites", "How to get", "Blueprints", "Components"]],
  ["Ivara Prime", ["Prerequisites", "How to get", "Blueprints", "Components"]],
  ["Chesa Kubrow", ["Prerequisites", "Acquisition", "Components"]],
  ["Adarza Kavat", ["Prerequisites", "Acquisition", "Components"]],
  ["Bhaira Hound", ["Prerequisites", "Acquisition", "Components"]],
  ["Vizier Predasite", ["Prerequisites", "Acquisition"]],
  ["Vasca Kavat", ["Prerequisites", "Acquisition", "Components"]],
];

describe("Step by step draws each scenario as its frame does (spec 10)", () => {
  it.each(SCENARIOS)("gives %s its sections in order", (name, titles) => {
    expect(viewOf(name).blocks.map((block) => block.title)).toEqual(titles);
  });

  it("gives Dante one flat Blueprints card with the parts' art", () => {
    const blueprints = viewOf("Dante").blocks.find((block) => block.title === "Blueprints");
    expect(blueprints?.cards).toHaveLength(1);
    expect(blueprints?.cards[0]?.header).toBeNull();
    const rows = blueprints?.cards[0]?.groups[0]?.rows ?? [];
    expect(rows.map((row) => row.title)).toEqual(["Blueprint", "Chassis", "Neuroptics", "Systems"]);
    expect(rows.every((row) => typeof row.art === "string")).toBe(true);
    expect(rows[0]?.detail).toBe(
      "It drops at rotation C, 7.5% a run, so about 13 runs for an even chance.",
    );
  });

  it("gives Ash one card per part, each under its header, best odds first (BR-25)", () => {
    const cards = viewOf("Ash").blocks.find((block) => block.title === "Blueprints")?.cards ?? [];
    expect(cards.map((card) => card.header?.title)).toEqual(["Chassis", "Systems", "Neuroptics"]);
    const [first, ...rest] = cards[0]?.groups[0]?.rows ?? [];
    expect(first?.title).toMatch(/^Play .+ \(Highest chance\)$/);
    expect(first?.alternative).toBe(false);
    expect(rest.every((row) => row.alternative && row.title.startsWith("Or play "))).toBe(true);
  });

  it("closes Ember's Prerequisites with the bought blueprint", () => {
    const rows = viewOf("Ember").blocks[0]?.cards[0]?.groups[0]?.rows ?? [];
    expect(rows.at(-1)?.title).toBe("Buy the Ember Blueprint");
  });

  it("reads a part's relics as Open, then Or, with Vaulted (BR-49)", () => {
    const rows =
      viewOf("Gyre Prime").blocks.find((block) => block.title === "Blueprints")?.cards[0]?.groups[0]
        ?.rows ?? [];
    expect(rows[0]?.title).toMatch(/^Open \w+ \w+ Relic/);
    expect(rows.slice(1).every((row) => /^Or \w+ \w+ Relic/.test(row.title))).toBe(true);
    expect(rows.some((row) => row.title.endsWith("(Vaulted)"))).toBe(true);
  });

  it("lets a Kuva weapon's trade continue the row above, with no diamond", () => {
    const rows =
      viewOf("Kuva Sobek").blocks.find((block) => block.title === "Acquisition")?.cards[0]
        ?.groups[0]?.rows ?? [];
    expect(rows.at(-1)?.title).toBe("Or trade for a converted Kuva Lich");
    expect(rows.at(-1)?.alternative).toBe(true);
  });

  it("ticks only Components and splits them into their groups (BR-24)", () => {
    const cards = viewOf("Dante").blocks.flatMap((block) => block.cards);
    expect(cards.filter((card) => card.checkable).map((card) => card.key)).toEqual(["components"]);
    const groups = cards.find((card) => card.checkable)?.groups ?? [];
    expect(groups).toHaveLength(2);
  });

  it("keeps an optional step's mark once", () => {
    const rows =
      viewOf("Chesa Kubrow").blocks.find((block) => block.title === "Acquisition")?.cards[0]
        ?.groups[0]?.rows ?? [];
    expect(rows.filter((row) => row.title.includes("(Optional)"))).not.toHaveLength(0);
    expect(rows.every((row) => !row.title.includes("(Optional) (Optional)"))).toBe(true);
  });
});

describe("every row of every plan has its words and its own key", () => {
  it("titles every row, and gives every detail words", () => {
    const silent: string[] = [];
    for (const item of data.arsenal) {
      const view = stepsView(
        factsOf(stepPlan(data, dossier(item, data.arsenal), reader)),
        item.name,
        "goal",
      );
      for (const block of view.blocks) {
        if (block.title === "") silent.push(`${item.name}: a section`);
        for (const card of block.cards) {
          for (const row of card.groups.flatMap((group) => group.rows)) {
            if (row.title === "" || row.title.includes("undefined")) {
              silent.push(`${item.name}: ${row.id}`);
            }
            if (row.detail?.includes("undefined") || row.detail?.includes("null")) {
              silent.push(`${item.name}: ${row.id} detail`);
            }
          }
        }
      }
    }
    expect(silent).toEqual([]);
  });

  it("gives every section, row and anchor of a plan its own key", () => {
    const clashes: string[] = [];
    for (const item of data.arsenal) {
      const plan = stepPlan(data, dossier(item, data.arsenal), reader);
      const sections = plan.sections.map((section) => section.id);
      const rows = plan.sections.flatMap((section) =>
        section.groups.flatMap((group) => group.rows.map((row) => row.id)),
      );
      const view = stepsView(factsOf(plan), item.name, "goal");
      const anchors = view.blocks.flatMap((block) =>
        block.cards.flatMap((card) =>
          [
            card.anchor,
            ...card.groups.flatMap((group) => group.rows.map((row) => row.anchor)),
          ].filter((anchor) => anchor !== null),
        ),
      );
      for (const [what, ids] of [
        ["section", sections],
        ["row", rows],
        ["anchor", anchors],
      ] as const) {
        if (new Set(ids).size !== ids.length) clashes.push(`${item.name}: ${what}`);
      }
    }
    expect(clashes).toEqual([]);
  });
});

describe("a plan dims what waits on an unmet prerequisite (BR-63)", () => {
  it("keeps Kuva Sobek's Mastery Rank row at full contrast with its gap, and locks the rest", () => {
    const plan = planOf("Kuva Sobek", 5);
    const lock = planLock(plan, reach(5));
    expect(lock?.row).toBe("mastery");
    const view = stepsView(factsOf(plan, lock), "Kuva Sobek", "goal");
    const rows = view.blocks.flatMap((block) =>
      block.cards.flatMap((card) => card.groups.flatMap((group) => group.rows)),
    );
    expect(rows[0]?.locked).toBe(false);
    expect(rows[0]?.detail).toBe("Needs Mastery Rank 15. You are Mastery Rank 5.");
    expect(rows.slice(1).every((row) => row.locked)).toBe(true);
  });

  it("locks nothing when the profile gives no Mastery Rank", () => {
    expect(planLock(planOf("Kuva Sobek"), reach(null))).toBeNull();
  });

  it("locks nothing for a quest the profile cannot read", () => {
    const plan = planOf("Dante", 30);
    expect(planLock(plan, reach(30))).toBeNull();
  });
});

describe("a quest's Step by step (BR-37)", () => {
  const quest = data.spine.arcs
    .flatMap((arc) => arc.quests)
    .find((one) => one.name === "The Second Dream");

  it("lists the quests before it, and where it starts", () => {
    if (!quest) throw new Error("The Second Dream is not in the spine");
    const plan = questStepPlan(data, quest, reader);
    const view = stepsView(factsOf(plan), quest.name, "goal");
    expect(view.blocks.map((block) => block.title)).toEqual(["Prerequisites", "How to get"]);
    const prerequisites = view.blocks[0]?.cards[0]?.groups[0]?.rows ?? [];
    expect(prerequisites.some((row) => row.title === "Complete Natah")).toBe(true);
    const start = view.blocks[1]?.cards[0]?.groups[0]?.rows[0];
    expect(start?.title).toBe("Start The Second Dream");
    expect(start?.detail).toBe(quest.start);
  });
});
