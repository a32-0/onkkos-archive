import { describe, expect, it } from "vitest";

import { collectibleStepPlan, stepPlan, type StepPlan } from "@/domain/catalog/checks";
import { collectibleView } from "@/domain/catalog/collectibles";
import { isCatalogued } from "@/domain/catalog/data";
import { dossier } from "@/domain/catalog/dossier";
import { briefOf } from "@/domain/catalog/summary";
import { loadSystems, placeCatalog } from "@/infra/place/load";

import { testData } from "./helpers";

const data = testData();
const now = Date.UTC(2026, 9, 21);
const none = new Set<string>();
const PREREQUISITES = "prerequisites";
const UNSOURCED = new Set([
  "Greater Focus Lens",
  "Javlok Capacitor",
  "Mandachord Body",
  "Mandachord Bridge",
  "Mandachord Fret",
  "Orion's Swaddle Syandana",
  "Proof Fragment",
  "Sirius' Swaddle Syandana",
  "Trembera Essence",
  "Vizier Predasite Tag",
]);
const PART_NAMES = /^(Blueprint|Systems|Chassis|Neuroptics|Carapace|Cerebrum)$/;

const plans: { name: string; plan: StepPlan }[] = [
  ...data.arsenal.map((item) => ({
    name: item.name,
    plan: stepPlan(data, dossier(item, data.arsenal), { now, masteryRank: 10 }),
  })),
  ...[...data.collectibles.values()].map((collectible) => ({
    name: collectible.name,
    plan: collectibleStepPlan(data, collectibleView(data, collectible, none, none), { now }),
  })),
];

function each(test: (name: string, plan: StepPlan) => string[]): string[] {
  return [...new Set(plans.flatMap(({ name, plan }) => test(name, plan)))].sort();
}

function rows(plan: StepPlan, checkable: boolean) {
  return plan.sections
    .filter((section) => section.checkable === checkable && section.id !== PREREQUISITES)
    .flatMap((section) => section.groups.flatMap((group) => group.rows));
}

describe("every item page reads whole", () => {
  it("gives every component its art", () => {
    expect(
      each((_, plan) => rows(plan, true).flatMap((row) => (row.imageUrl ? [] : [row.id]))),
    ).toEqual([]);
  });

  it("says where every component comes from", () => {
    expect(
      each((_, plan) =>
        rows(plan, true).flatMap((row) =>
          row.detail.length > 0 || row.brief.length > 0 || row.prose !== null ? [] : [row.id],
        ),
      ),
    ).toEqual([]);
  });

  it("opens every component's own page in the app", () => {
    expect(
      each((name, plan) =>
        rows(plan, true).flatMap((row) =>
          row.thing === null && row.id.startsWith("resource:") && !UNSOURCED.has(row.id.slice(9))
            ? [`${name}: ${row.id}`]
            : [],
        ),
      ).map((entry) => entry.split(": ")[1]),
    ).toEqual([]);
  });

  it("never lists a part of an item as a resource", () => {
    expect(
      each((_, plan) =>
        rows(plan, true).flatMap((row) =>
          row.id.startsWith("resource:") && PART_NAMES.test(row.id.slice("resource:".length))
            ? [row.id]
            : [],
        ),
      ),
    ).toEqual([]);
  });

  it("gives every step of How to get a detail or a passage", () => {
    expect(
      each((_, plan) =>
        rows(plan, false).flatMap((row) =>
          row.detail.length > 0 || row.prose !== null ? [] : [row.id],
        ),
      ),
    ).toEqual([]);
  });

  it("gives every prerequisite a detail or a passage", () => {
    expect(
      each((_, plan) =>
        plan.sections
          .filter((section) => section.id === PREREQUISITES)
          .flatMap((section) => section.groups.flatMap((group) => group.rows))
          .flatMap((row) => (row.detail.length > 0 || row.prose !== null ? [] : [row.id])),
      ),
    ).toEqual([]);
  });

  it("gives every Summary line a reading or a place", () => {
    expect(
      each((name, plan) =>
        briefOf(plan).flatMap((block) =>
          block.lines.flatMap((line) =>
            line.reading.length > 0 ||
            line.where.length > 0 ||
            line.detail.length > 0 ||
            UNSOURCED.has(line.id.replace(/^resource:/, "")) ||
            (line.thing !== null && isCatalogued(data, line.thing)) ||
            line.id.includes("credits")
              ? []
              : [`${block.id}:${line.id}`],
          ),
        ),
      ),
    ).toEqual([]);
  });
});

describe("a drop's source is named for what it is (spec 10)", () => {
  const titles = each((_, plan) =>
    plan.sections.flatMap((section) =>
      section.groups.flatMap((group) =>
        group.rows.flatMap((row) => (row.title.say === "defeatTitle" ? [row.title.source] : [])),
      ),
    ),
  );

  it("never asks to defeat a relic, a container, a reward table or a vendor's rank", () => {
    expect(
      titles.filter((source) =>
        / Relic$|Container$|Crate$|Caches?$|Chests$|Coffer$|Rewards|, |^Nokko:|^The Descendia:/.test(
          source,
        ),
      ),
    ).toEqual([]);
  });

  it("gives most enemies their art", () => {
    const rows = plans.flatMap(({ plan }) =>
      plan.sections.flatMap((section) =>
        section.groups.flatMap((group) =>
          group.rows.filter((row) => row.title.say === "defeatTitle"),
        ),
      ),
    );
    expect(rows.filter((row) => row.imageUrl).length / rows.length).toBeGreaterThan(0.95);
  });
});

describe("no art slot is ever an empty box (constitution)", () => {
  it("gives every arsenal item and collectible its own art, which Summary rows fall back to", () => {
    expect([
      ...data.arsenal.filter((item) => !item.imageUrl).map((item) => item.name),
      ...[...data.collectibles.values()].filter((one) => !one.imageUrl).map((one) => one.name),
    ]).toEqual([]);
  });

  it("gives every part's section its art", () => {
    expect(
      each((name, plan) =>
        plan.sections
          .filter((section) => section.id.startsWith("part:") && !section.imageUrl)
          .map((section) => `${name}: ${section.id}`),
      ),
    ).toEqual([]);
  });

  it("gives every catalogue entry its art", () => {
    expect(
      [...placeCatalog().entries.values()]
        .filter((entry) => !entry.imageUrl)
        .map((entry) => entry.name),
    ).toEqual([]);
  });

  it("gives every place the colour its orb is drawn from", () => {
    const { systems, colors } = loadSystems();
    expect(systems.flatMap((system) => system.places).filter((place) => !colors[place])).toEqual(
      [],
    );
  });
});
