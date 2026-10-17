import { describe, expect, it } from "vitest";

import { NameMap, type Wiki } from "@/domain/catalog/wiki";
import type { CatalogEntry } from "@/domain/place/catalog";
import { hubAcquisition } from "@/domain/place/hubs";
import { placeMap, systemStandings } from "@/domain/place/map";
import { readReach } from "@/domain/place/reach";
import { allPlaces } from "@/domain/catalog/places";
import { bestPlaces, itemLine } from "@/domain/catalog/whats-new";
import { startHere } from "@/domain/place/start-here";
import { itemRanks } from "@/domain/place/state";
import { nodeCountsByPlace } from "@/domain/profile/nodes";
import type { RawProfile } from "@/domain/types/profile";
import { loadSystems, placeCatalog, placeIndex } from "@/infra/place/load";
import { nextLens, shownUnder } from "@/screens/map/lens";
import type { Lens, MapView } from "@/screens/map/state";
import { mapView } from "@/screens/map/view";

import { fixture, testData, testGraph } from "./helpers";

const graph = testGraph();
const data = testData();
const { systems } = loadSystems();
const index = placeIndex();
const masteryOf = new Map(data.arsenal.map((item) => [item.name, item.masteryReq]));

function viewOf(
  profile: RawProfile,
  system: string,
  place: string,
  since: string | null,
  real = false,
): MapView {
  const entry = systems.find((one) => one.id === system)!;
  const ranks = itemRanks(profile, placeCatalog().entries);
  const reach = readReach(graph, profile);
  return mapView({
    map: placeMap({
      system: entry,
      place,
      view: index.get(place) ?? null,
      ranks,
      reach,
      since,
      nodes: nodeCountsByPlace(profile),
      lineOf: real
        ? (name) =>
            itemLine(
              {
                data,
                places: new Set(allPlaces(graph).map((one) => one.name)),
                bestPlaces: bestPlaces(index),
                reach,
                now: Date.UTC(2026, 9, 16),
              },
              name,
            )
        : () => ({ reading: ["Somewhere"], where: [] }),
      masteryReqOf: (name) => masteryOf.get(name) ?? 0,
    }),
    standings: systemStandings(systems, index, ranks, reach, since),
    start: startHere(graph, profile, systems, index, ranks),
    since,
    icons: {},
    orbs: {},
  });
}

const tilesOf = (view: MapView) => view.sections.flatMap((s) => s.groups.flatMap((g) => g.tiles));
const shown = (view: MapView, lens: Lens) => tilesOf(view).filter((tile) => shownUnder(tile, lens));

