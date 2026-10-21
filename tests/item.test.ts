import { describe, expect, it } from "vitest";

import type { ItemState } from "@/domain/place/state";
import { titled } from "@/screens/summary/lines";
import type { ItemFacts } from "@/screens/item/state";
import { heroState, initialView, itemPage } from "@/screens/item/view";

function facts(over: Partial<ItemFacts> = {}): ItemFacts {
  return {
    name: "Dante",
    group: "warframes",
    collectible: false,
    quest: false,
    art: "dante.png",
    blueprint: "blueprint.png",
    prime: false,
    state: { kind: "ranked", rank: 2, max: 30 },
    blocks: [
      {
        id: "blueprints",
        title: { say: "sectionBlueprints" },
        lines: [
          {
            id: "part:Neuroptics",
            title: { say: "partTitle", part: "Neuroptics", count: 1 },
            route: null,
            reading: [{ say: "oddsBrief", runs: 20, rotation: "C", stage: null, chance: 5 }],
            where: ["Armatus", "Disruption"],
            imageUrl: "helmet.png",
            thing: null,
            more: 0,
          },
        ],
      },
      {
        id: "components",
        title: { say: "sectionComponents" },
        lines: [
          {
            id: "resource:Nano Spores",
            title: { say: "resourceTitle", name: "Nano Spores", count: 2600 },
            route: null,
            reading: [],
            where: [],
            imageUrl: "spores.png",
            thing: "Nano Spores",
            more: 0,
          },
          {
            id: "credits",
            title: { say: "creditsTitle", credits: 25000 },
            route: null,
            reading: [],
            where: [],
            imageUrl: null,
            thing: null,
            more: 0,
          },
        ],
      },
    ],
    lines: {
      "Nano Spores": {
        reading: [{ say: "oddsBrief", runs: 4, rotation: null, stage: null, chance: 25 }],
        where: ["Deimos", "Exterminate"],
      },
    },
    place: { system: "origin", systemName: "Origin", place: "Deimos", orb: "#a33" },
    beyond: false,
    steps: { sections: [], lock: null },
    ...over,
  };
}

describe("the view an item opens on (spec 09, BR-62)", () => {
  it("opens on Summary, and on Step by step when the item is beyond reach", () => {
    expect(initialView(null, false)).toBe("summary");
    expect(initialView(null, true)).toBe("steps");
  });

  it("keeps the view a link asks for", () => {
    expect(initialView("summary", true)).toBe("summary");
    expect(initialView("steps", false)).toBe("steps");
    expect(initialView("tiles", true)).toBe("steps");
  });
});

describe("the hero's state (BR-17, BR-52)", () => {
  const of = (state: ItemState, over: Partial<ItemFacts> = {}) =>
    heroState(facts({ state, ...over }));

  it("draws Rank and Mastered with their badge", () => {
    expect(of({ kind: "ranked", rank: 2, max: 30 })).toEqual({ kind: "rank", label: "Rank 2/30" });
    expect(of({ kind: "done" })).toEqual({ kind: "mastered", label: "Mastered" });
  });

  it("draws Not obtained grey, gold for a Prime, and no state it cannot read", () => {
    expect(of({ kind: "absent" })).toEqual({ kind: "absent" });
    expect(of({ kind: "absent" }, { prime: true })).toEqual({ kind: "prime" });
    expect(of({ kind: "unknown" })).toEqual({ kind: "none" });
  });

  it("gives a collectible no state", () => {
    expect(of({ kind: "done" }, { collectible: true })).toEqual({ kind: "none" });
  });
});

describe("the item's page (spec 09)", () => {
  it("titles the top bar with the catalogue and the hero with its kicker", () => {
    const page = itemPage(facts(), "navigation", null);
    expect(page.title).toBe("Warframes");
    expect(page.kicker).toBe("Warframe");
    expect(page.tab).toBe("navigation");
    expect(page.back).toBe("/system");
  });

  it("names the place the item comes from and opens the map on it (BR-51)", () => {
    expect(itemPage(facts(), "resume", null).crumb).toEqual({
      href: "/system?system=origin&place=Deimos",
      place: "Origin > Deimos",
      orb: "#a33",
    });
    expect(itemPage(facts({ place: null }), "resume", null).crumb).toBeNull();
  });

  it("names blueprints and components, and opens Step by step at the part", () => {
    const [blueprints, components] = itemPage(facts(), "resume", null).sections;
    expect(blueprints?.title).toBe("Blueprints");
    expect(blueprints?.rows[0]).toEqual({
      key: "part:Neuroptics",
      name: "Neuroptics",
      reading: "~20 Runs · Rotation C",
      place: "Armatus · Disruption",
      art: "helmet.png",
      blueprint: "blueprint.png",
      href: "/item?name=Dante&from=resume&view=steps#part-neuroptics",
    });
    expect(components?.title).toBe("Components");
    expect(components?.rows.map((row) => row.name)).toEqual([
      "Nano Spores ×2,600",
      "25,000 Credits",
    ]);
  });

  it("opens a component's own page with its own line, and nothing for credits (BR-30)", () => {
    const [, components] = itemPage(facts(), "resume", null).sections;
    const [spores, credits] = components?.rows ?? [];
    expect(spores?.href).toBe("/item?name=Nano+Spores&from=resume");
    expect(spores?.reading).toBe("~4 Runs");
    expect(spores?.place).toBe("Deimos · Exterminate");
    expect(credits?.href).toBeUndefined();
  });

  it("speaks only for an item the player has (BR-64)", () => {
    expect(itemPage(facts(), null, null).owned).toBe(true);
    expect(itemPage(facts({ state: { kind: "absent" } }), null, null).owned).toBe(false);
  });

  it("keeps the view in the link it writes", () => {
    const page = itemPage(facts({ beyond: true }), "goal", null);
    expect(page.view).toBe("steps");
    expect(page.hrefs.summary).toBe("/item?name=Dante&from=goal&view=summary");
  });
});

describe("the titles every row may carry", () => {
  it("names a part bare and counts it only when there are more", () => {
    expect(titled({ say: "partSection", part: "Blueprint", count: 1 })).toBe("Blueprint");
    expect(titled({ say: "partTitle", part: "Chassis", count: 2 })).toBe("Chassis ×2");
  });

  it("says nothing for a phrase that is not a title", () => {
    expect(titled({ say: "partsUnknown" })).toBe("");
  });
});
