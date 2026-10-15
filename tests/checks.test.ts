import { afterEach, describe, expect, it, vi } from "vitest";

import { SYNDICATE_RE } from "@/domain/catalog/acquisition";
import type { StepPlan, StepRow } from "@/domain/catalog/checks";
import { namesItem, partKey, vendorOffer } from "@/domain/catalog/rewards";
import {
  acquisitionParagraphs,
  leadParagraphs,
  paragraphs,
  sectionOf,
  wikiPassage,
} from "@/infra/wiki/client";
import { gameIcons, placeIcons } from "@/infra/wiki/icons";
import { withProse } from "@/infra/wiki/prose";

import { testData } from "./helpers";

const EXTRACT = [
  "Shrine Defense is a Mission type.",
  "Access requires the Saya's Vigil quest.",
  "",
  "== General ==",
  "Saya is haunted by dreams of Cetus.",
  "",
  "== Mechanics ==",
  "Unlike standard Defense, the objective has no health bar.",
  "Offerings are prepared every 30 seconds.",
  "",
  "=== Shrine Blessing ===",
  "The shrine produces Health Orbs.",
  "",
  "== Rewards ==",
  "Rotation A holds the blueprints.",
].join("\n");

function wikiReturns(pages: Record<string, string>) {
  const calls: { url: string; init: RequestInit }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      const title = new URL(url).searchParams.get("titles") ?? "";
      const extract = pages[title];
      return Response.json({
        query: { pages: [extract === undefined ? { title, missing: true } : { title, extract }] },
      });
    }),
  );
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

describe("sectionOf", () => {
  it("returns the named section and its subsections", () => {
    const body = sectionOf(EXTRACT, ["Mechanics"]);
    expect(body).toContain("no health bar");
    expect(body).toContain("every 30 seconds");
    expect(body).toContain("Health Orbs");
  });

  it("stops at the next heading of the same level", () => {
    expect(sectionOf(EXTRACT, ["Mechanics"])).not.toContain("Rotation A");
  });

  it("falls through the heading list in order", () => {
    expect(sectionOf(EXTRACT, ["Missing", "General"])).toContain("haunted by dreams");
  });

  it("returns null when no heading matches", () => {
    expect(sectionOf(EXTRACT, ["Nowhere"])).toBeNull();
  });

  it("never returns the lead paragraph as a section", () => {
    expect(sectionOf(EXTRACT, ["Mechanics"])).not.toContain("is a Mission type");
  });
});

describe("paragraphs", () => {
  it("keeps every paragraph of the passage (BR-48)", () => {
    expect(paragraphs("one\n\ntwo\n\nthree\n\nfour\n\nfive")).toHaveLength(5);
  });

  it("drops empty lines and closes the gap an icon leaves", () => {
    expect(paragraphs("one\n\n\n\ntwo  words .")).toEqual(["one", "two words."]);
  });
});

describe("leadParagraphs", () => {
  it("skips an opening quote that ends in an attribution", () => {
    expect(
      leadParagraphs(
        "I was to be a scientist. Provide me samples.—Son\nSon is the alias of the son of House Entrati.",
      ),
    ).toEqual(["Son is the alias of the son of House Entrati."]);
  });

  it("drops a hatnote", () => {
    expect(
      leadParagraphs("For the mission, see Jackal (Mission).\nJackal is the Corpus boss of Venus."),
    ).toEqual(["Jackal is the Corpus boss of Venus."]);
  });
});

describe("the wiki's Acquisition prose", () => {
  it("drops the drop-table boilerplate and the gaps icons leave", () => {
    const body = [
      "Ember's main blueprint can be purchased from the Market.",
      "All drop rates data is obtained from DE's official drop tables.",
      "See Mission Rewards#Standard Missions for definitions.",
      "A fully built Braton can be purchased for  25,000 .",
    ].join("\n");
    expect(acquisitionParagraphs(body)).toEqual([
      "Ember's main blueprint can be purchased from the Market.",
      "A fully built Braton can be purchased for 25,000.",
    ]);
  });
});

