import { z } from "zod";

const MATHS = ["grow", "shrink", "add", "times", "cost"] as const;

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

const rawFamily = z.object({ id: z.string(), icon: z.string(), match: z.string() });

const rawModStats = z.object({
  version: z.number(),
  last_verified: z.string().optional(),
  families: z.array(rawFamily),
  elements: z.record(z.string(), z.record(z.string(), z.string())),
  stats: z.array(rawStat),
});

type RawStat = z.infer<typeof rawStat>;

export interface ModStats {
  families: { id: string; icon: string; match: RegExp }[];
  elements: Readonly<Record<string, Readonly<Record<string, string>>>>;
  stats: ReadonlyMap<string, RawStat>;
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
  /^(?<sign>[+-])?(?<value>\d+(?:\.\d+)?)(?<unit>%)?\s+(?<stat>[^(]+?)(?:\s+for\s+(?<seconds>\d+(?:\.\d+)?)s)?(?:\.?\s*Stacks up to (?<stacks>\d+)x)?\.?$/;
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
    value: Number(value),
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
      : math === "add"
        ? base * (1 + share)
        : math === "shrink"
          ? base / (1 + share)
          : math === "cost"
            ? base * (1 - share)
            : base * (1 + share);
  const added = after - base;
  const top = Math.max(base, after);
  const line = example.line
    .replace("{base}", shown(base, unit))
    .replace("{after}", shown(after, unit))
    .replace("{added}", shown(added, unit))
    .replace("{amount}", shown(Math.abs(share) * 100, "%"));
  return {
    before: { value: shown(base, unit), share: base / top },
    after: { value: shown(after, unit), share: after / top },
    line,
  };
}

export function effectOf(
  stats: ModStats,
  line: { trigger: string | null; text: string },
  words: { trigger: (trigger: ModTrigger) => string },
): ModEffect {
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
    curated.example && (parsed.unit !== "" || curated.example.math === "times")
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

export interface ModFacts {
  ranks: number;
  capacity: number;
  slot: number;
  polarity: string | null;
}

export function modFacts(entry: {
  baseDrain?: number;
  fusionLimit?: number;
  polarity?: string;
}): ModFacts | null {
  if (entry.baseDrain === undefined || entry.fusionLimit === undefined) return null;
  const capacity = entry.baseDrain + entry.fusionLimit;
  const polarity = entry.polarity
    ? entry.polarity.charAt(0).toUpperCase() + entry.polarity.slice(1)
    : null;
  return { ranks: entry.fusionLimit, capacity, slot: Math.ceil(capacity / 2), polarity };
}

const VARIANT = /\/(Beginner|Intermediate|Expert)\//;

export function canonicalMod<T extends { name: string; uniqueName: string }>(
  entries: readonly T[],
  name: string,
): T | null {
  const named = entries.filter((entry) => entry.name === name);
  return named.find((entry) => !VARIANT.test(entry.uniqueName)) ?? named[0] ?? null;
}
