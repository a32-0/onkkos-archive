import { z } from "zod";

const MATHS = ["grow", "shrink", "add", "times", "cost", "plus", "part"] as const;

const rawExample = z.object({
  math: z.enum(MATHS),
  base: z.number(),
  unit: z.string(),
  line: z.string(),
});

const rawStat = z.object({
  stat: z.string(),
  outcome: z.string(),
  down: z.string().optional(),
  example: rawExample.optional(),
  note: z.string().optional(),
});

const rawLine = z.object({
  match: z.string(),
  outcome: z.string(),
  amount: z.string(),
  stat: z.string(),
  example: z.object({ before: z.number(), after: z.number(), unit: z.string(), line: z.string() }),
  note: z.string(),
});

const rawMod = z.object({ mod: z.string(), lines: z.array(rawLine).min(1) });

const rawFamily = z.object({ id: z.string(), icon: z.string(), match: z.string() });

const rawModStats = z.object({
  version: z.number(),
  last_verified: z.string().optional(),
  families: z.array(rawFamily),
  elements: z.record(z.string(), z.record(z.string(), z.string())),
  stats: z.array(rawStat),
  mods: z.array(rawMod).default([]),
});

type RawStat = z.infer<typeof rawStat>;
type RawLine = z.infer<typeof rawLine>;

export interface ModStats {
  families: { id: string; icon: string; match: RegExp }[];
  elements: Readonly<Record<string, Readonly<Record<string, string>>>>;
  stats: ReadonlyMap<string, RawStat>;
  mods: ReadonlyMap<string, readonly RawLine[]>;
}

export function normalizeModStats(input: unknown): ModStats {
  const raw = rawModStats.parse(input);
  return {
    families: raw.families.map((family) => ({
      id: family.id,
      icon: family.icon,
      match: new RegExp(family.match, "i"),
    })),
    elements: raw.elements,
    stats: new Map(raw.stats.map((stat) => [stat.stat.toLowerCase(), stat])),
    mods: new Map(raw.mods.map((mod) => [mod.mod.toLowerCase(), mod.lines])),
  };
}

interface ModBar {
  value: string;
  share: number;
}

interface ModExample {
  before: ModBar;
  after: ModBar;
  line: string;
}

export interface ModEffect {
  icon: string;
  outcome: string;
  amount: string | null;
  stat: string | null;
  example: ModExample | null;
  note: string | null;
  pairs: { with: string; makes: string }[];
}

export interface ModTrigger {
  on: string;
  seconds: number | null;
  stacks: number | null;
}

interface Parsed {
  sign: 1 | -1;
  value: number;
  unit: "%" | "x" | "";
  stat: string;
  seconds: number | null;
  stacks: number | null;
}

