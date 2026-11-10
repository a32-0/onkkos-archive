import { describe, expect, it } from "vitest";

import {
  collectibleStepPlan,
  planLock,
  questStepPlan,
  stepPlan,
  type StepPlan,
} from "@/domain/catalog/checks";
import { collectibleView } from "@/domain/catalog/collectibles";
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
  ["Kuva Sobek", ["Prerequisites", "How to get", "Components"]],
  ["Tenet Tetra", ["Prerequisites", "How to get", "Components"]],
  ["Prisma Gorgon", ["Prerequisites", "How to get", "Components"]],
  ["Gyre Prime", ["Prerequisites", "Blueprints", "Components"]],
  ["Ember Prime", ["Prerequisites", "How to get", "Blueprints", "Components"]],
  ["Ivara Prime", ["Prerequisites", "How to get", "Blueprints", "Components"]],
  ["Chesa Kubrow", ["Prerequisites", "How to get", "Components"]],
  ["Adarza Kavat", ["Prerequisites", "How to get", "Components"]],
  ["Bhaira Hound", ["Prerequisites", "How to get", "Components"]],
  ["Vizier Predasite", ["Prerequisites", "How to get"]],
  ["Vasca Kavat", ["Prerequisites", "How to get", "Components"]],
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
    expect(rows[0]?.detail).toBe("It drops at rotation C, 7.5% a run, so about 1 in 13 runs.");
  });

  it("gives Ash one card per part, each under its header, best odds first (BR-25)", () => {
    const cards = viewOf("Ash").blocks.find((block) => block.title === "Blueprints")?.cards ?? [];
    expect(cards.map((card) => card.header?.title)).toEqual(["Chassis", "Systems", "Neuroptics"]);
    const [first, ...rest] = cards[0]?.groups[0]?.rows ?? [];
    expect(first?.title).toMatch(/^Play .+ \(Highest chance\)$/);
    expect(first?.alternative).toBe(false);
    expect(rest.every((row) => row.alternative && row.title.startsWith("Or play "))).toBe(true);
  });

  it("says how a refined resource is made, and where credits come from", () => {
    const rows = (name: string) =>
      viewOf(name)
        .blocks.find((block) => block.title === "Components")
        ?.cards.flatMap((card) => card.groups.flatMap((group) => group.rows)) ?? [];
    const citrine = rows("Citrine");
    expect(citrine.find((row) => row.title.startsWith("Faceted Tiametrite"))?.detail).toBe(
      "Made in your foundry from 10 Tiametrite and 1,000 Credits.",
    );
    expect(citrine.find((row) => row.title.endsWith("Credits"))?.detail).toBe(
      "Every mission pays them; The Index, on Neptune, pays the most.",
    );
    expect(rows("Koumei").find((row) => row.title.startsWith("Tear Azurite"))?.detail).toMatch(
      /^Made in your foundry from 10 Azurite/,
    );
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
      viewOf("Kuva Sobek").blocks.find((block) => block.title === "How to get")?.cards[0]?.groups[0]
        ?.rows ?? [];
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
      viewOf("Chesa Kubrow").blocks.find((block) => block.title === "How to get")?.cards[0]
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

  it("lists what a quest needs besides quests and junctions", () => {
    const war = data.spine.arcs
      .flatMap((arc) => arc.quests)
      .find((one) => one.name === "The New War");
    if (!war) throw new Error("The New War is not in the spine");
    const view = stepsView(factsOf(questStepPlan(data, war, reader)), war.name, "goal");
    expect(view.blocks.map((block) => block.title)).toEqual(["Prerequisites", "How to get"]);
    const rows = view.blocks[0]?.cards[0]?.groups[0]?.rows ?? [];
    const railjack = rows.find((row) => row.title === "Have a Railjack");
    expect(railjack?.detail).toContain("Rising Tide");
    const amp = rows.find((row) => row.title === "Have an Amp");
    expect(amp?.detail).toContain("Mote Amp");
    const quests = questStepPlan(data, war, reader).sections[0]?.groups[0]?.rows.find((row) =>
      row.id.startsWith("quests:"),
    );
    expect(quests?.id).toContain("Rising Tide");
    const needs = questStepPlan(data, war, reader).sections[0]?.groups[0]?.rows.filter((row) =>
      row.id.startsWith("need:"),
    );
    expect(needs?.map((row) => row.wikiTitle)).toEqual(["Railjack", "Amp"]);
  });
});

