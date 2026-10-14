import type { NarrativeSpine } from "@/domain/narrative/schema";

interface QuestNeeds {
  quests: readonly string[];
  junctions: readonly string[];
  mastery: number;
}

const NOTHING: QuestNeeds = { quests: [], junctions: [], mastery: 0 };
const ROUTE_JUNCTION = /\b[A-Z][a-z]+ to ([A-Z][a-z]+) Junction\b/g;
const LISTED_JUNCTIONS = /\b([A-Z][a-z]+(?:,? (?:and )?[A-Z][a-z]+)*) Junctions?\b/g;
const LIST_SPLIT = /,? and |, /;
const MASTERY = /Mastery Rank (\d+)/;

const cache = new WeakMap<NarrativeSpine, ReadonlyMap<string, QuestNeeds>>();

function junctionsIn(text: string): string[] {
  const found: string[] = [];
  const rest = text.replace(ROUTE_JUNCTION, (_, to: string) => {
    found.push(`${to} Junction`);
    return " ";
  });
  for (const match of rest.matchAll(LISTED_JUNCTIONS)) {
    for (const planet of (match[1] ?? "").split(LIST_SPLIT)) found.push(`${planet} Junction`);
  }
  return found;
}

function needsByQuest(spine: NarrativeSpine): ReadonlyMap<string, QuestNeeds> {
  const cached = cache.get(spine);
  if (cached) return cached;
  const quests = spine.arcs.flatMap((arc) => arc.quests);
  const names = quests.map((quest) => quest.name).sort((a, b) => b.length - a.length);
  const out = new Map<string, QuestNeeds>();
  for (const quest of quests) {
    let text = quest.requirement ?? "";
    const before: string[] = [];
    for (const name of names) {
      if (name === quest.name || !text.includes(name)) continue;
      before.push(name);
      text = text.split(name).join(" ");
    }
    out.set(quest.name, {
      quests: before,
      junctions: junctionsIn(text),
      mastery: Number(MASTERY.exec(text)?.[1] ?? 0),
    });
  }
  cache.set(spine, out);
  return out;
}

export function questNeeds(spine: NarrativeSpine, quest: string): QuestNeeds {
  return needsByQuest(spine).get(quest) ?? NOTHING;
}

export function questsBefore(spine: NarrativeSpine, quests: readonly string[]): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();
  const visit = (name: string) => {
    if (seen.has(name)) return;
    seen.add(name);
    for (const before of questNeeds(spine, name).quests) visit(before);
    ordered.push(name);
  };
  for (const quest of quests) visit(quest);
  return ordered;
}
