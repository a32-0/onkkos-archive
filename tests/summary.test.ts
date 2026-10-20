import { describe, expect, it } from "vitest";

import { stepPlan, type Part } from "@/domain/catalog/checks";
import { dossier } from "@/domain/catalog/dossier";
import { briefOf } from "@/domain/catalog/summary";

import { testData } from "./helpers";

const data = testData();
const reader = { now: Date.UTC(2026, 9, 3), masteryRank: 10 };

function planOf(name: string) {
  const item = data.arsenal.find((entry) => entry.name === name);
  if (!item) throw new Error(`${name} is not in the catalog`);
  return stepPlan(data, dossier(item, data.arsenal), reader);
}

function runsIn(parts: readonly Part[]): number[] {
  return parts.flatMap((part) =>
    typeof part !== "string" &&
    (part.say === "odds" || part.say === "oddsBrief") &&
    part.runs !== null
      ? [part.runs]
      : [],
  );
}

describe("the item's Summary (BR-55)", () => {
  it("is Blueprints and Components, never Prerequisites or How to get", () => {
    for (const name of ["Mesa", "Nyx Prime", "Athodai", "Voidrig"]) {
      const blocks = briefOf(planOf(name));
      expect(blocks.length, name).toBeGreaterThan(0);
      expect(blocks.every((block) => block.id === "blueprints" || block.id === "components")).toBe(
        true,
      );
    }
  });

  it("gives each blueprint one row, with its best route", () => {
    const plan = planOf("Nyx Prime");
    const blueprints = briefOf(plan).find((block) => block.id === "blueprints");
    const sections = plan.sections.filter((section) => section.id.startsWith("part:"));
    expect(blueprints?.lines.map((line) => line.id)).toEqual(sections.map((section) => section.id));
    for (const line of blueprints?.lines ?? []) {
      const section = sections.find((one) => one.id === line.id);
      const first = section?.groups[0]?.rows[0];
      expect(line.route).toEqual(first?.title);
      expect(line.more).toBe((section?.groups[0]?.rows.length ?? 1) - 1);
    }
  });

  it("falls back to How to get or Acquisition when an item has neither", () => {
    const bare = data.arsenal.filter((item) => item.recipe === null);
    expect(bare.length).toBeGreaterThan(0);
    let fellBack = 0;
    for (const item of bare) {
      const plan = stepPlan(data, dossier(item, data.arsenal), reader);
      const blocks = briefOf(plan);
      const how = plan.sections.find((section) => section.id === "how");
      const rich = plan.sections.some(
        (section) =>
          section.id === "blueprints" || section.id.startsWith("part:") || section.checkable,
      );
      if (rich || !how) continue;
      fellBack += 1;
      expect(blocks.map((block) => block.id)).toEqual(["how"]);
      expect(blocks[0]?.title).toEqual(how.title);
    }
    expect(fellBack).toBeGreaterThan(0);
  });
});

describe("the gold line reads in runs (BR-56)", () => {
  it("gives a drop's Summary row the same runs as its Step by step detail", () => {
    let compared = 0;
    for (const name of ["Athodai", "Mesa", "Hydroid", "Nekros", "Akbolto"]) {
      const plan = planOf(name);
      for (const line of briefOf(plan).find((block) => block.id === "blueprints")?.lines ?? []) {
        const section = plan.sections.find((one) => one.id === line.id);
        const first =
          section?.groups[0]?.rows[0] ??
          plan.sections
            .find((one) => one.id === "blueprints")
            ?.groups.flatMap((group) => group.rows)
            .find((row) => row.id === line.id);
        const reading = runsIn(line.reading);
        if (!first || reading.length === 0) continue;
        expect(reading).toEqual(runsIn(first.detail));
        compared += 1;
      }
    }
    expect(compared).toBeGreaterThan(0);
  });

  it("counts the runs for an even chance from the drop's odds", () => {
    const plan = planOf("Athodai");
    const rows = plan.sections.flatMap((section) => section.groups.flatMap((group) => group.rows));
    const odds = rows
      .flatMap((row) => row.brief)
      .find((part) => typeof part !== "string" && part.say === "oddsBrief" && part.chance !== null);
    expect(odds).toBeDefined();
    if (odds && typeof odds !== "string" && odds.say === "oddsBrief" && odds.chance !== null) {
      expect(odds.runs).toBe(Math.round(100 / odds.chance));
    }
  });
});

describe("what a Summary row names and opens (spec 09)", () => {
  it("gives each part the node and mission of the one source they share", () => {
    const blueprints = briefOf(planOf("Dante")).find((block) => block.id === "blueprints");
    expect(blueprints?.lines.length).toBeGreaterThan(0);
    for (const line of blueprints?.lines ?? []) {
      expect(line.where).toEqual([
        { say: "nodeOn", node: "Armatus", place: "Deimos" },
        "Disruption",
      ]);
    }
  });

  it("keeps the thing a component opens, and none for credits", () => {
    const components = briefOf(planOf("Mesa")).find((block) => block.id === "components");
    const spores = components?.lines.find((line) => line.id === "resource:Nano Spores");
    expect(spores?.thing).toBe("Nano Spores");
    expect(spores?.imageUrl).toContain("cdn.warframestat.us");
    expect(components?.lines.find((line) => line.id === "credits")?.thing).toBeNull();
  });

  it("draws the credits, Kuva and a Misc resource", () => {
    const art = (name: string, id: string) =>
      briefOf(planOf(name))
        .flatMap((block) => block.lines)
        .find((line) => line.id === id)?.imageUrl;
    expect(art("Mesa", "credits")).toBe("https://wiki.warframe.com/images/Credits.png");
    expect(art("Broken Scepter", "resource:Kuva")).toContain("Kuva.png");
    expect(art("Ack & Brunt", "resource:Cryotic")).toContain("cdn.warframestat.us");
  });

  it("draws every component of every item", () => {
    const blank = new Set<string>();
    for (const item of data.arsenal) {
      for (const block of briefOf(stepPlan(data, dossier(item, data.arsenal), reader))) {
        if (block.id !== "components") continue;
        for (const line of block.lines) if (!line.imageUrl) blank.add(line.id);
      }
    }
    expect([...blank]).toEqual([]);
  });

  it("names a part another item owns after it", () => {
    const parts = (name: string) =>
      briefOf(planOf(name))
        .filter((block) => block.id === "blueprints")
        .flatMap((block) => block.lines.map((line) => line.id));
    expect(parts("Chroma")).toContain("part:Volt Neuroptics");
    expect(parts("Pride")).toContain("part:Wrath Blade");
    expect(parts("Wrath")).toContain("part:Pride Blade");
    expect(parts("Paris Prime")).not.toContain("part:Bo Prime Grip");
  });

  it("gives every block and every row of every item its own key", () => {
    for (const item of data.arsenal) {
      const blocks = briefOf(stepPlan(data, dossier(item, data.arsenal), reader));
      const ids = blocks.map((block) => block.id);
      expect(new Set(ids).size, item.name).toBe(ids.length);
      for (const block of blocks) {
        const lines = block.lines.map((line) => line.id);
        expect(new Set(lines).size, `${item.name} ${block.id}`).toBe(lines.length);
      }
    }
  });
});
