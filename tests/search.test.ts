import { describe, expect, it } from "vitest";

import { circuitStatus } from "@/domain/catalog/circuit";
import { collectibleStepPlan } from "@/domain/catalog/checks";
import { collectibleView } from "@/domain/catalog/collectibles";
import { findCollectible } from "@/domain/catalog/data";
import { allPlaces } from "@/domain/catalog/places";
import { searchCatalog } from "@/domain/catalog/search";
import { placeIndex } from "@/infra/place/load";

import { testData, testGraph } from "./helpers";

const data = testData();
const places = placeIndex();
const known = new Set(allPlaces(testGraph()).map((place) => place.name));
const now = Date.UTC(2026, 9, 3);

const search = (term: string) => searchCatalog(data, places, term);

function hitNamed(term: string, name: string) {
  return search(term).find((hit) => hit.name === name);
}

function found(name: string) {
  const entry = findCollectible(data, name);
  if (!entry) throw new Error(`${name} is not catalogued`);
  return entry;
}

describe("the catalog search", () => {
  it("puts the exact name first", () => {
    expect(search("ash")[0]).toMatchObject({ name: "Ash", score: 4 });
  });

  it("waits for two characters", () => {
    expect(search("s")).toEqual([]);
  });

  it("finds a quest by its name", () => {
    expect(hitNamed("the hex", "The Hex")).toMatchObject({ kind: "quest", group: "quests" });
    expect(hitNamed("war within", "The War Within")?.kind).toBe("quest");
  });

  it("names the catalogue of each kind of thing", () => {
    expect(hitNamed("ember", "Ember Prime")).toMatchObject({ kind: "item", group: "arsenal" });
    expect(hitNamed("ember", "Ember Prime")?.type).toBe("Warframes");
    expect(hitNamed("serration", "Serration")?.group).toBe("mods");
    expect(hitNamed("energize", "Arcane Energize")?.group).toBe("arcanes");
    expect(hitNamed("axi a1", "Axi A1 Relic")?.group).toBe("relics");
    expect(hitNamed("neurodes", "Neurodes")?.group).toBe("resources");
  });

  it("returns the place a search names (spec 08)", () => {
    expect(hitNamed("venus", "Venus")).toMatchObject({ kind: "place", group: "places" });
    expect(search("venus")[0]?.name).toBe("Venus");
    expect(hitNamed("dojo", "Dojo")?.kind).toBe("place");
  });

  it("ranks a name that starts with the term first, best first across catalogues", () => {
    expect(search("serration")[0]?.name).toBe("Serration");
    const hits = search("ember");
    expect(hits.findIndex((hit) => hit.name === "Ember")).toBeLessThan(
      hits.findIndex((hit) => hit.name === "Ember Prime"),
    );
  });

  it("marks a vaulted relic and a collectible's family as values", () => {
    expect(hitNamed("axi a1", "Axi A1 Relic")?.vaulted).toBe(true);
    expect(hitNamed("big spender", "Big Spender Honoria")?.family).toBe("honoria");
  });

  it("leaves out anything with no known source", () => {
    for (const hit of search("glyph")) {
      const entry = findCollectible(data, hit.name);
      if (!entry) continue;
      const sources =
        entry.drops.length +
        entry.regions.length +
        entry.offers.length +
        (entry.relic ? 1 : 0) +
        (entry.honoria ? 1 : 0) +
        (entry.incarnon ? 1 : 0);
      expect(sources).toBeGreaterThan(0);
    }
  });
});

