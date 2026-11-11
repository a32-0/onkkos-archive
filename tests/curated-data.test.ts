import { readFileSync } from "node:fs";
import path from "node:path";

import { parse } from "yaml";
import { describe, expect, it } from "vitest";

import { canonicalMod, effectOf, lines, modFacts } from "@/domain/catalog/mod-effects";
import { catalogData } from "@/infra/catalog/data";
import { loadModStats } from "@/infra/catalog/mod-stats";
import { loadEvidenceRules } from "@/infra/narrative/evidence-load";

interface RawEntry {
  name: string;
  uniqueName: string;
  baseDrain?: number;
  fusionLimit?: number;
  polarity?: string;
  rarity?: string;
  type?: string;
  maxStats?: string[];
  components?: { uniqueName: string }[];
}

interface Syndicate {
  syndicate: string;
  tag: string;
  vendors: string[];
  ranks: string[];
  cite: string;
}

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, "data", file), "utf8");
const categories = (
  JSON.parse(read("vendor/items.json")) as { categories: Record<string, RawEntry[]> }
).categories;
const nodeTags = new Set(
  (JSON.parse(read("vendor/wiki-nodes.json")) as { nodes: { tag: string | null }[] }).nodes.flatMap(
    (node) => (node.tag ? [node.tag] : []),
  ),
);
const uniqueNames = new Set(
  Object.values(categories).flatMap((items) =>
    items.flatMap((item) => [
      item.uniqueName,
      ...(item.components ?? []).map((one) => one.uniqueName),
    ]),
  ),
);
const mods = categories["Mods"] ?? [];
const modNames = [...new Set(mods.map((mod) => mod.name))];
const rules = loadEvidenceRules();
const evidence = rules.rules;
const syndicates = (parse(read("sources.yaml")) as { syndicates: Syndicate[] }).syndicates;

describe("quest_evidence.yaml still points at the game's data", () => {
  it("every mission rule names a node the Star Chart has", () => {
    const lost = evidence.flatMap((rule) =>
      rule.evidence.kind === "mission" && !nodeTags.has(rule.evidence.tag)
        ? [`${rule.quest}: ${rule.evidence.tag}`]
        : [],
    );
    expect(lost).toEqual([]);
  });

  it("every item rule names an item the catalogue has", () => {
    const lost = evidence.flatMap((rule) =>
      rule.evidence.kind === "item" && !uniqueNames.has(rule.evidence.type)
        ? [`${rule.quest}: ${rule.evidence.type}`]
        : [],
    );
    expect(lost).toEqual([]);
  });
});

describe("sources.yaml still names what the game has", () => {
  it("every item it curates is in the catalogue, or is what an item is made from", () => {
    const data = catalogData();
    const made = (parse(read("acquisition.yaml")) as { acquisition: { from: string }[] })
      .acquisition;
    const known = new Set(
      [
        ...data.arsenal.map((item) => item.name),
        ...[...data.collectibles.values()].map((one) => one.name),
        ...data.resources.map((one) => one.name),
        ...made.map((one) => one.from),
      ].map((name) => name.toLowerCase()),
    );
    expect([...data.curated.items.keys()].filter((name) => !known.has(name))).toEqual([]);
  });
});

describe("sources.yaml syndicates", () => {
  it("gives each syndicate its own tag, its own vendors, a cite and its ranks", () => {
    const tags = syndicates.map((one) => one.tag);
    const vendors = syndicates.flatMap((one) => one.vendors);
    expect(new Set(tags).size).toBe(tags.length);
    expect(new Set(vendors).size).toBe(vendors.length);
    for (const one of syndicates) {
      expect(one.tag, one.syndicate).toMatch(/^[A-Za-z]+(Syndicate|Hub)?$/);
      expect(one.cite, one.syndicate).not.toBe("");
      expect(one.ranks.length, one.syndicate).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("the mods still carry what their page draws (BR-87)", () => {
  const facts = modNames.flatMap((name) => {
    const mod = canonicalMod(mods, name);
    const one = mod ? modFacts(mod) : null;
    return one ? [one] : [];
  });

  it("almost every mod has its numbers, and every one of those a rarity", () => {
    expect(facts.length / modNames.length).toBeGreaterThan(0.95);
    expect(facts.filter((one) => one.rarity === null)).toEqual([]);
  });

  it("most mods name a category", () => {
    expect(facts.filter((one) => one.category !== null).length / facts.length).toBeGreaterThan(0.9);
  });

  it("every curated stat fills the whole Mod effect: what, how much, an example and a note", () => {
    const stats = loadModStats();
    const short: string[] = [];
    for (const name of modNames) {
      const mod = canonicalMod(mods, name);
      for (const line of lines(mod?.maxStats ?? [])) {
        const effect = effectOf(stats, line, { trigger: () => "" });
        if (!effect.stat) continue;
        const curated = stats.stats.get(effect.stat.toLowerCase());
        const lowered = /^-/.test(line.text);
        if (!effect.amount || !effect.note || (lowered && !curated?.down) || !effect.example) {
          short.push(`${name}: ${line.text}`);
        }
      }
    }
    expect(short).toEqual([]);
  });

  it("every curated stat in mod_stats.yaml is still a stat of some mod", () => {
    const stats = loadModStats();
    const used = new Set<string>();
    for (const name of modNames) {
      const mod = canonicalMod(mods, name);
      for (const line of lines(mod?.maxStats ?? [])) {
        const effect = effectOf(stats, line, { trigger: () => "" });
        if (effect.stat) used.add(effect.stat.toLowerCase());
      }
    }
    const combined = new Set(
      Object.values(stats.elements).flatMap((pairs) =>
        Object.values(pairs).map((one) => one.toLowerCase()),
      ),
    );
    expect(
      [...stats.stats.keys()].filter((stat) => !used.has(stat) && !combined.has(stat)),
    ).toEqual([]);
  });

  it("every line of every mod is curated, as a shared stat or as the mod's own line", () => {
    const stats = loadModStats();
    const bare: string[] = [];
    for (const name of modNames) {
      const mod = canonicalMod(mods, name);
      if (mod?.type === "Focus Way") continue;
      const own = stats.mods.get(name.toLowerCase()) ?? [];
      for (const line of lines(mod?.maxStats ?? [])) {
        if (own.some((one) => line.text.includes(one.match))) continue;
        if (!effectOf(stats, line, { trigger: () => "" }).stat) bare.push(`${name}: ${line.text}`);
      }
    }
    expect(bare).toEqual([]);
  });

  it("every mod's own entry still matches a line the game writes for that mod", () => {
    const stats = loadModStats();
    const lost = [...stats.mods].flatMap(([name, own]) => {
      const mod = canonicalMod(mods, modNames.find((one) => one.toLowerCase() === name) ?? name);
      const texts = lines(mod?.maxStats ?? []).map((line) => line.text);
      return own
        .filter((one) => !texts.some((text) => text.includes(one.match)))
        .map((one) => `${name}: ${one.match}`);
    });
    expect(lost).toEqual([]);
  });
});