describe("the passage each source names (BR-48)", () => {
  it("reads a mission type's Mechanics, subsections included", async () => {
    wikiReturns({ "Shrine Defense": EXTRACT });
    expect(await wikiPassage("Shrine Defense", "mechanics")).toEqual([
      "Unlike standard Defense, the objective has no health bar.",
      "Offerings are prepared every 30 seconds.",
      "The shrine produces Health Orbs.",
    ]);
  });

  it("falls back to the lead when a page has no Mechanics", async () => {
    wikiReturns({ Survival: "Survival is a mission type.\n\n== Rewards ==\nRotation A." });
    expect(await wikiPassage("Survival", "mechanics")).toEqual(["Survival is a mission type."]);
  });

  it("reads the lead of anything else, in its paragraphs", async () => {
    wikiReturns({ Jackal: "Jackal is the Corpus boss.\nHe walks.\n\n== Strategy ==\nShoot." });
    expect(await wikiPassage("Jackal", "lead")).toEqual([
      "Jackal is the Corpus boss.",
      "He walks.",
    ]);
  });

  it("reads a Hound's Acquisition from its model's section of another page", async () => {
    const model = [
      "A Model is the head of a MOA or a Hound.",
      "",
      "== Hound Types ==",
      "",
      "=== Bhaira ===",
      "The Bhaira blueprint can be earned by vanquishing a Sisters of Parvos.",
      "",
      "=== Dorma ===",
      "The Dorma blueprint can be earned by vanquishing a Sisters of Parvos.",
    ].join("\n");
    wikiReturns({ "Model#Bhaira": model });
    expect(await wikiPassage("Model#Bhaira", "acquisition")).toEqual([
      "The Bhaira blueprint can be earned by vanquishing a Sisters of Parvos.",
    ]);
  });

  it("keeps a vendor's lead when its title names a section", async () => {
    wikiReturns({
      "Acrithis#Enigma Archives": "Acrithis is a merchant.\n\n== Enigma Archives ==\nA table.",
    });
    expect(await wikiPassage("Acrithis#Enigma Archives", "lead")).toEqual([
      "Acrithis is a merchant.",
    ]);
  });

  it("reads an item's Acquisition section and nothing when it has none", async () => {
    wikiReturns({
      Ember: "Ember is a Warframe.\n\n== Acquisition ==\nEmber's blueprint is in the Market.",
      Excalibur: "Excalibur is a Warframe.",
    });
    expect(await wikiPassage("Ember", "acquisition")).toEqual([
      "Ember's blueprint is in the Market.",
    ]);
    expect(await wikiPassage("Excalibur", "acquisition")).toBeNull();
  });

  it("skips a disambiguation page", async () => {
    wikiReturns({ Caches: "Cache may refer to:\n\nCredit Cache, a type of Credits reward" });
    expect(await wikiPassage("Caches", "lead")).toBeNull();
  });

  it("keeps a page that only mentions the phrase inside a word", async () => {
    wikiReturns({ Survival: "Survival dismay refer tolls." });
    expect(await wikiPassage("Survival", "lead")).toEqual(["Survival dismay refer tolls."]);
  });

  it("answers null for a missing page or a failed read", async () => {
    wikiReturns({});
    expect(await wikiPassage("Nowhere", "lead")).toBeNull();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 500 })),
    );
    expect(await wikiPassage("Jackal", "lead")).toBeNull();
  });

  it("keeps the read in Next's data cache for a day", async () => {
    const calls = wikiReturns({ Jackal: "Jackal is the Corpus boss." });
    await wikiPassage("Jackal", "lead");
    expect(calls[0]?.init.cache).toBe("force-cache");
    expect(calls[0]?.init.next).toEqual({ revalidate: 86_400 });
  });
});

