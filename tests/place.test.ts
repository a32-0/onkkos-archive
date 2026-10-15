import { describe, expect, it } from "vitest";

import { proximaPlace } from "@/domain/place/proxima";
import {
  isCurrency,
  normalizeRewardName,
  registerTarget,
  resolveReward,
  type RewardTarget,
} from "@/domain/place/resolve";
import { summaryGroupOf } from "@/domain/place/catalog";
import { canonicalPlace, DOJO } from "@/domain/place/schema";
import { tileFor } from "@/domain/place/tile";
import {
  loadAcquisition,
  loadPlaceRewards,
  loadRegionResources,
  loadResearch,
  loadSystems,
  placeCatalog,
  placeIndex,
} from "@/infra/place/load";

import { testGraph } from "./helpers";

const placeViews = () => placeIndex();
const placeView = (place: string) => placeIndex().get(place) ?? null;
const systems = () => loadSystems().systems;

describe("reward name resolution", () => {
  const index = new Map<string, RewardTarget>();
  const rhino: RewardTarget = { name: "Rhino", group: "warframes" };
  const relic: RewardTarget = { name: "Lith Q3 Intact", group: "relics" };
  registerTarget(index, "Rhino", rhino);
  registerTarget(index, "Rhino Neuroptics Blueprint", rhino);
  registerTarget(index, "Lith Q3 Intact", relic);

  it("strips stack counts and parentheticals", () => {
    expect(normalizeRewardName("150X Agnovidisc")).toBe("agnovidisc");
    expect(normalizeRewardName("Larkspur (Atmosphere)")).toBe("larkspur");
  });

  it("resolves a part blueprint to its parent item", () => {
    expect(resolveReward(index, "Rhino Neuroptics Blueprint")).toEqual(rhino);
  });

  it("maps a dropped relic to its intact variant", () => {
    expect(resolveReward(index, "Lith Q3 Relic")).toEqual(relic);
  });

  it("rejects currency rather than inventing an item", () => {
    expect(isCurrency("2,000 Credits Cache")).toBe(true);
    expect(isCurrency("100 Endo")).toBe(true);
    expect(resolveReward(index, "100 Endo")).toBeNull();
  });
});

describe("curated acquisition", () => {
  const rows = loadAcquisition();

  it("covers every orphan exactly once", () => {
    expect(rows).toHaveLength(37);
    expect(new Set(rows.map((row) => row.item)).size).toBe(rows.length);
  });

  it("names only items that exist in the catalog", () => {
    const entries = placeCatalog().entries;
    const missing = rows.filter((row) => !entries.has(row.item));
    expect(missing.map((row) => row.item)).toEqual([]);
  });
});

describe("systems", () => {
  it("assigns every listed place to exactly one system", () => {
    const seen = new Set<string>();
    for (const system of systems()) {
      for (const place of system.places) {
        expect(seen.has(place)).toBe(false);
        seen.add(place);
      }
    }
  });

  it("keeps Dark Refractory a peer of Duviri, not a child of Deimos", () => {
    const refractory = systems().find((system) => system.id === "refractory");
    expect(refractory?.places).toEqual(["Dark Refractory"]);
    const origin = systems().find((system) => system.id === "origin");
    expect(origin?.places).toContain("Deimos");
    expect(origin?.places).not.toContain("Dark Refractory");
  });

  it("lists the systems in BR-47's order", () => {
    expect(systems().map((system) => system.name)).toEqual([
      "Origin System",
      "Pom-2 PC",
      "Duviri",
      "Empyrean Proxima",
      "Dark Refractory",
      "Tau",
    ]);
  });

  it("orders the Origin System's places as the chart does, the Dojo last", () => {
    const graph = testGraph();
    const chart = graph.starChartOrder.map((entry) => entry.planet);
    const order = (place: string): number => {
      const onChart = chart.indexOf(place);
      if (onChart >= 0) return onChart * 100;
      const off = graph.offChartPlaces.findIndex((entry) => entry.place === place);
      const entry = graph.offChartPlaces[off];
      return entry ? chart.indexOf(entry.after) * 100 + off + 1 : Number.MAX_SAFE_INTEGER;
    };
    const origin = systems().find((system) => system.id === "origin")?.places ?? [];
    expect(origin).toEqual([...origin].sort((a, b) => order(a) - order(b)));
    expect(origin.at(-1)).toBe(DOJO);
  });

  it("names every place as grafo.yaml does, so reach can measure it", () => {
    const graph = testGraph();
    const known = new Set([
      ...graph.starChartOrder.map((entry) => entry.planet),
      ...graph.offChartPlaces.map((entry) => entry.place),
      DOJO,
    ]);
    const places = systems().flatMap((system) => system.places);
    expect(places.filter((place) => !known.has(place))).toEqual([]);
    expect([...known].filter((place) => !places.includes(place))).toEqual([]);
  });

  it("reads the sources' other spellings under the same name", () => {
    const { aliases } = loadSystems();
    expect(canonicalPlace(aliases, "Dark Refractory, Deimos")).toBe("Dark Refractory");
    expect(canonicalPlace(aliases, "Earth")).toBe("Earth");
    expect(loadPlaceRewards()["Dark Refractory, Deimos"]).toBeUndefined();
    expect(loadPlaceRewards()["Dark Refractory"]?.length).toBeGreaterThan(0);
    expect(loadRegionResources().Zariman?.length).toBeGreaterThan(0);
  });

  it("carries Tau as announced with nothing to browse", () => {
    const tau = systems().find((system) => system.id === "tau");
    expect(tau?.released).toBe(false);
    expect(tau?.places).toEqual([]);
  });
});

