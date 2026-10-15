import Items from "@wfcd/items";
import worldstateData from "warframe-worldstate-data";
import { describe, expect, it } from "vitest";

import { classify } from "@/domain/catalog/acquisition";
import { allPlaces, placeFromLocation } from "@/domain/catalog/places";

import { testGraph } from "./helpers";

const graph = testGraph();
const places = allPlaces(graph);
const known = new Set(places.map((place) => place.name));
const placeNamed = (name: string) => {
  const place = places.find((entry) => entry.name === name);
  if (!place) throw new Error(`${name} is not a known place`);
  return place;
};

const STAR_CHART_TAG = /^(SolNode|SettlementNode|ClanNode)\d+$/;
const REGION_RE = /\(([^)]+)\)$/;

function worldstateRegions(): Set<string> {
  const regions = new Set<string>();
  for (const [tag, node] of Object.entries(worldstateData.solNodes)) {
    if (!STAR_CHART_TAG.test(tag) || node.type === "Relay") continue;
    const region = REGION_RE.exec(node.value)?.[1];
    if (region) regions.add(region);
  }
  return regions;
}

function catalogPlacePrefixes(): Set<string> {
  const raw = new Items({
    category: ["Warframes", "Primary", "Secondary", "Melee", "Archwing", "Arch-Gun", "Arch-Melee"],
    ignoreEnemies: true,
  } as ConstructorParameters<typeof Items>[0]) as unknown as {
    drops?: { location?: string }[];
    components?: { drops?: { location?: string }[] }[];
  }[];

  const prefixes = new Set<string>();
  for (const item of raw) {
    const locations = [
      ...(item.drops ?? []),
      ...(item.components ?? []).flatMap((component) => component.drops ?? []),
    ];
    for (const drop of locations) {
      if (typeof drop.location !== "string" || !drop.location.includes("/")) continue;
      prefixes.add(drop.location.slice(0, drop.location.indexOf("/")).trim());
    }
  }
  return prefixes;
}

describe("the place vocabulary", () => {
  it("covers every star chart region the community node catalog names", () => {
    const missing = [...worldstateRegions()].filter((region) => !known.has(region));
    expect(missing).toEqual([]);
  });

  it("resolves or deliberately ignores every planet prefix the item catalog emits", () => {
    const unresolved = [...catalogPlacePrefixes()].filter(
      (prefix) => placeFromLocation(`${prefix}/Somewhere`, known) === null,
    );
    expect(unresolved.sort()).toEqual([]);
  });

  it("keeps off-chart places out of the junction chain", () => {
    const chart = graph.starChartOrder.map((entry) => entry.planet);
    for (const extra of graph.offChartPlaces) {
      expect(chart).not.toContain(extra.place);
      expect(chart).toContain(extra.after);
    }
  });

  it("orders the junction chain before anything anchored to it", () => {
    const earth = placeNamed("Earth");
    const duviri = placeNamed("Duviri");
    const venus = placeNamed("Venus");
    expect(earth.order).toBeLessThan(duviri.order);
    expect(duviri.order).toBeLessThan(venus.order);
  });

  it("keeps a syndicate name out of the place vocabulary", () => {
    expect(placeFromLocation("Red Veil, Esteemed/Offering", known)).toBeNull();
  });

  it("maps landscape and hub locations onto their planet", () => {
    expect(placeFromLocation("Venus/Orb Vallis (Bounty)", known)).toBe("Venus");
    expect(placeFromLocation("Earth/Cetus (Bounty)", known)).toBe("Earth");
    expect(placeFromLocation("Deimos/Cambion Drift", known)).toBe("Deimos");
    expect(placeFromLocation("Somewhere Else/Node", known)).toBeNull();
  });
});

describe("classifying how an item is acquired", () => {
  const catalog = new Items({
    category: ["Warframes", "Primary", "Secondary"],
    ignoreEnemies: true,
  } as ConstructorParameters<typeof Items>[0]) as unknown as {
    name: string;
    uniqueName: string;
    isPrime?: boolean;
    bpCost?: number;
    marketCost?: number;
    drops?: { location?: string }[];
    components?: { drops?: { location?: string }[] }[];
  }[];

  const gateFor = (name: string) => {
    const raw = catalog.find((item) => item.name === name);
    if (!raw) throw new Error(`${name} is not in the catalog`);
    const drops = [
      ...(raw.drops ?? []),
      ...(raw.components ?? []).flatMap((component) => component.drops ?? []),
    ]
      .filter((drop): drop is { location: string } => typeof drop.location === "string")
      .map((drop) => ({ location: drop.location }));
    return classify(
      {
        uniqueName: raw.uniqueName,
        name: raw.name,
        group: "Warframes",
        kind: "Warframes",
        slot: "Warframe",
        masteryReq: 0,
        maxRank: 30,
        affinityFactor: 6000,
        imageUrl: null,
        isPrime: raw.isPrime === true,
        vaulted: false,
        buildable: Boolean(raw.bpCost) || Boolean(raw.marketCost),
        wikiUrl: null,
        releaseDate: null,
        update: null,
        drops: drops.map((drop) => ({
          location: String(drop.location),
          type: null,
          chance: null,
          rarity: null,
        })),
        recipe: null,
      },
      known,
      null,
    );
  };

  it("puts a boss-drop Warframe on its planet", () => {
    expect(gateFor("Rhino")).toMatchObject({ kind: "place", places: ["Venus"] });
    expect(gateFor("Frost").places).toContain("Ceres");
  });

  it("sends a Prime to relics rather than to a planet", () => {
    expect(gateFor("Rhino Prime").kind).toBe("relic");
  });

  it("does not invent a source for an item the catalog cannot place", () => {
    expect(["market", "unknown"]).toContain(gateFor("Braton").kind);
  });

  it("never claims a place the profile cannot name", () => {
    for (const name of ["Rhino", "Frost", "Excalibur", "Mag", "Loki"]) {
      for (const place of gateFor(name).places) expect(known).toContain(place);
    }
  });
});
