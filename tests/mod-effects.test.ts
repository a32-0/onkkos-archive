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
      aura: false,
      polarity: "Madurai",
      rarity: "common",
      category: "Primary",
    });
  });

  it("reads a number written with thousands separators", () => {
    const overguard = effects("Primed Pack Leader").find(
      (effect) => effect.stat === "Overguard Max",
    );
    expect(overguard?.amount).toBe("+2,200");
  });

  it("draws a share of something as growing from nothing", () => {
    const [arrows] = effects("Amalgam Daikyu Target Acquired").filter(
      (effect) => effect.stat === "chance to pickup used arrows",
    );
    expect(arrows?.example).toEqual({
      before: { value: "0", share: 0 },
      after: { value: "6", share: 1 },
      line: "Of 10 arrows fired, about 6 come back to you.",
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
    expect(speed?.example?.line).toBe("An attack speed of 1× becomes 1.7×.");
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
      aura: false,
      polarity: "Naramon",
      rarity: null,
      category: null,
    });
  });

  it("counts an aura's capacity as what it adds, and gives a Focus node none", () => {
    expect(modFacts({ baseDrain: -2, fusionLimit: 5, polarity: "madurai" })).toMatchObject({
      capacity: 7,
      aura: true,
    });
    expect(
      modFacts({ baseDrain: 4, fusionLimit: 3, polarity: "naramon", type: "Focus Way" }),
    ).toMatchObject({ capacity: null, polarity: null });
  });

  it("fills the whole effect from the mod's own entry when the game writes the line in prose", () => {
    const [own] = lines(modEntry("Hunter Adrenaline")?.maxStats ?? []).map((line) =>
      effectOf(stats, line, MOD, "Hunter Adrenaline"),
    );
    expect(own).toMatchObject({
      icon: "bolt",
      outcome: "Damage to your health gives you energy",
      amount: "+45%",
      stat: "Health damage to Energy",
      example: {
        before: { value: "0", share: 0 },
        after: { value: "45", share: 1 },
        line: "A hit that takes 100 health gives 45 energy.",
      },
    });
  });

  it("names the mod's category, and leaves out a type that is no category", () => {
    expect(modEntry("Intensify")?.facts?.category).toBe("Warframe");
    expect(modEntry("Berserker Fury")?.facts?.category).toBe("Melee");
    expect(modFacts({ baseDrain: 2, fusionLimit: 5, type: "Mod Set Mod" })?.category).toBeNull();
    expect(modFacts({ baseDrain: 2, fusionLimit: 5, type: "Focus Way" })?.category).toBeNull();
  });

  it("reads each mod's rarity, which colours its frame", () => {
    expect(modEntry("Serration")?.facts?.rarity).toBe("uncommon");
    expect(modEntry("Intensify")?.facts?.rarity).toBe("rare");
    expect(modEntry("Primed Continuity")?.facts?.rarity).toBe("legendary");
  });
});
