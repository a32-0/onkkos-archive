import { resolveGoal } from "@/domain/graph/resolve";
import type { Graph } from "@/domain/graph/schema";
import type { ConfirmedQuests } from "@/domain/narrative/evidence";
import type { RawProfile } from "@/domain/types/profile";

const AUDIENCE_BANDS: Record<string, (masteryRank: number) => number> = {
  new: (mr) => (mr < 8 ? 0 : 2),
  mid: (mr) => (mr >= 8 && mr < 16 ? 0 : 1),
  veteran: (mr) => (mr >= 16 ? 0 : 2),
  both: () => 1,
};

export function goalsProvenDone(
  graph: Graph,
  profile: RawProfile,
  confirmedQuests: ConfirmedQuests,
): Set<string> {
  const done = new Set<string>();
  for (const goal of Object.values(graph.goals)) {
    const proven = goal.quest
      ? confirmedQuests.has(goal.quest)
      : resolveGoal(graph, goal.id, profile, {}, { confirmedQuests }).complete;
    if (proven) done.add(goal.id);
  }
  return done;
}

export function suggestedGoals(
  graph: Graph,
  masteryRank: number | undefined,
  done: ReadonlySet<string> = new Set(),
  first: string | null = null,
): string[] {
  const mr = masteryRank ?? 0;
  const lead = (id: string) => (id === first ? 0 : 1);
  return Object.values(graph.goals)
    .filter((goal) => !done.has(goal.id))
    .map((goal) => ({ goal, rank: AUDIENCE_BANDS[goal.audience ?? "both"]?.(mr) ?? 1 }))
    .sort(
      (a, b) =>
        lead(a.goal.id) - lead(b.goal.id) ||
        a.rank - b.rank ||
        a.goal.label.localeCompare(b.goal.label),
    )
    .map((entry) => entry.goal.id);
}

export function goalAtPlace(
  graph: Graph,
  frontier: string | null,
  place: string | null,
): string | null {
  if (frontier !== null) return "unlock_next_planet";
  if (place === null) return null;
  return Object.values(graph.goals).find((goal) => goal.place === place)?.id ?? null;
}
