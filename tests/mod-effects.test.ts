import { describe, expect, it } from "vitest";

import { effectOf, lines, modFacts } from "@/domain/catalog/mod-effects";
import { MOD } from "@/content/mod";
import { loadModStats, modEntry } from "@/infra/catalog/mod-stats";
import { GLYPHS } from "@/ui/Icon/glyphs";

const stats = loadModStats();
const effects = (name: string) =>
  lines(modEntry(name)?.maxStats ?? []).map((line) => effectOf(stats, line, MOD));

describe("mod_stats.yaml", () => {
  it("names only icons the app draws, one per family", () => {
    const icons = stats.families.map((family) => family.icon);
    for (const icon of icons) expect(Object.keys(GLYPHS)).toContain(icon);
    expect(new Set(icons).size).toBe(icons.length);
  });
});

describe("a mod's effects (BR-87)", () => {
  it("reads the mod itself, never its Flawed or Expert twin", () => {
    expect(modEntry("Point Strike")?.uniqueName).toBe(
      "/Lotus/Upgrades/Mods/Rifle/WeaponCritChanceMod",
    );
    expect(modEntry("Point Strike")?.facts).toEqual({
      ranks: 5,
      capacity: 9,
      slot: 5,
      polarity: "Madurai",
    });
  });

  it("works the example out of the weapon's own value", () => {
    const [crit] = effects("Point Strike");
    expect(crit).toMatchObject({
      icon: "crisis-alert",
      outcome: "More critical hits",
      amount: "+150%",
      stat: "Critical Chance",
    });
    expect(crit?.example?.line).toBe("A weapon with 20% critical chance gets 50%.");
    expect(crit?.example?.before).toEqual({ value: "20%", share: 0.4 });
    expect(crit?.example?.after).toEqual({ value: "50%", share: 1 });
  });

  it("adds an element on top of the damage, and names what it pairs into", () => {
    const [toxin] = effects("Infected Clip");
    expect(toxin?.outcome).toBe("Adds poison damage");
    expect(toxin?.example?.line).toBe("A weapon that does 100 damage adds 90 Toxin.");
    expect(toxin?.pairs).toEqual([
      { with: "Heat", makes: "Gas" },
      { with: "Cold", makes: "Viral" },
      { with: "Electricity", makes: "Corrosive" },
    ]);
  });

  it("says a triggered bonus's condition last, and counts its stacks", () => {
    const [speed] = effects("Berserker Fury");
    expect(speed?.outcome).toBe("Faster melee attacks");
    expect(speed?.amount).toBe("+35%");
    expect(speed?.example?.line).toBe("Attacks come 70% faster.");
    expect(speed?.note).toBe(
      "Adds to other attack speed. Only after a melee kill, lasts 10 s, twice at most.",
    );
  });

  it("multiplies a faction mod, and turns a penalty's words", () => {
    expect(effects("Bane Of Grineer")[0]?.example?.line).toBe(
      "A shot of 100 damage does 130 to the Grineer.",
    );
    const [, efficiency] = effects("Blind Rage");
    expect(efficiency?.outcome).toBe("Abilities cost more energy");
    expect(efficiency?.example?.line).toBe("An ability that costs 50 energy costs 77.5.");
  });

  it("shows the game's own words, with its family's icon, for a stat with no curated copy", () => {
    const [augment] = effects("Adhesive Blast");
    expect(augment?.amount).toBeNull();
    expect(augment?.outcome).toMatch(/Grenades have 100% chance to stick/);
  });

  it("keeps the numbers a card needs", () => {
    expect(modFacts({ baseDrain: 6, fusionLimit: 5, polarity: "naramon" })).toEqual({
      ranks: 5,
      capacity: 11,
      slot: 6,
      polarity: "Naramon",
    });
  });
});
