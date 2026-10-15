import { evaluateCheck, type CheckOutcome, type GoalParams } from "@/domain/graph/evaluate";
import type { Graph, GraphGoal } from "@/domain/graph/schema";
import { findNextPlanet, junctionOf } from "@/domain/graph/star-chart";
import type { ConfirmedQuests } from "@/domain/narrative/evidence";
import type { Plan, PlanStep } from "@/domain/types/plan";
import type { RawProfile } from "@/domain/types/profile";

interface ResolveOptions {
  confirmedQuests?: ConfirmedQuests;
}

export class UnknownGoalError extends Error {
  constructor(goalId: string) {
    super(`There is no goal ${JSON.stringify(goalId)} in grafo.yaml`);
    this.name = "UnknownGoalError";
  }
}

export function resolveGoal(
  graph: Graph,
  goalId: string,
  profile: RawProfile,
  params: GoalParams = {},
  options: ResolveOptions = {},
): Plan {
  const goal = graph.goals[goalId];
  if (!goal) throw new UnknownGoalError(goalId);

  if (goal.resolution === "dynamic" && goal.source === "star_chart_order") {
    return resolveStarChartGoal(graph, goal, profile);
  }
  return resolveNodeGoal(graph, goal, profile, params, options);
}

export function topologicalOrder(graph: Graph, roots: string[]): string[] {
  const ordered: string[] = [];
  const done = new Set<string>();
  const inProgress = new Set<string>();

  const visit = (id: string, trail: string[]): void => {
    if (done.has(id)) return;
    if (inProgress.has(id)) {
      throw new Error(`Dependency cycle in grafo.yaml: ${[...trail, id].join(" -> ")}`);
    }
    const node = graph.nodes[id];
    if (!node) return;

    inProgress.add(id);
    for (const req of node.requires) visit(req, [...trail, id]);
    inProgress.delete(id);

    done.add(id);
    ordered.push(id);
  };

  for (const root of roots) visit(root, []);
  return ordered;
}

function resolveStarChartGoal(graph: Graph, goal: GraphGoal, profile: RawProfile): Plan {
  const { entry, junctionsCompleted, junctionsTotal } = findNextPlanet(graph, profile);
  const junctions = { completed: junctionsCompleted, total: junctionsTotal };

  if (!entry) {
    return { goalId: goal.id, complete: true, steps: [], next: null, junctions };
  }

  const step: PlanStep = {
    id: `planet:${entry.planet}`,
    label: entry.planet,
    status: "todo",
    blockedBy: [],
  };
  const junction = entry.junctionTag ? junctionOf(entry.junctionTag) : null;
  if (junction) step.reason = { kind: "junction", ...junction };
  else if (entry.junctionTag === null) step.reason = { kind: "start" };

  return { goalId: goal.id, complete: false, steps: [step], next: step, junctions };
}

function resolveNodeGoal(
  graph: Graph,
  goal: GraphGoal,
  profile: RawProfile,
  params: GoalParams,
  options: ResolveOptions,
): Plan {
  const steps: PlanStep[] = [];
  const satisfied = new Map<string, boolean>();

  for (const nodeId of topologicalOrder(graph, goal.requires)) {
    const node = graph.nodes[nodeId];
    if (!node) continue;

    const blockedBy = node.requires.filter((req) => satisfied.get(req) !== true);
    const step: PlanStep =
      blockedBy.length > 0
        ? {
            id: node.id,
            label: node.label,
            status: "blocked",
            blockedBy,
            reason: { kind: "after", nodes: blockedBy.map((id) => graph.nodes[id]?.label ?? id) },
          }
        : stepFromOutcome(node.id, node.label, evaluateCheck(node.check, profile, params));

    steps.push(step);
    satisfied.set(node.id, step.status === "done");
  }

  if (goal.check) {
    steps.push(
      stepFromOutcome(`goal:${goal.id}`, goal.label, evaluateCheck(goal.check, profile, params)),
    );
  }

  const complete = steps.length > 0 && steps.every((s) => s.status === "done");

  if (!complete) {
    for (const quest of goal.manualChecklistIfMissing) {
      const proven = Boolean(options.confirmedQuests?.get(quest)?.[0]);
      steps.push({
        id: `quest:${quest}`,
        label: quest,
        status: proven ? "done" : "manual",
        blockedBy: [],
        quest,
      });
    }
  }

  return {
    goalId: goal.id,
    complete,
    steps,
    next: steps.find((s) => s.status === "todo" || s.status === "manual") ?? null,
  };
}

function stepFromOutcome(id: string, label: string, outcome: CheckOutcome): PlanStep {
  const step: PlanStep = { id, label, status: outcome.status, blockedBy: [] };
  if (outcome.status === "todo" && outcome.reason) step.reason = outcome.reason;
  if (outcome.status === "manual") step.question = outcome.question;
  return step;
}