describe("a game mode's Step by step (BR-37)", () => {
  const modeOf = (name: string) => {
    const mode = data.spine.modes.find((one) => one.name === name);
    if (!mode) throw new Error(`${name} is not in the spine`);
    return mode;
  };

  it("asks The Steel Path for every node, naming the planet with nodes left", () => {
    const steel = modeOf("The Steel Path");
    const view = stepsView(
      factsOf(questStepPlan(data, steel, { ...reader, placeLeft: "Sedna" })),
      steel.name,
      "goal",
    );
    expect(view.blocks.map((block) => block.title)).toEqual(["Prerequisites", "How to get"]);
    const prerequisites = view.blocks[0]?.cards[0]?.groups[0]?.rows ?? [];
    const chart = prerequisites.find((row) => row.id === "star-chart");
    expect(chart?.title).toBe("Clear every node of the Star Chart");
    expect(chart?.detail).toContain("Sedna still has nodes left.");
    expect(prerequisites.some((row) => row.title === "Complete 7 quests")).toBe(true);
    expect(view.blocks[1]?.cards[0]?.groups[0]?.rows[0]?.title).toBe("Unlock The Steel Path");
  });

  it("waits for Veilbreaker before the Archon Hunt, and says each Archon's Shard once", () => {
    const hunt = modeOf("Archon Hunt");
    const view = stepsView(factsOf(questStepPlan(data, hunt, reader)), hunt.name, "goal");
    const prerequisites = view.blocks[0]?.cards[0]?.groups[0]?.rows ?? [];
    expect(prerequisites.some((row) => row.id.endsWith("Veilbreaker"))).toBe(true);
    const start = view.blocks[1]?.cards[0]?.groups[0]?.rows[0];
    expect(start?.title).toBe("Open the Archon Hunt");
    expect(start?.detail).toContain("Crimson");
    expect(start?.detail).not.toContain("Monday");
  });

  it("gives a Kuva weapon's Lich steps the enemy's own art, for the Overview", () => {
    const how = rowsIn(planOf("Kuva Sobek", 30), "how");
    expect(how.find((row) => row.id === "find")?.imageUrl).toBe(
      "https://wiki.warframe.com/images/Male_Kuva_Larvling.png",
    );
    expect(how.find((row) => row.id === "vanquish")?.imageUrl).toBe(
      "https://wiki.warframe.com/images/KuvaLiches.jpg",
    );
  });
});

describe("similar prerequisites share one row", () => {
  const hex = data.spine.arcs.flatMap((arc) => arc.quests).find((one) => one.name === "The Hex");

  it("gathers The Hex's quests and Junctions into one row each, in order", () => {
    if (!hex) throw new Error("The Hex is not in the spine");
    const rows = questStepPlan(data, hex, reader).sections[0]?.groups[0]?.rows ?? [];
    const quests = rows.filter((row) => row.id.startsWith("quests:"));
    const junctions = rows.filter((row) => row.id.startsWith("junctions:"));
    expect(quests).toHaveLength(1);
    expect(junctions).toHaveLength(1);
    expect(rows.some((row) => row.id.startsWith("quest:") || row.id.startsWith("junction:"))).toBe(
      false,
    );
    expect(quests[0]?.title).toEqual({ say: "questsTitle", count: 12 });
    expect(quests[0]?.id.split("|").at(-1)).toBe("The Lotus Eaters");
  });

  it("drops a Reach row its Junction already names", () => {
    const war = data.spine.arcs
      .flatMap((arc) => arc.quests)
      .find((one) => one.name === "The War Within");
    if (!war) throw new Error("The War Within is not in the spine");
    const ids = (questStepPlan(data, war, reader).sections[0]?.groups[0]?.rows ?? []).map(
      (row) => row.id,
    );
    expect(ids).not.toContain("place:Pluto");
    expect(ids).not.toContain("place:Sedna");
  });

  it("titles a gathered row by its count", () => {
    const view = viewOf("Kuva Sobek");
    const titles = view.blocks[0]?.cards[0]?.groups[0]?.rows.map((row) => row.title) ?? [];
    expect(titles).toContain("Clear 4 Junctions");
    expect(titles).toContain("Complete 4 quests");
  });
});

describe("places to reach share one row", () => {
  it("gathers Ash's three Proxima into one Reach row", () => {
    const titles = viewOf("Ash").blocks[0]?.cards[0]?.groups[0]?.rows.map((row) => row.title) ?? [];
    expect(titles).toContain("Reach 3 places");
    expect(titles.filter((title) => title.startsWith("Reach "))).toHaveLength(1);
  });
});

function collectiblePlanOf(name: string): StepPlan {
  const found = data.collectibles.get(name);
  if (!found) throw new Error(`${name} is not in the collection`);
  const none = new Set<string>();
  return collectibleStepPlan(data, collectibleView(data, found, none, none), reader);
}

function rowsIn(plan: StepPlan, id: string) {
  return plan.sections.find((one) => one.id === id)?.groups.flatMap((group) => group.rows) ?? [];
}

