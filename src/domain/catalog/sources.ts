import { z } from "zod";

import { NameMap } from "@/domain/catalog/wiki";

const cost = z.object({ currency: z.string(), amount: z.number() });
const part = { part: z.string().optional() };

const source = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("vendor"),
    vendor: z.string(),
    place: z.string().optional(),
    thing: z.string().optional(),
    costs: z.array(cost),
    quest: z.string().optional(),
    rank: z.string().optional(),
    earned: z.string().optional(),
    ...part,
  }),
  z.object({ type: z.literal("copies"), vendor: z.string(), costs: z.array(cost), ...part }),
  z.object({
    type: z.literal("market"),
    credits: z.number().optional(),
    platinum: z.number().optional(),
    blueprint: z.boolean().optional(),
    bundle: z.string().optional(),
    ...part,
  }),
  z.object({
    type: z.literal("quest"),
    quest: z.string(),
    choice: z.boolean().optional(),
    ...part,
  }),
  z.object({ type: z.literal("junction"), junction: z.string(), ...part }),
  z.object({ type: z.literal("enigma"), chance: z.number(), quest: z.string().optional() }),
  z.object({ type: z.literal("invasion") }),
  z.object({ type: z.literal("anniversary"), year: z.number().optional() }),
  z.object({
    type: z.literal("unavailable"),
    reason: z.enum(["founders", "stream", "exclusive", "pack", "seasonal", "promotion"]),
    event: z.string().optional(),
    until: z.string().optional(),
  }),
  z.object({ type: z.literal("race"), race: z.string(), place: z.string() }),
  z.object({ type: z.literal("bundled"), with: z.array(z.string()) }),
  z.object({
    type: z.literal("primeAccess"),
    warframe: z.string(),
    from: z.string(),
    until: z.string().optional(),
    resurgence: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("adversary"),
    adversary: z.string(),
    element: z.string().optional(),
    chance: z.number(),
  }),
  z.object({
    type: z.literal("nightwave"),
    ranks: z.array(z.object({ season: z.string(), rank: z.number() })),
  }),
  z.object({
    type: z.literal("drop"),
    source: z.string(),
    chance: z.number().optional(),
    ...part,
  }),
  z.object({ type: z.literal("scan"), target: z.string(), chance: z.number() }),
  z.object({ type: z.literal("cyst"), warframe: z.string(), days: z.number() }),
  z.object({ type: z.literal("dojo"), room: z.string(), credits: z.number().optional() }),
  z.object({
    type: z.literal("event"),
    event: z.string(),
    vendor: z.string().optional(),
    costs: z.array(cost).optional(),
    progress: z.number().optional(),
  }),
  z.object({ type: z.literal("goal"), focus: z.number(), wearing: z.string() }),
  z.object({
    type: z.literal("circuit"),
    mode: z.enum(["normal", "steelPath"]),
    tier: z.number().optional(),
    ...part,
  }),
]);

const entry = z.object({ item: z.string(), cite: z.string(), routes: z.array(source).min(1) });
const gate = z.object({ vendor: z.string(), quests: z.array(z.string()).min(1), cite: z.string() });

export type Cost = z.infer<typeof cost>;
export type CuratedSource = z.infer<typeof source>;
type CuratedEntry = z.infer<typeof entry>;

export interface Curated {
  gates: NameMap<string[]>;
  items: NameMap<CuratedEntry>;
}

export function normalizeSources(input: unknown): Curated {
  const raw = z.object({ vendors: z.array(gate), items: z.array(entry) }).parse(input);
  const items = new NameMap<CuratedEntry>();
  for (const one of raw.items) {
    if (items.has(one.item)) throw new Error(`duplicate source: ${one.item}`);
    items.set(one.item, one);
  }
  return { gates: new NameMap(raw.vendors.map((one) => [one.vendor, one.quests])), items };
}

export function vendorGates(curated: Curated, vendor: string): string[] {
  return curated.gates.get(vendor) ?? [];
}

export function curatedFor(
  curated: Curated,
  name: string,
  partName: string | null,
): CuratedSource[] {
  const found = curated.items.get(name);
  if (!found) return [];
  return found.routes.filter((route) => {
    const scoped = "part" in route ? route.part : undefined;
    return scoped === undefined || scoped === partName;
  });
}