describe("the lens (BR-45)", () => {
  it("always has one lens chosen, To get by default", () => {
    expect(nextLens("left", "mastered")).toBe("mastered");
    expect(nextLens("mastered", "new")).toBe("new");
    expect(nextLens("new", "new")).toBe("new");
    expect(nextLens("new", "left")).toBe("left");
    expect(nextLens("mastered", "other")).toBe("mastered");
  });

  const cy = fixture("profile-cy");
  const view = viewOf(cy, "origin", "Earth", "2025-08");

  it("shows what is left by default, and only the mastered or the new under a lens", () => {
    expect(shown(view, "left").every((tile) => !tile.mastered)).toBe(true);
    expect(shown(view, "mastered").length).toBeGreaterThan(0);
    expect(shown(view, "mastered").every((tile) => tile.mastered)).toBe(true);
    expect(shown(view, "new").every((tile) => tile.fresh)).toBe(true);
  });

  it("reads a drop at this place as runs and rotation, and names its node", () => {
    const drop = tilesOf(view).find((tile) => /^~\d+ Runs?/.test(tile.reading));
    expect(drop?.place).toMatch(/\S · \S/);
  });

  it("offers New only with a month, and counts it on a group only then", () => {
    expect(view.newLens).toBe(true);
    const none = viewOf(cy, "origin", "Earth", null);
    expect(none.newLens).toBe(false);
    expect(none.sections.flatMap((s) => s.groups).every((g) => g.count === undefined)).toBe(true);
    expect(tilesOf(none).every((tile) => !tile.fresh)).toBe(true);
  });

  it("puts the Arsenal before the Collection, each group once", () => {
    expect(view.sections.map((section) => section.id)).toEqual(["arsenal", "collection"]);
    const ids = view.sections.flatMap((s) => s.groups.map((g) => g.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("reach on the map (BR-59 to BR-62)", () => {
  const ordis = fixture("profile-ordis");

  it("holds back what Mastery Rank 2 cannot reach and counts it by rank alone", () => {
    const groups = systems
      .find((one) => one.id === "origin")!
      .places.flatMap((place) => viewOf(ordis, "origin", place, null).sections)
      .flatMap((section) => section.groups);
    const held = groups.find((group) => group.more.left !== null);
    expect(held?.more.left).toMatch(
      /^\d+ more .+ Mastery Rank \d+ or higher\. You are Mastery Rank 2\.$/,
    );
    expect(held?.tiles.some((tile) => tile.beyond)).toBe(true);
    for (const tile of held?.tiles.filter((one) => shownUnder(one, "left")) ?? []) {
      expect(tile.beyond).toBe(false);
    }
  });

  it("lists the places up to the frontier, then the More line, and finds the rest by search", () => {
    const view = viewOf(ordis, "origin", "Earth", null);
    const origin = view.places.find((one) => one.id === "origin")!;
    const listed = origin.rows.filter((row) => row.listed);
    expect(listed.length).toBeGreaterThan(0);
    expect(listed.length).toBeLessThan(origin.rows.length);
    expect(origin.more).toMatch(
      /^\d+ more places open as you clear the junctions and join a clan\. Next: the .+ Junction, on .+\.$/,
    );
    const beyond = origin.rows.find((row) => !row.listed && row.gap?.startsWith("Clear the"));
    expect(beyond?.gap).toMatch(/^Clear the .+ Junction, on .+, to reach it\.$/);
  });

  it("shows a place beyond reach whole when it is opened, and keeps it listed", () => {
    const view = viewOf(ordis, "origin", "Earth", null);
    const far = view.places.find((one) => one.id === "origin")!.rows.find((row) => !row.listed)!;
    const opened = viewOf(ordis, "origin", far.name, null);
    expect(tilesOf(opened).every((tile) => !tile.beyond)).toBe(true);
    const row = opened.places
      .find((one) => one.id === "origin")!
      .rows.find((r) => r.name === far.name);
    expect(row?.listed && row.onView).toBe(true);
  });

  it("lists the systems in reach, Tau as Soon™, and counts the rest", () => {
    const view = viewOf(ordis, "origin", "Earth", null);
    expect(view.systems.find((one) => one.id === "tau")?.soon).toBe("Soon™");
    expect(view.systems.length).toBeLessThan(systems.length);
    expect(view.moreSystems).toMatch(/^\d+ more systems? opens? as you go further\.$/);
  });

  it("shows every place, system and item, with no More line, to a profile it cannot place", () => {
    const view = viewOf({}, "origin", "Earth", null);
    const origin = view.places.find((one) => one.id === "origin")!;
    expect(origin.rows.every((row) => row.listed && row.gap === undefined)).toBe(true);
    expect(origin.more).toBeNull();
    expect(view.moreSystems).toBeNull();
    expect(tilesOf(view).every((tile) => !tile.beyond)).toBe(true);
  });
});

describe("Start here (BR-44)", () => {
  it("sits on exactly one place, and on its system", () => {
    const view = viewOf(fixture("profile-ordis"), "origin", "Earth", null);
    const marked = view.places.flatMap((one) => one.rows).filter((row) => row.startHere);
    expect(marked).toHaveLength(1);
    expect(view.systems.filter((one) => one.startHere)).toHaveLength(1);
  });
});

describe("the place card", () => {
  it("counts the nodes played and the items mastered", () => {
    const view = viewOf(fixture("profile-ordis"), "origin", "Earth", null);
    expect(view.card.nodes?.lines.map((line) => line.label)).toEqual(["Normal", "Steel Path"]);
    expect(view.card.items.count).toMatch(/^\d+\/\d+$/);
  });

  it("drops the Nodes lines where the profile has no missions", () => {
    expect(viewOf({}, "origin", "Earth", null).card.nodes).toBeUndefined();
  });
});

describe("the Collection groups with a place (owner, 2026-10-16)", () => {
  it("files the Incarnons at Duviri and the Honoria at the hubs that hand them out", () => {
    const groups = (place: string) => new Set(index.get(place)?.items.map((item) => item.group));
    expect(groups("Duviri").has("incarnons")).toBe(true);
    expect(groups("Deimos").has("honoria")).toBe(true);
    expect(groups("Uranus Proxima").has("honoria")).toBe(true);
  });

  it("gives each hub tile its hub, and a reading where the source has one", () => {
    const cy = fixture("profile-cy");
    const unpriced = new Set(["The Power Of Harrow Compels Thee"]);
    for (const [system, place, group] of [
      ["duviri", "Duviri", "map-incarnons"],
      ["empyrean", "Uranus Proxima", "map-honoria"],
      ["origin", "Deimos", "map-honoria"],
      ["origin", "Venus", "map-ephemera"],
    ] as const) {
      const tiles = viewOf(cy, system, place, null, true)
        .sections.flatMap((section) => section.groups)
        .find((one) => one.id === group)!.tiles;
      expect(tiles.length, place).toBeGreaterThan(0);
      for (const tile of tiles) {
        expect(tile.reading === "", tile.name).toBe(unpriced.has(tile.name));
        expect(tile.place, tile.name).not.toBe("");
        expect(`${tile.reading} ${tile.place}`).not.toMatch(/\[object|undefined|null/);
      }
    }
  });

  it("files only what a source places on a hub of the map", () => {
    const entry = (name: string, group: CatalogEntry["group"]) => ({ name, group }) as CatalogEntry;
    const entries = new Map([
      ["Braton Incarnon Genesis", entry("Braton Incarnon Genesis", "incarnons")],
      ["Hunhow Honoria", entry("Hunhow Honoria", "honoria")],
      ["Event Ephemera", entry("Event Ephemera", "ephemera")],
      ["Rizoma Ephemera", entry("Rizoma Ephemera", "ephemera")],
    ]);
    const wiki = {
      incarnons: new NameMap([["Braton Incarnon Genesis", {}]]),
      honorias: new NameMap([["Hunhow Honoria", { tags: ["Hunhow"] }]]),
      honoriaTags: new NameMap([["Hunhow", { place: "Pontis Tower" }]]),
      vendors: [
        { name: "Nightcap", offers: [{ item: "Rizoma Ephemera" }] },
        { name: "Star Days", offers: [{ item: "Event Ephemera" }] },
      ],
    } as unknown as Pick<Wiki, "incarnons" | "honorias" | "honoriaTags" | "vendors">;
    const rows = hubAcquisition(entries, wiki, {
      "The Circuit": "Duviri",
      "Pontis Tower": "Uranus Proxima",
      Nightcap: "Venus",
    });
    expect(rows.map((row) => [row.item, row.place])).toEqual([
      ["Braton Incarnon Genesis", "Duviri"],
      ["Hunhow Honoria", "Uranus Proxima"],
      ["Rizoma Ephemera", "Venus"],
    ]);
  });
});

describe("each place's sphere", () => {
  it("has a colour for every place of every system", () => {
    const { colors } = loadSystems();
    for (const place of systems.flatMap((system) => system.places)) {
      expect(colors[place], place).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("draws one node per node of the place, lit as played", () => {
    const view = viewOf(fixture("profile-cy"), "origin", "Earth", null);
    expect(view.card.constellation?.total).toBe(15);
    expect(view.card.constellation?.lit).toBe(15);
    expect(view.card.system).toBe("Change location");
  });
});

describe("names inside their group", () => {
  it("drop the word the group already says", async () => {
    const { shortName } = await import("@/content/names");
    expect(shortName("Hunhow Honoria", "honoria")).toBe("Hunhow");
    expect(shortName("Rizoma Ephemera", "ephemera")).toBe("Rizoma");
    expect(shortName("Braton Incarnon Genesis", "incarnons")).toBe("Braton");
    expect(shortName("Axi A21 Intact", "relics")).toBe("Axi A21");
    expect(shortName("Honoria", "honoria")).toBe("Honoria");
    expect(shortName("Excalibur Prime", "warframes")).toBe("Excalibur Prime");
  });
});
