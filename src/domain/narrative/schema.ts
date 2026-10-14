import { z } from "zod";

const questKind = z.enum(["main", "side", "warframe"]);

const rawQuest = z.union([
  z.object({
    quest: z.string(),
    kind: questKind.optional(),
    wiki: z.string().optional(),
    requirement: z.string().optional(),
    start: z.string().optional(),
    locations: z.array(z.string()).optional(),
    release: z.string().nullable().optional(),
    available_at: z.array(z.string()).optional(),
    note: z.string().optional(),
  }),
  z.string(),
]);

const rawArc = z.object({
  id: z.string(),
  label: z.string(),
  note: z.string().optional(),
  quests: z.array(rawQuest).default([]),
});

const rawSpineSchema = z.object({
  version: z.number(),
  last_verified: z.string().optional(),
  source: z.string().optional(),
  arcs: z.array(rawArc),
});

const WIKI_PAGE = "https://wiki.warframe.com/w/";

const SIDE_ARC_NOTE = /doesn't block the main path/i;

type QuestKind = z.infer<typeof questKind>;

export interface Quest {
  name: string;
  kind: QuestKind;
  note?: string;
  wikiTitle: string | null;
  requirement: string | null;
  start: string | null;
  locations: string[];
  release: string | null;
  wikiUrl: string | null;
  availableAt: string[];
  sideArc: boolean;
}

export interface Arc {
  id: string;
  label: string;
  note?: string;
  quests: Quest[];
}

export interface NarrativeSpine {
  version: number;
  lastVerified?: string;
  source?: string;
  arcs: Arc[];
}

export function normalizeSpine(input: unknown): NarrativeSpine {
  const raw = rawSpineSchema.parse(input);

  const spine: NarrativeSpine = {
    version: raw.version,
    arcs: raw.arcs.map((arc) => {
      const normalized: Arc = {
        id: arc.id,
        label: arc.label,
        quests: arc.quests.map(normalizeQuest),
      };
      if (arc.note !== undefined) normalized.note = arc.note;
      return normalized;
    }),
  };
  if (raw.last_verified !== undefined) spine.lastVerified = raw.last_verified;
  if (raw.source !== undefined) spine.source = raw.source;
  return spine;
}

export function arcLocations(arc: Arc): string[] {
  const seen = new Set<string>();
  for (const quest of arc.quests) for (const place of quest.locations) seen.add(place);
  return [...seen];
}

function normalizeQuest(quest: z.infer<typeof rawQuest>): Quest {
  if (typeof quest === "string") {
    return {
      name: quest,
      kind: "main",
      wikiTitle: null,
      requirement: null,
      start: null,
      locations: [],
      release: null,
      wikiUrl: null,
      availableAt: [],
      sideArc: false,
    };
  }
  const kind = quest.kind ?? "main";
  const normalized: Quest = {
    name: quest.quest,
    kind,
    wikiTitle: quest.wiki ?? null,
    requirement: quest.requirement ?? null,
    start: quest.start ?? null,
    locations: quest.locations ?? [],
    release: quest.release ?? null,
    wikiUrl: quest.wiki ? WIKI_PAGE + encodeURIComponent(quest.wiki.replace(/ /g, "_")) : null,
    availableAt: quest.available_at ?? [],
    sideArc: kind !== "main" || (quest.note ? SIDE_ARC_NOTE.test(quest.note) : false),
  };
  if (quest.note !== undefined) normalized.note = quest.note;
  return normalized;
}
