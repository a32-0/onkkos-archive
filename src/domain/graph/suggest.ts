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
): string[] {
  const mr = masteryRank ?? 0;
  return Object.values(graph.goals)
    .filter((goal) => !done.has(goal.id))
    .map((goal) => ({ goal, rank: AUDIENCE_BANDS[goal.audience ?? "both"]?.(mr) ?? 1 }))
    .sort((a, b) => a.rank - b.rank || a.goal.label.localeCompare(b.goal.label))
    .map((entry) => entry.goal.id);
}
