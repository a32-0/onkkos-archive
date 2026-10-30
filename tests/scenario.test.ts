import { describe, expect, it } from "vitest";

import {
  collectibleStepPlan,
  stepPlan,
  type Phrase,
  type StepPlan,
  type StepSection,
} from "@/domain/catalog/checks";
import { collectibleView } from "@/domain/catalog/collectibles";
import { findCollectible } from "@/domain/catalog/data";
import { dossier } from "@/domain/catalog/dossier";
import {
  layoutOf,
  parseRequirements,
  partName,
  resolveAcquisition,
  scenarioOf,
  type ResolvedPart,
  type Route,
} from "@/domain/catalog/scenario";
import { questNeeds, questsBefore } from "@/domain/narrative/chain";

import { testData } from "./helpers";

const data = testData();
const NOW = Date.UTC(2026, 9, 14);

function itemNamed(name: string) {
  const item = data.arsenal.find((entry) => entry.name === name);
  if (!item) throw new Error(`${name} is not in the catalog`);
  return item;
}

function planOf(name: string, done: string[] = []): StepPlan {
  return stepPlan(data, dossier(itemNamed(name), data.arsenal), {
    now: NOW,
    masteryRank: 10,
    done: new Set(done),
  });
}

function rowsOf(section: StepSection | undefined) {
  return section?.groups.flatMap((group) => group.rows) ?? [];
}

function questsIn(rows: readonly { id: string }[]): string[] {
  return rows.flatMap((row) =>
    row.id.startsWith("quests:")
      ? row.id.slice("quests:".length).split("|")
      : row.id.startsWith("quest:")
        ? [row.id.slice("quest:".length)]
        : [],
  );
}

function titlesOf(section: StepSection | undefined): Phrase[] {
  return rowsOf(section).map((row) => row.title);
}

function sectionNamed(plan: StepPlan, id: string): StepSection | undefined {
  return plan.sections.find((one) => one.id === id);
}

function drop(place: string, node: string): Route {
  return {
    kind: "drop",
    place,
    node,
    mission: null,
    boss: null,
    rotation: null,
    chance: null,
    requirements: [],
  };
}

function part(name: string, ...routes: Route[]): ResolvedPart {
  return { name, count: 1, main: name === "Blueprint", routes };
}

describe("requirements read off a wiki node", () => {
  it("names every quest a node asks for", () => {
    const found = parseRequirements(
      "Must have [[The Deadlock Protocol]] and [[Whispers in the Walls]] completed to access",
    );
    expect(found.map((one) => `${one.kind}:${one.name}`)).toEqual([
      "quest:The Deadlock Protocol",
      "quest:Whispers in the Walls",
    ]);
  });

  it("keeps the Intrinsics rank and drops the quest suffix", () => {
    const found = parseRequirements(
      "Must have [[The War Within]] completed and [[Intrinsics]] Rank 5 or higher to access",
    );
    expect(found).toContainEqual({
      kind: "quest",
      name: "The War Within",
      rank: null,
      label: null,
    });
    expect(found).toContainEqual({ kind: "intrinsics", name: "Intrinsics", rank: 5, label: null });
    expect(parseRequirements("Must have [[The Hex (Quest)]] completed")[0]?.name).toBe("The Hex");
  });

  it("tells a locator key from a quest", () => {
    expect(parseRequirements("Must have [[Grendel Systems Locator]] to access")[0]?.kind).toBe(
      "key",
    );
  });
});

describe("the layout a set of routes asks for", () => {
  it("lifts one source above the parts when every part shares it", () => {
    const layout = layoutOf([
      part("Blueprint", drop("Deimos", "Armatus")),
      part("Chassis", drop("Deimos", "Armatus")),
      part("Systems", drop("Deimos", "Armatus")),
    ]);
    expect(layout).toEqual({ blueprint: "with-parts", parts: "one-source" });
    expect(scenarioOf(layout)).toBe("same-source");
  });

  it("sets the blueprint apart when only the parts share a source", () => {
    const layout = layoutOf([
      part("Blueprint", { kind: "market", credits: 25000 }),
      part("Chassis", drop("Saturn", "Tethys")),
      part("Systems", drop("Saturn", "Tethys")),
    ]);
    expect(scenarioOf(layout)).toBe("blueprint-apart");
  });

  it("calls it one place when the parts share a planet but not a node", () => {
    const layout = layoutOf([
      part("Chassis", drop("Zariman", "Tier 1")),
      part("Systems", drop("Zariman", "Tier 2")),
    ]);
    expect(layout.parts).toBe("one-place");
  });

  it("splits the parts when they share nothing", () => {
    const layout = layoutOf([
      part("Chassis", drop("Pluto Proxima", "Obol Crossing")),
      part("Systems", drop("Venus Proxima", "Falling Glory")),
    ]);
    expect(scenarioOf(layout)).toBe("many-places");
  });

  it("says so when no part has a route at all", () => {
    expect(scenarioOf(layoutOf([part("Blueprint"), part("Chassis"), part("Systems")]))).toBe(
      "parts-unknown",
    );
  });
});