describe("place index", () => {
  it("puts Rhino on Venus at Fossa", () => {
    const venus = placeView("Venus");
    const rhino = venus?.items.find((item) => item.name === "Rhino");
    expect(rhino?.verb).toBe("drop");
    expect(rhino?.routes.some((route) => route.node === "Fossa")).toBe(true);
  });

  it("reads a tile at its place as values: runs, rotation, node and mission", () => {
    const rhino = placeView("Venus")?.items.find((item) => item.name === "Rhino");
    if (!rhino) throw new Error("Rhino is not on Venus");
    const tile = tileFor(rhino);
    expect(tile.verb).toBe("drop");
    expect(tile.node).toBe("Fossa");
    expect(tile.runs).toBeGreaterThan(1);
    expect(tile.routes).toBe(rhino.routes.length);
    expect(tile.from).toBeNull();
  });

  it("files Railjack nodes under their Proxima, not under the planet", () => {
    const nodesOf = (place: string) =>
      new Set(placeView(place)?.items.flatMap((item) => item.routes.map((route) => route.node)));
    expect(nodesOf("Venus").has("Bifrost Echo")).toBe(false);
    expect(nodesOf("Venus Proxima").has("Bifrost Echo")).toBe(true);
    const empyrean = systems().find((system) => system.id === "empyrean");
    expect(empyrean?.places.filter((place) => placeView(place) === null)).toEqual([]);
  });

  it("files a Railjack node under its Proxima wherever it is read", () => {
    const rewards = loadPlaceRewards();
    expect(proximaPlace(rewards, "Venus", ["Ishtar (Caches)"], "Caches")).toBe("Venus");
    expect(proximaPlace(rewards, "Venus", ["Bifrost Echo (Caches)"], "Caches")).toBe(
      "Venus Proxima",
    );
    expect(proximaPlace(rewards, "Veil Proxima", ["Flexa"], "Caches")).toBe("Veil Proxima");
  });

  it("carries the canonical resource list for a planet", () => {
    expect(placeView("Earth")?.resources).toContain("Neurodes");
  });

  it("places curated companions that no drop table covers", () => {
    const deimos = placeView("Deimos");
    const panzer = deimos?.items.find((item) => item.name === "Panzer Vulpaphyla");
    expect(panzer?.verb).toBe("conservation");
    expect(panzer?.from).toBe("Son, Necralisk");
    expect(panzer?.routes).toEqual([]);
  });

  it("resolves a system for every place that has content", () => {
    const orphans = [...placeViews().values()].filter((view) => view.system === null);
    expect(orphans.map((view) => view.place)).toEqual([]);
  });

  it("never emits an item with neither a route nor a curated source", () => {
    for (const view of placeViews().values()) {
      for (const item of view.items) {
        expect(item.routes.length > 0 || item.from !== null || item.canonical).toBe(true);
      }
    }
  });
});