describe("withProse", () => {
  const row = (id: string, prose: StepRow["prose"], wikiTitle: string | null): StepRow => ({
    id,
    title: { say: "invasionTitle" },
    detail: [],
    brief: [],
    where: [],
    prose,
    wikiTitle,
    imageUrl: null,
    best: false,
    alternative: false,
    optional: false,
    thing: null,
    gear: null,
  });

  it("asks the wiki once per page and source, and fills every row that asked", async () => {
    const calls = wikiReturns({
      Jackal: "Jackal is the Corpus boss.\n\n== Mechanics ==\nHe walks.",
    });
    const plan: StepPlan = {
      sections: [
        {
          id: "how",
          title: { say: "sectionHowToGet" },
          imageUrl: null,
          checkable: false,
          groups: [
            {
              title: null,
              rows: [
                row("a", { title: "Jackal", source: "lead" }, "Jackal"),
                row("b", { title: "Jackal", source: "lead" }, null),
                row("c", { title: "Jackal", source: "mechanics" }, null),
                row("d", null, null),
              ],
            },
          ],
        },
      ],
    };
    const rows = (await withProse(testData().wiki, plan))[0]?.groups[0]?.rows ?? [];
    expect(rows.map((one) => one.prose)).toEqual([
      ["Jackal is the Corpus boss."],
      ["Jackal is the Corpus boss."],
      ["He walks."],
      null,
    ]);
    expect(rows[0]?.wikiTitle).toBe("Jackal");
    expect(calls).toHaveLength(2);
  });
});

describe("the wiki's icons", () => {
  function filesReturn(found: string[]) {
    const asked: string[][] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const titles = (new URL(url).searchParams.get("titles") ?? "").split("|");
        asked.push(titles);
        return Response.json({
          query: {
            pages: titles.map((title) =>
              found.includes(title)
                ? { title, imageinfo: [{ url: `https://wiki.test/${title}` }] }
                : { title, missing: true },
            ),
          },
        });
      }),
    );
    return asked;
  }

  it("names the game's icons by their role", async () => {
    filesReturn(["File:IconQuest(xWhite).png", "File:IconLocked(xWhite).png"]);
    expect(await gameIcons()).toEqual({
      quests: "https://wiki.test/File:IconQuest(xWhite).png",
      locked: "https://wiki.test/File:IconLocked(xWhite).png",
    });
  });

  it("reads each place's art by its name, in one request", async () => {
    const asked = filesReturn(["File:Earth.png"]);
    expect(await placeIcons(["Earth", "Venus"])).toEqual({
      Earth: "https://wiki.test/File:Earth.png",
    });
    expect(asked).toEqual([["File:Earth.png", "File:Venus.png"]]);
  });

  it("answers no icon rather than failing when the wiki is down", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    expect(await placeIcons(["Earth"])).toEqual({});
  });
});

describe("partKey", () => {
  it("matches a reward name to its recipe part", () => {
    expect(partKey("Koumei Chassis Blueprint", "Koumei")).toBe("chassis");
    expect(partKey("Chassis", "Koumei")).toBe("chassis");
  });

  it("keeps the bare blueprint distinct from a part blueprint", () => {
    expect(partKey("Koumei Blueprint", "Koumei")).toBe("blueprint");
    expect(partKey("Blueprint", "Koumei")).toBe("blueprint");
  });

  it("leaves an unrelated reward name alone", () => {
    expect(partKey("Fate Pearl", "Koumei")).toBe("fate pearl");
  });
});

describe("namesItem", () => {
  it("does not let a prefix match a different item", () => {
    expect(namesItem("Somatic Fibers", "Soma")).toBe(false);
  });

  it("matches the item and its parts", () => {
    expect(namesItem("Soma", "Soma")).toBe(true);
    expect(namesItem("Koumei Chassis Blueprint", "Koumei")).toBe(true);
  });
});

describe("vendorOffer", () => {
  it("recovers the vendor and the rank the location string carries", () => {
    expect(vendorOffer("Solaris United (Rude Zuud), Neutral", SYNDICATE_RE)).toEqual({
      syndicate: "Solaris United",
      vendor: "Rude Zuud",
      rank: "Neutral",
    });
  });

  it("works without a named vendor", () => {
    expect(vendorOffer("Cephalon Suda, Genius", SYNDICATE_RE)).toEqual({
      syndicate: "Cephalon Suda",
      vendor: null,
      rank: "Genius",
    });
  });

  it("ignores a mission node that is not a syndicate", () => {
    expect(vendorOffer("Earth/Saya's Visions (Shrine Defense)", SYNDICATE_RE)).toBeNull();
  });
});