describe("an item resolved against the drop tables and the wiki", () => {
  it("reads Dante as one source, gated by two quests", () => {
    const found = resolveAcquisition(data, itemNamed("Dante"));
    expect(found.scenario).toBe("same-source");
    expect(found.places).toEqual(["Deimos"]);
    expect(found.prerequisites.map((one) => one.name)).toEqual([
      "The Deadlock Protocol",
      "Whispers in the Walls",
    ]);
  });

  it("totals every part blueprint, not only the final assembly", () => {
    const found = resolveAcquisition(data, itemNamed("Dante"));
    expect(found.totals.credits).toBe(70000);
    expect(found.totals.missing).toEqual([]);
    const alloy = found.totals.resources.find((one) => one.name === "Alloy Plate");
    expect(alloy?.count).toBe(8000);
    expect(alloy?.rarity).toBe("Common");
  });

  it("puts Ember's blueprint in the Market and its parts on Sargas Ruk", () => {
    const found = resolveAcquisition(data, itemNamed("Ember"));
    expect(found.scenario).toBe("blueprint-apart");
    const main = found.parts.find((one) => one.main)?.routes[0];
    expect(main).toEqual({ kind: "market", credits: 25000 });
    const chassis = found.parts.find((one) => one.name === "Chassis")?.routes[0];
    expect(chassis?.kind === "drop" ? chassis.boss : null).toBe("General Sargas Ruk");
  });

  it("reads Gyre as one hub with a bounty tier per part", () => {
    const found = resolveAcquisition(data, itemNamed("Gyre"));
    expect(found.scenario).toBe("same-place");
    expect(found.prerequisites.map((one) => one.name)).toContain("Angels of the Zariman");
  });

  it("splits Ash across three Proxima regions", () => {
    const found = resolveAcquisition(data, itemNamed("Ash"));
    expect(found.scenario).toBe("many-places");
    expect([...found.places].sort()).toEqual(["Neptune Proxima", "Pluto Proxima", "Venus Proxima"]);
  });

  it("sends Nezha to the Tenno Lab", () => {
    const found = resolveAcquisition(data, itemNamed("Nezha"));
    expect(found.scenario).toBe("same-source");
    expect(found.parts.every((one) => one.routes[0]?.kind === "research")).toBe(true);
    expect(found.prerequisites).toContainEqual({
      kind: "clan",
      name: "Tenno Lab",
      rank: null,
      label: null,
    });
  });

  it("follows Grendel's locators to the node each one opens", () => {
    const found = resolveAcquisition(data, itemNamed("Grendel"));
    const chassis = found.parts.find((one) => one.name === "Chassis")?.routes[0];
    expect(chassis?.kind).toBe("vendor");
    expect(chassis?.kind === "vendor" ? chassis.unlocks : null).not.toBeNull();
  });

  it("reads Stubba's blueprint from the Ghoul bounties and Ghoul Rictus Alpha, not Grokdrul's sources", () => {
    const found = resolveAcquisition(data, itemNamed("Stubba"));
    const main = found.parts.find((one) => one.main);
    const routes = main?.routes ?? [];
    expect(routes.some((one) => one.kind === "bounty" && one.tier.includes("Ghoul"))).toBe(true);
    expect(routes).toContainEqual(
      expect.objectContaining({ kind: "enemy", source: "Ghoul Rictus Alpha" }),
    );
    const sources = found.parts
      .flatMap((one) => one.routes)
      .map((one) => ("source" in one ? one.source : null));
    expect(sources).not.toContain("Grokdrul Drum");
    expect(sources).not.toContain("Narmer Thumper Doma");
  });

  it("puts a Conclave drop after every other route: Balla's blueprint is Hok's first", () => {
    const main = resolveAcquisition(data, itemNamed("Balla")).parts.find((one) => one.main);
    expect(main?.routes[0]).toEqual(expect.objectContaining({ kind: "vendor", vendor: "Hok" }));
    expect(main?.routes.at(-1)).toEqual(
      expect.objectContaining({ kind: "drop", mission: "Conclave" }),
    );
  });

  it("never gives an item a route that only an ingredient's drops hold", () => {
    const leaks: string[] = [];
    for (const item of data.arsenal) {
      const own = (item.recipe?.parts ?? []).flatMap((part) =>
        part.drops.map((drop) => drop.location),
      );
      const theirs = (item.recipe?.ingredients ?? []).flatMap(
        (one) => findCollectible(data, one.name)?.drops.map((drop) => drop.location) ?? [],
      );
      const found = resolveAcquisition(data, item);
      for (const route of found.parts.flatMap((one) => one.routes)) {
        if (route.kind !== "enemy") continue;
        const from = (location: string) => location.startsWith(route.source);
        if (theirs.some(from) && !own.some(from)) leaks.push(`${item.name}: ${route.source}`);
      }
    }
    expect(leaks).toEqual([]);
  });

  it("names Simaris and his quest for Atlas's blueprint", () => {
    const found = resolveAcquisition(data, itemNamed("Atlas"));
    const main = found.parts.find((one) => one.main)?.routes[0];
    expect(main?.kind === "vendor" ? main.vendor : null).toBe("Cephalon Simaris");
    expect(found.prerequisites.map((one) => one.name)).toContain("The Jordas Precept");
  });
});

