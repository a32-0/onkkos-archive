import { describe, expect, it } from "vitest";

import { collectibleStepPlan, stepPlan, type StepPlan } from "@/domain/catalog/checks";
import { collectibleView } from "@/domain/catalog/collectibles";
import { dossier } from "@/domain/catalog/dossier";

import { testData } from "./helpers";

const data = testData();
const now = Date.UTC(2026, 9, 3);

function rowsOf(plan: StepPlan) {
  return plan.sections.flatMap((one) => one.groups.flatMap((group) => group.rows));
}

function proseOnly(plan: StepPlan): boolean {
  const how = plan.sections.find((one) => one.id === "how");
  const rows = how?.groups.flatMap((group) => group.rows) ?? [];
  return (
    rows.length === 0 || rows.every((row) => row.detail.length === 0 && row.brief.length === 0)
  );
}

describe("every item is answered from data, not prose alone", () => {
  it("gives every arsenal item a route with a detail on every part", () => {
    const thin: string[] = [];
    for (const item of data.arsenal) {
      const plan = stepPlan(data, dossier(item, data.arsenal), { now, masteryRank: 10 });
      const unknown = rowsOf(plan).some((row) => row.id.endsWith(":none"));
      const noRecipe = !plan.sections.some(
        (one) => one.id.startsWith("part:") || one.id === "blueprints",
      );
      const acquisition = plan.sections.some((one) => one.title.say === "sectionAcquisition");
      if (unknown || (noRecipe && proseOnly(plan) && !acquisition)) thin.push(item.name);
    }
    expect(thin).toEqual([]);
  });

  it("gives every collectible at least one route with a detail", () => {
    const empty = new Set<string>();
    const thin = [...data.collectibles.values()]
      .filter((collectible) =>
        proseOnly(
          collectibleStepPlan(data, collectibleView(data, collectible, empty, empty), { now }),
        ),
      )
      .map((collectible) => collectible.name);
    expect(thin).toEqual([]);
  });
});

describe("what the sources leave out or fill in", () => {
  it("leaves out a Honoria or an Ephemera no source says how to get", () => {
    for (const name of ["Conquera Honoria", "Eskhatos Infinitas Ephemera"]) {
      expect(data.collectibles.has(name)).toBe(false);
    }
    expect(data.collectibles.has("Big Spender Honoria")).toBe(true);
    expect(data.collectibles.has("Seonang Ephemera")).toBe(true);
  });

  it("reads a part's relics from the relics' rewards when the part carries no drops", () => {
    const item = data.arsenal.find((one) => one.name === "Odonata Prime");
    if (!item) throw new Error("Odonata Prime is not catalogued");
    const plan = stepPlan(data, dossier(item, data.arsenal), { now, masteryRank: 10 });
    const blueprint = plan.sections.find((one) => one.id === "part:Blueprint");
    expect(blueprint?.groups.flatMap((group) => group.rows).length).toBeGreaterThan(0);
    expect(rowsOf(plan).some((row) => row.id === "part:Blueprint:none")).toBe(false);
  });
});
