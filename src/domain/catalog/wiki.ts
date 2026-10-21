import { z } from "zod";

import type { Research, ResearchEntry } from "@/domain/place/schema";

const recipePart = z.object({ name: z.string(), count: z.number(), type: z.string() });

const blueprint = z.object({
  result: z.string(),
  credits: z.number().nullable(),
  bpCost: z.number().nullable(),
  marketCost: z.number().nullable(),
  seconds: z.number().nullable(),
  parts: z.array(recipePart),
});

const node = z.object({
  name: z.string(),
  planet: z.string().nullable(),
  type: z.string().nullable(),
  boss: z.string().nullable(),
  link: z.string(),
  requirements: z.string().nullable(),
  drops: z.array(z.string()),
});

const resource = z.object({
  rarity: z.string().nullable(),
  type: z.string().nullable(),
  location: z.string().nullable(),
  link: z.string(),
  image: z.string().nullable().default(null),
});

const offer = z.object({
  item: z.string(),
  type: z.string(),
  cost: z.number().nullable(),
  costs: z.record(z.string(), z.number()).nullable(),
  rank: z.string().nullable(),
  quest: z.string().nullable(),
});

const vendor = z.object({
  name: z.string(),
  key: z.string(),
  link: z.string(),
  currency: z.string().nullable(),
  kind: z.string().nullable(),
  offers: z.array(offer),
});

const baroOffer = z.object({
  credits: z.number().nullable(),
  ducats: z.number().nullable(),
  lastOffered: z.string().nullable(),
});

const adversary = z.object({
  trait: z.string(),
  name: z.string(),
  page: z.string(),
  larva: z.string().nullable(),
  links: z.array(z.string()),
  encounter: z.string().nullable(),
  create: z.string().nullable(),
  trade: z.string().nullable(),
  intrinsics: z.object({ place: z.string(), rank: z.number() }).nullable(),
});

const honoria = z.object({
  description: z.string().nullable(),
  tags: z.array(z.string()),
  price: z.array(z.object({ currency: z.string(), amount: z.number() })),
});

const relic = z.object({
  drops: z.array(z.object({ item: z.string(), part: z.string(), rarity: z.string() })),
});

const rotation = z.object({
  anchor: z.string(),
  period: z.number(),
  weeks: z.array(z.object({ index: z.number(), choices: z.array(z.string()) })),
});

const circuit = z.object({
  tiers: z.record(z.string(), z.number()),
  normal: rotation,
  steelPath: rotation,
});

const incarnon = z.object({
  requires: z.array(z.string()),
  install: z.array(z.object({ name: z.string(), count: z.number() })),
  platinum: z.number().nullable(),
});

const honoriaTag = z.object({
  vendor: z.string().nullable(),
  place: z.string().nullable(),
  quests: z.array(z.string()),
  line: z.string().nullable(),
});

export type WikiNode = z.infer<typeof node>;
export type WikiResource = z.infer<typeof resource>;
type WikiVendor = z.infer<typeof vendor>;
export type WikiHonoria = z.infer<typeof honoria>;
export type WikiRotation = z.infer<typeof rotation>;
export type WikiCircuit = z.infer<typeof circuit>;
type WikiBlueprint = z.infer<typeof blueprint>;
type WikiBaroOffer = z.infer<typeof baroOffer>;
type WikiAdversary = z.infer<typeof adversary>;
type WikiRelic = z.infer<typeof relic>;
type WikiIncarnon = z.infer<typeof incarnon>;
type WikiHonoriaTag = z.infer<typeof honoriaTag>;

export class NameMap<V> extends Map<string, V> {
  override get(key: string): V | undefined {
    return super.get(key.toLowerCase());
  }

  override has(key: string): boolean {
    return super.has(key.toLowerCase());
  }

  override set(key: string, value: V): this {
    return super.set(key.toLowerCase(), value);
  }
}

export function sameName(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export const WIKI_FILES = {
  blueprints: "wiki-blueprints.json",
  nodes: "wiki-nodes.json",
  resources: "wiki-resources.json",
  vendors: "wiki-vendors.json",
  traits: "wiki-traits.json",
  baro: "wiki-baro.json",
  adversaries: "wiki-adversaries.json",
  companions: "wiki-companions.json",
  honorias: "wiki-honorias.json",
  titles: "wiki-titles.json",
  relics: "wiki-relics.json",
  circuit: "wiki-circuit.json",
  incarnons: "wiki-incarnons.json",
  honoriaTags: "wiki-honoria-tags.json",
} as const;

type WikiFile = keyof typeof WIKI_FILES;

export interface Wiki {
  blueprints: NameMap<WikiBlueprint>;
  nodes: WikiNode[];
  resources: NameMap<WikiResource>;
  research: NameMap<ResearchEntry>;
  vendors: WikiVendor[];
  traits: NameMap<string[]>;
  baro: NameMap<WikiBaroOffer>;
  adversaries: WikiAdversary[];
  companions: NameMap<string>;
  honorias: NameMap<WikiHonoria>;
  titles: NameMap<string>;
  relics: NameMap<WikiRelic>;
  circuit: WikiCircuit;
  incarnons: NameMap<WikiIncarnon>;
  honoriaTags: NameMap<WikiHonoriaTag>;
}

function named<V>(record: Record<string, V>): NameMap<V> {
  return new NameMap(Object.entries(record));
}

function keyed<T extends z.ZodType>(key: string, value: T, input: unknown) {
  return named(
    z.object({ [key]: z.record(z.string(), value) }).parse(input)[key] as Record<
      string,
      z.infer<T>
    >,
  );
}

export function normalizeWiki(raw: Readonly<Record<WikiFile, unknown>>, research: Research): Wiki {
  return {
    blueprints: keyed("blueprints", blueprint, raw.blueprints),
    nodes: z.object({ nodes: z.array(node) }).parse(raw.nodes).nodes,
    resources: keyed("resources", resource, raw.resources),
    research: named(research),
    vendors: z.object({ vendors: z.array(vendor) }).parse(raw.vendors).vendors,
    traits: keyed("traits", z.array(z.string()), raw.traits),
    baro: keyed("baro", baroOffer, raw.baro),
    adversaries: z.object({ adversaries: z.array(adversary) }).parse(raw.adversaries).adversaries,
    companions: keyed("companions", z.string(), raw.companions),
    honorias: keyed("honorias", honoria, raw.honorias),
    titles: keyed("titles", z.string(), raw.titles),
    relics: keyed("relics", relic, raw.relics),
    circuit: circuit.parse(raw.circuit),
    incarnons: keyed("incarnons", incarnon, raw.incarnons),
    honoriaTags: keyed("tags", honoriaTag, raw.honoriaTags),
  };
}

export function researchFor(wiki: Wiki, name: string): ResearchEntry | undefined {
  const exact = wiki.research.get(name);
  if (exact) return exact;
  const prefix = `${name.toLowerCase()} (`;
  for (const [key, value] of wiki.research) if (key.startsWith(prefix)) return value;
  return undefined;
}