describe("joining a part to its item", () => {
  it("does not repeat the item name a part already carries", () => {
    expect(partName("Bonewidow", "Bonewidow Capsule")).toBe("Bonewidow Capsule");
    expect(partName("Ember", "Chassis")).toBe("Ember Chassis");
  });
});

describe("the step plan each scenario renders", () => {
  it("puts Ember's Market blueprint in the prerequisites and its parts under one boss", () => {
    const plan = planOf("Ember");
    expect(plan.sections.map((one) => one.title)).toEqual([
      { say: "sectionPrerequisites" },
      { say: "sectionHowToGet" },
      { say: "sectionBlueprints" },
      { say: "sectionComponents" },
    ]);
    const first = titlesOf(plan.sections[0]);
    expect(first).toContainEqual({ say: "buyTitle", item: "Ember" });
    expect(first).toContainEqual({ say: "reachTitle", place: "Saturn" });
    expect(plan.sections[1]?.groups[0]?.rows[0]?.title).toEqual({
      say: "playTitle",
      node: "Tethys",
    });
  });

  it("gives each of Ash's parts its own section", () => {
    const ids = planOf("Ash").sections.map((one) => one.id);
    expect(ids).toContain("part:Chassis");
    expect(ids).not.toContain("how");
  });

  it("splits Dante's components into what Deimos holds and what it does not", () => {
    const components = sectionNamed(planOf("Dante"), "components");
    expect(components?.groups.map((group) => group.title)).toEqual([
      { say: "groupHere", places: ["Deimos"] },
      { say: "groupElsewhere" },
    ]);
    const names = (index: number) =>
      components?.groups[index]?.rows.map((row) => row.id.replace(/^resource:/, ""));
    expect(names(0)).toEqual(["Bellow Voca", "Entrati Lanthorn", "Entrati Obols", "Necracoil"]);
    expect(names(1)).toContain("Orokin Cell");
  });

  it("leaves out a Mastery Rank 0 requirement and asks for the item's slot", () => {
    const first = planOf("Ember").sections[0];
    expect(itemNamed("Ember").masteryReq).toBe(0);
    expect(rowsOf(first).map((row) => row.id)).not.toContain("mastery");
    expect(first?.groups[0]?.rows[0]?.title).toEqual({ say: "slotTitle", kind: "Warframe" });
  });

  it("asks a weapon for a weapon slot and an Archwing for its own", () => {
    const cases: [string, string][] = [
      ["Kuva Bramma", "Weapon"],
      ["Itzal", "Archwing"],
    ];
    for (const [name, kind] of cases) {
      expect(titlesOf(planOf(name).sections[0])).toContainEqual({ say: "slotTitle", kind });
    }
  });

  it("orders each components group by rarity, unknown last", () => {
    const order = ["Common", "Uncommon", "Rare"];
    const ranks = rowsOf(sectionNamed(planOf("Ash"), "components"))
      .filter((row) => row.id.startsWith("resource:"))
      .map((row) => {
        const detail = row.detail.find(
          (one) => typeof one !== "string" && one.say === "resourceDetail",
        );
        const rarity = detail && typeof detail !== "string" && "rarity" in detail;
        const rank = rarity ? order.indexOf(String(detail.rarity)) : -1;
        return rank === -1 ? order.length : rank;
      });
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("puts the part with the best odds first and marks every route tied for the best", () => {
    const parts = planOf("Ash").sections.filter((one) => one.id.startsWith("part:"));
    expect(parts.map((one) => one.title)).toEqual([
      { say: "partSection", part: "Chassis", count: 1 },
      { say: "partSection", part: "Systems", count: 1 },
      { say: "partSection", part: "Neuroptics", count: 1 },
    ]);
    const first = parts[0]?.groups[0]?.rows ?? [];
    expect(first.map((row) => row.best)).toEqual([true, true, false, false]);
    expect(first.map((row) => row.alternative)).toEqual([false, true, true, true]);
  });

  it("keeps a standard planet resource out of the place-specific group", () => {
    const components = sectionNamed(planOf("Ember"), "components");
    expect(components?.groups.map((group) => group.title)).toEqual([null]);
  });

  it("ticks only components", () => {
    for (const name of ["Ember", "Ash", "Nezha", "Kuva Bramma"]) {
      const { sections } = planOf(name);
      expect(sections.filter((one) => one.checkable).map((one) => one.id)).toEqual(
        sections.some((one) => one.id === "components") ? ["components"] : [],
      );
    }
  });

  it("sends Dera Vandal to Invasions from the curated sources", () => {
    const how = sectionNamed(planOf("Dera Vandal"), "how")?.groups[0]?.rows[0];
    expect(how?.title).toEqual({ say: "invasionTitle" });
  });
});

describe("items that come from a system rather than a place", () => {
  it("walks a Kuva weapon through the Lich it comes from", () => {
    const { sections } = planOf("Kuva Sobek");
    expect(rowsOf(sections[0]).map((row) => row.id)).toEqual([
      "mastery",
      "slot",
      "junctions:Uranus Junction|Neptune Junction|Pluto Junction|Sedna Junction",
      "quests:Natah|The Second Dream|The War Within|Rising Tide",
      "railjack",
      "intrinsics:5",
    ]);
    expect(sections[1]?.title).toEqual({ say: "sectionAcquisition" });
    expect(titlesOf(sections[1])).toEqual([
      { say: "findTitle", larva: "Kuva Larvling" },
      { say: "vanquishTitle", adversary: "Kuva Lich" },
      { say: "tradeTitle", adversary: "Kuva Lich" },
    ]);
  });

  it("reads a Sister's quests off the wiki's own links", () => {
    const first = questsIn(rowsOf(planOf("Tenet Tetra").sections[0]));
    expect(first).toContain("The War Within");
    expect(first).toContain("Call of the Tempestarii");
  });

  it("prices a Baro item in ducats and credits", () => {
    const plan = planOf("Prisma Gorgon");
    expect(titlesOf(plan.sections[0])).toContainEqual({ say: "relayTitle" });
    expect(titlesOf(sectionNamed(plan, "components"))).toEqual([
      { say: "ducatsTitle", ducats: 600 },
      { say: "creditsTitle", credits: 50000 },
    ]);
  });

  it("sends an invasion reward to Invasions", () => {
    expect(resolveAcquisition(data, itemNamed("Latron Wraith")).system?.kind).toBe("invasion");
  });
});

describe("vaulted Primes and Varzia", () => {
  const vaulted = (inStock: boolean) => {
    const item = itemNamed("Ember Prime");
    return stepPlan(data, dossier(item, data.arsenal), {
      now: NOW,
      masteryRank: 10,
      varzia: {
        location: "Maroo's Bazaar (Mars)",
        expiry: "2026-10-29T18:00:00.000Z",
        offers: inStock ? [{ uniqueName: item.uniqueName, regalAya: 3, aya: null }] : [],
      },
    });
  };

  it("reads a Prime whose every relic is vaulted as vaulted, and one that drops as not", () => {
    expect(resolveAcquisition(data, itemNamed("Ember Prime")).system?.kind).toBe("vaulted");
    expect(resolveAcquisition(data, itemNamed("Nyx Prime")).system).toBeNull();
  });

  it("sends a vaulted Prime to Aya and Varzia, and offers it whole when she has it", () => {
    const { sections } = vaulted(true);
    const status = rowsOf(sections[0]).find((row) => row.id === "vaulted");
    expect(status?.detail).toContainEqual({
      say: "resurgenceDetail",
      item: "Ember Prime",
      expiry: "2026-10-29T18:00:00.000Z",
    });
    expect(rowsOf(sections[1]).map((row) => row.id)).toEqual(["aya", "varzia", "whole"]);
  });

  it("drops the whole-item row and says the relics stopped when she does not", () => {
    const { sections } = vaulted(false);
    const status = rowsOf(sections[0]).find((row) => row.id === "vaulted");
    expect(status?.detail).toContainEqual({ say: "vaultedDetail", item: "Ember Prime" });
    expect(rowsOf(sections[1]).map((row) => row.id)).toEqual(["aya", "varzia"]);
  });

  it("points Aya at its own page rather than the wiki", () => {
    const rows = rowsOf(vaulted(true).sections[1]);
    expect(rows.find((row) => row.id === "aya")?.thing).toBe("Aya");
    expect(rows.find((row) => row.id === "varzia")?.thing).toBeNull();
  });
});

describe("links inside the app", () => {
  it("links a catalogued resource to its page and leaves places on the wiki", () => {
    const all = planOf("Ember").sections.flatMap((one) => rowsOf(one));
    expect(all.find((row) => row.id === "resource:Orokin Cell")?.thing).toBe("Orokin Cell");
    expect(all.find((row) => row.title.say === "playTitle")?.thing).toBeNull();
    expect(all.every((row) => row.thing !== "Ember")).toBe(true);
  });
});

describe("an Acquisition passage read from a section of another page", () => {
  it("is asked only by the three Hounds, whose wiki titles are sections of Model", () => {
    const asked = new Set<string>();
    const take = (plan: StepPlan) => {
      for (const row of plan.sections.flatMap((one) => rowsOf(one))) {
        if (row.prose?.source !== "acquisition") continue;
        const title = data.wiki.titles.get(row.prose.title) ?? row.prose.title;
        if (title.includes("#")) asked.add(`${row.prose.title} -> ${title}`);
      }
    };
    for (const item of data.arsenal) take(planOf(item.name));
    const none = new Set<string>();
    for (const collectible of data.collectibles.values()) {
      take(collectibleStepPlan(data, collectibleView(data, collectible, none, none), { now: NOW }));
    }
    expect([...asked].sort()).toEqual([
      "Bhaira Hound -> Model#Bhaira",
      "Dorma Hound -> Model#Dorma",
      "Hec Hound -> Model#Hec",
    ]);
  });
});

describe("companions", () => {
  it("tells each mechanism apart from the wiki's species and vendor data", () => {
    const mechanism = (name: string) => {
      const system = resolveAcquisition(data, itemNamed(name)).system;
      return system?.kind === "companion" ? system.mechanism : system?.kind;
    };
    expect(mechanism("Chesa Kubrow")).toBe("kubrow");
    expect(mechanism("Adarza Kavat")).toBe("kavat");
    expect(mechanism("Vasca Kavat")).toBe("vasca");
    expect(mechanism("Vizier Predasite")).toBe("son");
    expect(mechanism("Bhaira Hound")).toBe("adversary");
  });

  it("incubates a Kubrow with optional upgrades, gathering every recipe it names", () => {
    const plan = planOf("Chesa Kubrow");
    expect(titlesOf(plan.sections[0])).toContainEqual({
      say: "acquireTitle",
      name: "Kubrow Egg",
      count: 1,
    });
    const steps = rowsOf(plan.sections[1]);
    expect(steps.map((row) => row.title)).toEqual([
      { say: "addTitle", name: "Genetic Code Template" },
      { say: "addTitle", name: "Nutrio Incubator Upgrade Segment" },
      { say: "useIncubatorTitle" },
    ]);
    expect(steps.map((row) => row.optional)).toEqual([true, true, false]);
    const components = sectionNamed(plan, "components");
    expect(components?.groups).toHaveLength(2);
    const [needed, optional] = components?.groups ?? [];
    expect(needed?.rows.map((row) => row.title)).toEqual([
      { say: "resourceTitle", name: "Nano Spores", count: 4500 },
      { say: "resourceTitle", name: "Argon Crystal", count: 1 },
      { say: "resourceTitle", name: "Control Module", count: 2 },
      { say: "creditsTitle", credits: 100000 },
    ]);
    expect(needed?.rows.every((row) => !row.optional)).toBe(true);
    const titles = optional?.rows.map((row) => row.title) ?? [];
    expect(titles).toContainEqual({ say: "resourceTitle", name: "Nano Spores", count: 700 });
    expect(titles).toContainEqual({ say: "resourceTitle", name: "Control Module", count: 1 });
    expect(titles.at(-1)).toEqual({ say: "creditsTitle", credits: 110000 });
    expect(new Set(titles.map((title) => JSON.stringify(title))).size).toBe(titles.length);
    expect(optional?.rows.every((row) => row.optional)).toBe(true);
  });

  it("multiplies a gear recipe by how many the plan asks for", () => {
    expect(titlesOf(sectionNamed(planOf("Vasca Kavat"), "components"))).toContainEqual({
      say: "resourceTitle",
      name: "Nano Spores",
      count: 1400,
    });
  });

  it("revives a Predasite through Son, pricing his blueprints from his stock", () => {
    const plan = planOf("Vizier Predasite");
    expect(titlesOf(plan.sections[0])).toContainEqual({
      say: "acquireTitle",
      name: "Tranq Rifle",
      count: 1,
    });
    const mutagen = rowsOf(plan.sections[1]).find((row) => row.id === "mutagen");
    expect(mutagen?.detail).toContainEqual({
      say: "sonPartsDetail",
      rank: "Stranger",
      cost: 1250,
    });
  });

  it("builds a Sister's hound on top of the Sister and keeps its recipe", () => {
    const plan = planOf("Bhaira Hound");
    expect(titlesOf(plan.sections[0])).toContainEqual({ say: "slotTitle", kind: "Companion" });
    expect(titlesOf(plan.sections[1]).at(-1)).toEqual({ say: "houndTitle" });
    expect(titlesOf(sectionNamed(plan, "components"))).toContainEqual({
      say: "resourceTitle",
      name: "Gallium",
      count: 5,
    });
  });
});

describe("prerequisites followed to the root", () => {
  it("puts every quest a quest needs before it, once", () => {
    expect(questsBefore(data.spine, ["The War Within"])).toEqual([
      "Natah",
      "The Second Dream",
      "The War Within",
    ]);
    expect(questsBefore(data.spine, ["The War Within", "Rising Tide"])).toEqual([
      "Natah",
      "The Second Dream",
      "The War Within",
      "Rising Tide",
    ]);
  });

  it("drops every quest the profile confirms, and everything before it", () => {
    const rows = (done: string[]) => rowsOf(planOf("Dante", done).sections[0]);
    expect(questsIn(rows([]))).toContain("Natah");
    const after = rows(["The New War"]);
    expect(questsIn(after)).not.toContain("Natah");
    expect(after.map((row) => row.id).join(" ")).not.toContain("Neptune Junction");
    expect(questsIn(after)).toContain("Whispers in the Walls");
    expect(questsIn(after)).toContain("Heart of Deimos");
  });

  it("raises the Mastery row to what a pending quest asks", () => {
    expect(planOf("Dante").sections[0]?.groups[0]?.rows[0]?.title).toEqual({
      say: "masteryTitle",
      rank: 4,
    });
  });

  it("reads the junctions a quest's requirement names", () => {
    expect(questNeeds(data.spine, "The War Within").junctions).toEqual([
      "Pluto Junction",
      "Sedna Junction",
    ]);
    expect(questNeeds(data.spine, "Heart of Deimos").junctions).toEqual(["Mars Junction"]);
    expect(questNeeds(data.spine, "The Silver Grove").mastery).toBe(7);
  });

  it("follows a quest the spine does not know as itself", () => {
    expect(questsBefore(data.spine, ["Not A Quest"])).toEqual(["Not A Quest"]);
  });
});