describe("a collection item reads like an item (spec 10, BR-72)", () => {
  it("leads a resource any mission drops with its planets, four ways at most", () => {
    const how = rowsIn(collectiblePlanOf("Ferrite"), "how");
    expect(how[0]?.title).toEqual({ say: "anyMissionTitle", place: "Mercury" });
    expect(how.length).toBeLessThanOrEqual(4);
    expect(how.slice(1).every((row) => row.alternative)).toBe(true);
  });

  it("says where a built resource's blueprint comes from before the foundry", () => {
    const plan = collectiblePlanOf("Fieldron");
    const says = rowsIn(plan, "how").map((row) => row.title.say);
    expect(says.indexOf("researchTitle")).toBeLessThan(says.indexOf("foundryTitle"));
    expect(rowsIn(plan, "components").length).toBeGreaterThan(0);
  });

  it("gives a relic one node a row, its rotations joined", () => {
    const how = rowsIn(collectiblePlanOf("Axi A21 Relic"), "how");
    expect(how[0]?.title).toEqual({ say: "playTitle", node: "Cerberus" });
    expect(
      how.every((row) => row.title.say !== "playTitle" || !row.title.node.includes(", ")),
    ).toBe(true);
    expect(how[0]?.detail).toEqual([
      { say: "odds", rotation: "B–C", stage: null, chance: 14.29, runs: 7, unit: "run" },
    ]);
  });

  it("lists no recipe for a resource that drops and has no blueprint to buy", () => {
    const plan = collectiblePlanOf("Control Module");
    expect(rowsIn(plan, "components")).toEqual([]);
    expect(rowsIn(plan, "how").map((row) => row.title.say)).not.toContain("foundryTitle");
  });

  it("sends an Archon's shard to the weekly Archon Hunt, Veilbreaker first", () => {
    const plan = collectiblePlanOf("Archon Amar's Shard");
    expect(rowsIn(plan, "how")[0]?.title).toEqual({
      say: "weeklyTitle",
      mission: "the Archon Hunt",
    });
    const quests = rowsIn(plan, "prerequisites").find((row) => row.id.startsWith("quests:"));
    expect(quests?.id.split("|").at(-1)).toBe("Veilbreaker");
  });

  it("shows art on Blueprints and Components only (BR-85)", () => {
    const view = viewOf("Dante");
    for (const block of view.blocks) {
      const rows = block.cards.flatMap((card) => card.groups.flatMap((group) => group.rows));
      const pictured = block.key === "blueprints" || block.key === "components";
      expect(rows.every((row) => "art" in row === pictured)).toBe(true);
    }
  });

  it("keeps a drop from an enemy as the fourth way, read per kill", () => {
    const how = rowsIn(collectiblePlanOf("Fast Hands"), "how");
    expect(how).toHaveLength(4);
    const fourth = how[3];
    expect(fourth?.title).toEqual({ say: "defeatTitle", source: "Grineer Manic" });
    expect(fourth?.detail).toEqual([
      { say: "odds", rotation: null, stage: null, chance: 9.48, runs: 11, unit: "kill" },
    ]);
  });

  it("leaves out an enemy under 0.5% when missions fill the list", () => {
    const how = rowsIn(collectiblePlanOf("Blackout Pulse"), "how");
    expect(how.map((row) => row.title.say)).not.toContain("defeatTitle");
  });

  it("reads a table with rotations as something to play, never to defeat", () => {
    const how = rowsIn(collectiblePlanOf("Point Blank"), "how");
    const says = how.map((row) => JSON.stringify(row.title));
    expect(says.some((one) => one.includes("Sunkiller") && one.includes("defeatTitle"))).toBe(
      false,
    );
  });

  it("answers the endgame items no drop table lists", () => {
    const first = (name: string) => rowsIn(collectiblePlanOf(name), "how")[0]?.title.say;
    expect(first("Legendary Core")).toBe("weeklyTitle");
    expect(first("Azure Archon Shard")).toBe("weeklyTitle");
    expect(first("Tauforged Violet Archon Shard")).toBe("weeklyTitle");
    expect(first("Primed Flow")).toBe("baroTitle");
    expect(first("Primed Vigor")).toBe("tributeTitle");
    expect(first("Deconstructor")).toBe("bundledTitle");
    expect(first("Apoc Mk I")).toBe("defeatTitle");
    for (const name of ["Ekwana Jai", "Adlet Core", "Cryotra"]) {
      expect(data.collectibles.has(name)).toBe(true);
    }
  });

  it("trades for a vaulted relic, then visits Baro", () => {
    const says = rowsIn(collectiblePlanOf("Axi A2 Relic"), "how").map((row) => row.title.say);
    expect(says).toEqual(["tradePlayerTitle", "baroTitle"]);
  });
});

describe("a drop table's label is never a place to go (BR-74)", () => {
  it("names the Circuit for Duviri's Endless tiers, the tier in the detail", () => {
    const how = rowsIn(planOf("Bronco"), "how");
    expect(how[0]?.title).toEqual({ say: "circuitModeTitle", mode: "normal" });
    expect(how[0]?.detail).toEqual([{ say: "endlessDetail", tiers: [6], chance: 1.03, runs: 97 }]);
    expect(how[0]?.wikiTitle).toBe("The Circuit");
  });
});