describe("catalog placement", () => {
  const entries = placeCatalog().entries;

  it("treats the classic resources as resources even though the catalog files them under Misc", () => {
    for (const name of ["Ferrite", "Rubedo", "Neurodes", "Morphics", "Plastids", "Orokin Cell"]) {
      expect(entries.get(name)?.group).toBe("resources");
    }
  });

  it("files each item under its catalogue, as the map's groups are drawn", () => {
    const expected: Record<string, string> = {
      Rhino: "warframes",
      Voidrig: "necramech",
      Braton: "primary",
      Catchmoon: "secondary",
      Skana: "melee",
      Grattler: "archgun",
      Veritux: "archmelee",
      Sirocco: "amp",
      "Mote Prism": "amp",
      Helios: "companion",
      "Deth Machine Rifle": "companion",
      Itzal: "archwing",
      "Orokin Cell": "resources",
      "Lith A1 Intact": "relics",
      Serration: "mods",
      "Arcane Energize": "arcanes",
      "Boltor Incarnon Genesis": "incarnons",
      "Aspirus Ephemera": "ephemera",
      "90's Kid Honoria": "honoria",
    };
    for (const [name, group] of Object.entries(expected)) {
      expect([name, entries.get(name)?.group]).toEqual([name, group]);
    }
    expect([...entries.values()].some((entry) => entry.group === "railjack")).toBe(true);
  });

  it("leaves out what the frames draw no group for", () => {
    for (const name of ["Adra Mutagen", "Adlet Core", "Squad Health Restore (Large)", "Bad Baby"]) {
      expect(entries.has(name)).toBe(false);
    }
  });

  it("gathers the map's groups into the Summary's (BR-16)", () => {
    expect(summaryGroupOf("primary")).toBe("weapons");
    expect(summaryGroupOf("amp")).toBe("weapons");
    expect(summaryGroupOf("archgun")).toBe("weapons");
    expect(summaryGroupOf("companion")).toBe("companions");
    expect(summaryGroupOf("necramech")).toBe("vehicles");
    expect(summaryGroupOf("railjack")).toBe("vehicles");
    expect(summaryGroupOf("warframes")).toBe("warframes");
    expect(summaryGroupOf("mods")).toBe("mods");
  });

  it("does not let a generic component name claim an unrelated item: Amesha is researched, never dropped", () => {
    const amesha = [...placeViews().values()].filter((view) =>
      view.items.some((item) => item.name === "Amesha"),
    );
    expect(amesha.map((view) => view.place)).toEqual([DOJO]);
  });
});

describe("the Dojo (BR-57)", () => {
  const dojo = placeView(DOJO);
  const research = loadResearch();

  it("sits in the Origin System", () => {
    expect(systems().find((system) => system.id === "origin")?.places).toContain(DOJO);
  });

  it("holds everything researched that has a group, by its lab", () => {
    const { entries, index } = placeCatalog();
    const names = Object.keys(research);
    const held = new Set(dojo?.items.map((item) => item.name));
    const unresolved: string[] = [];
    for (const name of names) {
      const target = resolveReward(index, name);
      const entry = target ? entries.get(target.name) : undefined;
      if (!entry) unresolved.push(name);
      else expect(held.has(entry.name)).toBe(true);
    }
    expect(names).toHaveLength(188);
    expect(unresolved.sort()).toEqual([
      "Adrenal Stim",
      "Antiserum Injector",
      "Archwing Launcher Segment",
      "Bleeding Dragon Key",
      "Calcifin Stim",
      "Cipher x 100",
      "Clotra Stim",
      "Cosmic Specter Regiment",
      "Decaying Dragon Key",
      "Extinguished Dragon Key",
      "Force Specter Regiment",
      "Greedy Milk",
      "Hang Tenno",
      "Hobbled Dragon Key",
      "Infested Catalyst",
      "Kavat Incubator Upgrade Segment",
      "Landing Craft Foundry Segment",
      "Loc-Pin",
      "Nutrio Incubator Upgrade Segment",
      "Ostron Explorer (Standing)",
      "Ostron Gatherer (Standing)",
      "Ostron Relaxed (Seated)",
      "Ostron Trader Woman (Standing)",
      "Phase Specter Regiment",
      "Puppeteer",
      "Refract Stim",
      "Solar Rail Tower Class",
      "Solaris Foreman (Standing)",
      "Solaris Hazard Worker(Standing)",
      "Solaris Rig Jockey (Seated)",
      "Solaris Rig Jockey (Standing)",
      "Squad Ammo Restore (Large) x 100",
      "Squad Ammo Restore (Medium)",
      "Squad Ammo Restore (Medium) x 10",
      "Squad Energy Restore (Large) x 100",
      "Squad Energy Restore (Medium)",
      "Squad Energy Restore (Medium) x 10",
      "Squad Health Restore (Large) x 100",
      "Squad Health Restore (Medium)",
      "Squad Health Restore (Medium) x 10",
      "Squad Shield Restore (Large) x 100",
      "Squad Shield Restore (Medium)",
      "Squad Shield Restore (Medium) x 10",
      "Vapor Specter Regiment",
    ]);
  });

  it("says which lab researches each item", () => {
    const djinn = dojo?.items.find((item) => item.name === "Djinn");
    expect(djinn?.verb).toBe("research");
    expect(djinn?.from).toBe("Bio Lab");
    expect(dojo?.items.find((item) => item.name === "Banshee")?.from).toBe("Tenno Lab");
  });
});