describe("a collectible's own page", () => {
  it("keeps only drops of the thing itself", () => {
    expect(
      found("Serration").drops.every((drop) => drop.type === null || drop.type === "Serration"),
    ).toBe(true);
  });

  it("gives a relic its contents with art, and its farms", () => {
    const relic = found("Lith C7 Relic");
    expect(relic.relic).not.toBeNull();
    const view = collectibleView(data, relic, known, new Set());
    expect(view.rewards.length).toBe(6);
    expect(view.rewards.some((reward) => reward.imageUrl !== null)).toBe(true);
    expect(view.routes[0]?.place).toBeTruthy();
  });

  it("prefers a place the player has reached when the odds are equal", () => {
    const reached = new Set(["Earth", "Venus", "Mercury"]);
    const view = collectibleView(data, found("Serration"), known, reached);
    expect(reached.has(view.routes[0]?.place ?? "")).toBe(true);
  });

  it("gets a step-by-step plan like any item, with no tick of its own", () => {
    for (const name of ["Serration", "Lith C7 Relic", "Neurodes", "Arcane Energize"]) {
      const plan = collectibleStepPlan(data, collectibleView(data, found(name), known, new Set()), {
        now,
      });
      const ids = plan.sections.flatMap((one) =>
        one.groups.flatMap((group) => group.rows.map((row) => row.id)),
      );
      expect(ids.some((id) => id === `get:${name}` || id === "route:0")).toBe(true);
      expect(plan.sections.filter((one) => one.checkable).map((one) => one.id)).toEqual(
        plan.sections.some((one) => one.id === "components") ? ["components"] : [],
      );
      expect(ids.filter((id) => id.startsWith("place:")).length).toBeLessThanOrEqual(1);
    }
  });

  it("says a vaulted relic no longer drops", () => {
    const plan = collectibleStepPlan(
      data,
      collectibleView(data, found("Axi A1 Relic"), known, new Set()),
      { now },
    );
    const get = plan.sections
      .flatMap((one) => one.groups.flatMap((group) => group.rows))
      .find((row) => row.id === "get:Axi A1 Relic");
    expect(get?.detail).toEqual([{ say: "relicVaulted" }]);
  });

  it("names the planets a common resource is found on", () => {
    expect(found("Neurodes").regions).toContain("Earth");
  });
});

describe("collectibles with no drop of their own", () => {
  const steps = (name: string) =>
    collectibleStepPlan(data, collectibleView(data, found(name), known, new Set()), {
      now,
    }).sections.flatMap((one) => one.groups.flatMap((group) => group.rows));
  function questsIn(rows: readonly { id: string }[]): string[] {
    return rows.flatMap((row) =>
      row.id.startsWith("quests:")
        ? row.id.slice("quests:".length).split("|")
        : row.id.startsWith("quest:")
          ? [row.id.slice("quest:".length)]
          : [],
    );
  }

  it("finds a Honoria, an Incarnon Genesis and an Ephemera", () => {
    for (const term of ["big spender", "torid incarnon", "eidolon ephemera"]) {
      expect(search(term).length).toBeGreaterThan(0);
    }
  });

  it("prices a Roathe Honoria and quotes how a feat Honoria is earned", () => {
    const honoria = (name: string) => steps(name).find((row) => row.id === "honoria");
    expect(honoria("Big Spender Honoria")?.detail).toEqual([
      {
        say: "curatedVendorDetail",
        vendor: "Roathe",
        place: "La Cathédrale",
        costs: [{ currency: "Credits", amount: 100000 }],
        rank: null,
        built: null,
        earned: null,
      },
    ]);
    expect(questsIn(steps("Big Spender Honoria"))).toContain("The Old Peace");
    expect(honoria("90's Kid Honoria")?.detail.join(" ")).toMatch(/Nightwave/);
  });

  it("dates an Incarnon Genesis from the Circuit's own rotation table", () => {
    const circuit = data.wiki.circuit;
    expect(circuitStatus(circuit, "steelPath", "Torid Incarnon Genesis", now)?.weeksAway).toBe(0);
    expect(circuitStatus(circuit, "steelPath", "Braton Incarnon Genesis", now)?.weeksAway).toBe(5);
    const torid = steps("Torid Incarnon Genesis");
    expect(torid.some((row) => row.id === "cavalero")).toBe(true);
    const at = (name: string) => questsIn(torid).indexOf(name);
    expect(at("The Duviri Paradox")).toBeGreaterThanOrEqual(0);
    expect(at("Angels of the Zariman")).toBeGreaterThanOrEqual(0);
    expect(at("The New War")).toBeLessThan(at("Angels of the Zariman"));
  });

  it("marks the best odds first, with no number in the title, and never more than four ways", () => {
    const rows = steps("Arcane Energize");
    const first = rows.find((row) => row.id === "route:0");
    expect(first?.best).toBe(true);
    expect(JSON.stringify(first?.title)).not.toMatch(/\d+(\.\d+)?%/);
    expect(rows.filter((row) => !row.id.startsWith("place:")).length).toBeLessThanOrEqual(4);
  });
});
