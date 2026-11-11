import { evaluateCheck } from "@/domain/graph/evaluate";
import { resolveGoal } from "@/domain/graph/resolve";
import type { Graph, GraphGoal } from "@/domain/graph/schema";
import { provenBy, type ConfirmedQuests } from "@/domain/narrative/evidence";
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
      : provenBy(goal.provenBy, profile) ||
        resolveGoal(graph, goal.id, profile, {}, { confirmedQuests }).complete;
    if (proven) done.add(goal.id);
  }
  return done;
}

function nodeDone(graph: Graph, id: string, profile: RawProfile): boolean {
  const node = graph.nodes[id];
  if (!node) return false;
  return (
    node.requires.every((req) => nodeDone(graph, req, profile)) &&
    evaluateCheck(node.check, profile, {}).status === "done"
  );
}

function waits(
  graph: Graph,
  goal: GraphGoal,
  profile: RawProfile,
  confirmedQuests: ConfirmedQuests,
  done: ReadonlySet<string>,
): boolean {
  if (goal.masteryRank !== undefined && (profile.PlayerLevel ?? 0) < goal.masteryRank) return true;
  if (goal.after !== undefined && !done.has(goal.after)) return true;
  if (goal.afterQuests.some((quest) => !confirmedQuests.has(quest))) return true;
  return goal.afterNodes.some((node) => !nodeDone(graph, node, profile));
}

export function goalsWaiting(
  graph: Graph,
  profile: RawProfile,
  confirmedQuests: ConfirmedQuests,
  done: ReadonlySet<string>,
): Set<string> {
  return new Set(
    Object.values(graph.goals)
      .filter((goal) => waits(graph, goal, profile, confirmedQuests, done))
      .map((goal) => goal.id),
  );
}

export function suggestedGoals(
  graph: Graph,
  masteryRank: number | undefined,
  hidden: ReadonlySet<string> = new Set(),
  first: string | null = null,
): string[] {
  const mr = masteryRank ?? 0;
  const lead = (id: string) => (id === first ? 0 : 1);
  return Object.values(graph.goals)
    .filter((goal) => !hidden.has(goal.id))
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
