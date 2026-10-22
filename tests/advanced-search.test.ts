import { describe, expect, it } from "vitest";

import { browseCatalog } from "@/domain/catalog/search";
import type { SearchInput } from "@/screens/goals/state";
import type { SearchFilters } from "@/screens/search/state";
import {
  chosen,
  cleared,
  matches,
  PAGE,
  parseFilters,
  searchHref,
  searchPage,
  toggledType,
} from "@/screens/search/view";

import { testData } from "./helpers";

const none: SearchFilters = {
  term: "",
  types: [],
  state: null,
  reach: false,
  vaulted: false,
  shown: PAGE,
};

const read = (query: Record<string, string>) => (name: string) => query[name] ?? null;

const input = (name: string, extra: Partial<SearchInput> = {}): SearchInput => ({
  kind: "item",
  name,
  catalogue: "warframes",
  art: null,
  system: null,
  gap: null,
  score: 1,
  standing: null,
  vaulted: false,
  ...extra,
});

describe("the advanced search's address (spec 12)", () => {
  it("reads every filter from the address and drops what it does not know", () => {
    expect(
      parseFilters(
        read({
          q: "em",
          type: "mods,nonsense,warframes",
          state: "done",
          reach: "1",
          vaulted: "hide",
          shown: "47",
        }),
      ),
    ).toEqual({
      term: "em",
      types: ["warframes", "mods"],
      state: "done",
      reach: true,
      vaulted: true,
      shown: 40,
    });
    expect(parseFilters(read({ state: "maybe", shown: "-3" }))).toEqual(none);
  });

  it("writes back the same address it reads", () => {
    const filters = parseFilters(read({ q: "em", type: "mods", state: "absent", reach: "1" }));
    expect(searchHref(filters)).toBe("/search?q=em&type=mods&state=absent&reach=1");
    expect(
      parseFilters(read(Object.fromEntries(new URL(searchHref(filters), "http://x").searchParams))),
    ).toEqual(filters);
    expect(searchHref(none)).toBe("/search");
  });

  it("names what is on, and clears it but the term", () => {
    const filters = { ...none, term: "em", types: ["mods" as const], reach: true };
    expect(chosen(filters)).toEqual(["Mods", "In my reach"]);
    expect(cleared(filters)).toEqual({ ...none, term: "em" });
  });

  it("toggles a type in the chips' order and starts the list again", () => {
    const one = toggledType({ ...none, shown: 60 }, "mods");
    expect(one).toMatchObject({ types: ["mods"], shown: PAGE });
    expect(toggledType(one, "warframes").types).toEqual(["warframes", "mods"]);
    expect(toggledType(one, "mods").types).toEqual([]);
  });
});

describe("the advanced search's filters (spec 12, BR-68)", () => {
  it("keeps what each filter allows", () => {
    const mod = input("Serration", { catalogue: "mods" });
    expect(matches(mod, { ...none, types: ["mods"] })).toBe(true);
    expect(matches(mod, { ...none, types: ["weapons"] })).toBe(false);
    expect(
      matches(input("Braton", { catalogue: "primary" }), { ...none, types: ["weapons"] }),
    ).toBe(true);
    expect(matches(input("Ash", { standing: "done" }), { ...none, state: "done" })).toBe(true);
    expect(matches(mod, { ...none, state: "absent" })).toBe(false);
    expect(matches(input("Axi A1 Relic", { vaulted: true }), { ...none, vaulted: true })).toBe(
      false,
    );
  });

  it("keeps a result beyond reach, with its gap, unless In my reach is chosen", () => {
    const nidus = input("Nidus", { gap: { kind: "rank", need: 8, have: 5 } });
    expect(matches(nidus, none)).toBe(true);
    expect(matches(nidus, { ...none, reach: true })).toBe(false);
  });

  it("shows twenty, closest first, and says whether more wait", () => {
    const many = Array.from({ length: 25 }, (_, index) => input(`Item ${index}`));
    const page = searchPage([input("Ember", { score: 4 }), ...many], none);
    expect(page.total).toBe(26);
    expect(page.rows).toHaveLength(PAGE);
    expect(page.rows[0]?.name).toBe("Ember");
    expect(page.more).toBe(true);
    expect(searchPage(many, { ...none, shown: 40 }).more).toBe(false);
  });

  it("lists the whole catalog by name when no term is given", () => {
    const all = browseCatalog(testData(), new Map());
    const names = all.map((hit) => hit.name.toLowerCase());
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(all.length).toBeGreaterThan(4000);
    expect(all.find((hit) => hit.name === "Ash Prime")?.vaulted).toBeTypeOf("boolean");
  });
});