const TAG = /<[^>]+>/g;
const AMOUNT =
  /^(?<sign>[+-])?(?<value>\d+(?:,\d{3})*(?:\.\d+)?)(?<unit>%)?\s+(?<stat>[^(]+?)(?:\s+for\s+(?<seconds>\d+(?:\.\d+)?)s)?(?:\.?\s*Stacks up to (?<stacks>\d+)x)?\.?$/;
const TIMES = /^x(?<value>\d+(?:\.\d+)?)\s+(?<stat>Damage to [A-Za-z]+)$/;

function cleanLine(line: string): string {
  return line.replace(TAG, "").replace(/\s+/g, " ").trim();
}

function parseLine(line: string): Parsed | null {
  const clean = cleanLine(line);
  const times = TIMES.exec(clean);
  if (times?.groups) {
    return {
      sign: 1,
      value: Number(times.groups["value"]),
      unit: "x",
      stat: times.groups["stat"] ?? "",
      seconds: null,
      stacks: null,
    };
  }
  const found = AMOUNT.exec(clean);
  if (!found?.groups) return null;
  const { sign, value, unit, stat, seconds, stacks } = found.groups;
  return {
    sign: sign === "-" ? -1 : 1,
    value: Number((value ?? "").replace(/,/g, "")),
    unit: unit === "%" ? "%" : "",
    stat: (stat ?? "").trim(),
    seconds: seconds ? Number(seconds) : null,
    stacks: stacks ? Number(stacks) : null,
  };
}

export function lines(stats: readonly string[]): { trigger: string | null; text: string }[] {
  const out: { trigger: string | null; text: string }[] = [];
  for (const entry of stats) {
    let trigger: string | null = null;
    for (const part of entry.split(/\\n|\n/)) {
      const text = cleanLine(part.replace(/<LINE_SEPARATOR>/g, ""));
      if (text === "") continue;
      if (text.endsWith(":")) {
        trigger = text.slice(0, -1);
        continue;
      }
      out.push({ trigger, text });
    }
  }
  return out;
}

function familyIcon(stats: ModStats, text: string): string {
  const family = stats.families.find((one) => one.match.source === "" || one.match.test(text));
  return family?.icon ?? "extension";
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function shown(value: number, unit: string): string {
  const number = round(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
  return `${number}${unit}`;
}

function exampleOf(
  example: NonNullable<RawStat["example"]>,
  parsed: Parsed,
  share: number,
): ModExample {
  const { base, unit, math } = example;
  const after =
    math === "times"
      ? base * parsed.value
      : math === "plus" || parsed.unit === ""
        ? base + parsed.sign * parsed.value
        : math === "part"
          ? base * Math.abs(share)
          : math === "add"
            ? base * (1 + share)
            : math === "shrink"
              ? base / (1 + share)
              : math === "cost"
                ? base * (1 - share)
                : base * (1 + share);
  const start = math === "part" ? 0 : base;
  const added = after - start;
  const top = Math.max(start, after) || 1;
  const line = example.line
    .replace("{base}", shown(base, unit))
    .replace("{after}", shown(after, unit))
    .replace("{added}", shown(added, unit))
    .replace("{amount}", shown(Math.abs(share) * 100, "%"));
  return {
    before: { value: shown(start, unit), share: start / top },
    after: { value: shown(after, unit), share: after / top },
    line,
  };
}

function fits(math: (typeof MATHS)[number], unit: Parsed["unit"]): boolean {
  if (math === "times") return unit === "x";
  if (math === "plus") return unit === "";
  if (math === "part") return unit === "%";
  return unit !== "x";
}

function ownLine(own: RawLine, icon: string, trigger: string | null): ModEffect {
  const { before, after, unit, line } = own.example;
  const top = Math.max(before, after) || 1;
  return {
    icon,
    outcome: own.outcome,
    amount: own.amount,
    stat: own.stat,
    example: {
      before: { value: shown(before, unit), share: before / top },
      after: { value: shown(after, unit), share: after / top },
      line,
    },
    note: [own.note, trigger].filter((part): part is string => !!part).join(" "),
    pairs: [],
  };
}

export function effectOf(
  stats: ModStats,
  line: { trigger: string | null; text: string },
  words: { trigger: (trigger: ModTrigger) => string },
  mod?: string,
): ModEffect {
  const own = mod
    ? stats.mods.get(mod.toLowerCase())?.find((one) => line.text.includes(one.match))
    : undefined;
  if (own) {
    const trigger = line.trigger
      ? words.trigger({ on: line.trigger, seconds: null, stacks: null })
      : null;
    return ownLine(own, familyIcon(stats, own.stat), trigger);
  }
  const parsed = parseLine(line.text);
  const curated = parsed ? stats.stats.get(parsed.stat.toLowerCase()) : undefined;
  const icon = familyIcon(stats, parsed?.stat ?? line.text);
  const trigger = line.trigger
    ? words.trigger({
        on: line.trigger,
        seconds: parsed?.seconds ?? null,
        stacks: parsed?.stacks ?? null,
      })
    : null;
  if (!parsed || !curated) {
    return {
      icon,
      outcome: line.text,
      amount: null,
      stat: null,
      example: null,
      note: trigger,
      pairs: [],
    };
  }
  const stacked = parsed.stacks ?? 1;
  const share = parsed.unit === "%" ? (parsed.sign * parsed.value * stacked) / 100 : 0;
  const amount =
    parsed.unit === "x"
      ? `×${shown(parsed.value, "")}`
      : `${parsed.sign < 0 ? "-" : "+"}${shown(parsed.value, parsed.unit)}`;
  const outcome = parsed.sign < 0 && curated.down ? curated.down : curated.outcome;
  const pairs = Object.entries(stats.elements[curated.stat] ?? {}).map(([other, makes]) => ({
    with: other,
    makes,
  }));
  const example =
    curated.example && fits(curated.example.math, parsed.unit)
      ? exampleOf(curated.example, parsed, share)
      : null;
  return {
    icon,
    outcome,
    amount,
    stat: curated.stat,
    example,
    note: [curated.note, trigger].filter((part): part is string => !!part).join(" ") || null,
    pairs,
  };
}

const RARITIES = ["common", "uncommon", "rare", "legendary"] as const;
export type Rarity = (typeof RARITIES)[number];

export interface ModFacts {
  ranks: number;
  capacity: number | null;
  aura: boolean;
  polarity: string | null;
  rarity: Rarity | null;
  category: string | null;
}

const MOD_TYPE = /^(.+) Mod$/;
const FOCUS_WAY = "Focus Way";

function categoryOf(type: string | undefined): string | null {
  const category = MOD_TYPE.exec(type ?? "")?.[1] ?? null;
  return category === null || category.includes("Mod") ? null : category;
}

function rarityOf(value: string | undefined): Rarity | null {
  const key = value?.toLowerCase();
  return RARITIES.find((one) => one === key) ?? null;
}

export function modFacts(entry: {
  baseDrain?: number;
  fusionLimit?: number;
  polarity?: string;
  rarity?: string;
  type?: string;
}): ModFacts | null {
  if (entry.baseDrain === undefined || entry.fusionLimit === undefined) return null;
  const aura = entry.baseDrain < 0;
  const capacity = entry.type === FOCUS_WAY ? null : Math.abs(entry.baseDrain) + entry.fusionLimit;
  const polarity = entry.polarity
    ? entry.polarity.charAt(0).toUpperCase() + entry.polarity.slice(1)
    : null;
  return {
    ranks: entry.fusionLimit,
    capacity,
    aura,
    polarity: capacity === null ? null : polarity,
    rarity: rarityOf(entry.rarity),
    category: categoryOf(entry.type),
  };
}

const VARIANT = /\/(Beginner|Intermediate|Expert)\//;

export function canonicalMod<T extends { name: string; uniqueName: string }>(
  entries: readonly T[],
  name: string,
): T | null {
  const named = entries.filter((entry) => entry.name === name);
  return named.find((entry) => !VARIANT.test(entry.uniqueName)) ?? named[0] ?? null;
}
