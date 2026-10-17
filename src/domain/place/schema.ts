import { z } from "zod";

const ACQUISITION_VERBS = [
  "drop",
  "bounty",
  "conservation",
  "vendor",
  "research",
  "incubate",
  "lich",
  "granum",
  "quest",
  "market",
] as const;

export type AcquisitionVerb = (typeof ACQUISITION_VERBS)[number];

const rawRow = z.object({
  item: z.string().min(1),
  place: z.string().min(1).nullable(),
  verb: z.enum(ACQUISITION_VERBS),
  from: z.string().min(1),
  verify: z.boolean(),
});

const rawFile = z.object({
  acquisition: z.array(rawRow).min(1),
});

export interface CuratedAcquisition {
  item: string;
  place: string | null;
  verb: AcquisitionVerb;
  from: string;
  verify: boolean;
}

export function normalizeAcquisition(input: unknown): CuratedAcquisition[] {
  const parsed = rawFile.parse(input);
  const seen = new Set<string>();
  for (const row of parsed.acquisition) {
    if (seen.has(row.item)) throw new Error(`duplicate acquisition row: ${row.item}`);
    seen.add(row.item);
  }
  return parsed.acquisition;
}

const rawReward = z.object({
  rotation: z.string().nullable(),
  item: z.string().min(1),
  chance: z.number().nullable(),
  rarity: z.string().nullable(),
  stage: z.string().nullable().optional(),
});

const rawNode = z.object({
  node: z.string().min(1),
  mission: z.string().nullable(),
  isEvent: z.boolean(),
  rewards: z.array(rawReward),
});

const rawPlaceRewards = z.object({
  places: z.record(z.string(), z.array(rawNode)),
});

const rawRegionResources = z.object({
  regions: z.record(z.string(), z.array(z.string())),
});

export type PlaceRewards = z.infer<typeof rawPlaceRewards>["places"];
export type RegionResources = z.infer<typeof rawRegionResources>["regions"];

export function normalizePlaceRewards(input: unknown): PlaceRewards {
  return rawPlaceRewards.parse(input).places;
}

export function normalizeRegionResources(input: unknown): RegionResources {
  return rawRegionResources.parse(input).regions;
}

export const DOJO = "Dojo";

const rawSystem = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  places: z.array(z.string()),
  released: z.boolean(),
});

const rawSystemsFile = z.object({
  aliases: z.record(z.string(), z.string().min(1)),
  hubs: z.record(z.string(), z.string().min(1)),
  systems: z.array(rawSystem).min(1),
});

export interface SystemEntry {
  id: string;
  name: string;
  places: string[];
  released: boolean;
}

export interface Systems {
  systems: SystemEntry[];
  aliases: Record<string, string>;
  hubs: Record<string, string>;
}

export function normalizeSystems(input: unknown): Systems {
  const parsed = rawSystemsFile.parse(input);
  return { systems: parsed.systems, aliases: parsed.aliases, hubs: parsed.hubs };
}

export function canonicalPlace(aliases: Readonly<Record<string, string>>, name: string): string {
  return aliases[name] ?? name;
}

export function withCanonicalPlaces<T>(
  record: Readonly<Record<string, T[]>>,
  aliases: Readonly<Record<string, string>>,
): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const [name, values] of Object.entries(record)) {
    const place = canonicalPlace(aliases, name);
    out[place] = [...(out[place] ?? []), ...values];
  }
  return out;
}

const rawResearchEntry = z.object({
  lab: z.string().min(1),
  prereq: z.string().nullable(),
  credits: z.number().nullable(),
  seconds: z.number().nullable(),
  resources: z.array(z.object({ name: z.string(), count: z.number() })),
});

const rawResearch = z.object({
  research: z.record(z.string(), rawResearchEntry),
});

export type ResearchEntry = z.infer<typeof rawResearchEntry>;

export type Research = Record<string, ResearchEntry>;

export function normalizeResearch(input: unknown): Research {
  return rawResearch.parse(input).research;
}
