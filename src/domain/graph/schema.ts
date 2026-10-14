import { z } from "zod";

import {
  COMPARISON_OPS,
  parsePredicate,
  type ComparisonOp,
  type Predicate,
} from "@/domain/graph/predicates";

const rawArrayContainsCheck = z.object({
  field: z.string(),
  equals: z.string(),
});

const rawArrayWhereCheck = z.object({
  field: z.string(),
  where: z.string(),
  condition: z.string(),
});

const rawScalarCheck = z.object({
  field: z.string(),
  compare: z.enum(COMPARISON_OPS as unknown as [ComparisonOp, ...ComparisonOp[]]),
  value: z.union([z.string(), z.number()]),
});

const rawManualCheck = z.object({
  manual: z.literal(true),
  question: z.string(),
});

const rawCheck = z.union([
  rawManualCheck,
  rawArrayWhereCheck,
  rawArrayContainsCheck,
  rawScalarCheck,
]);

const rawNode = z.object({
  label: z.string(),
  type: z.string(),
  item: z.string().optional(),
  requires: z.array(z.string()).default([]),
  check: rawCheck,
});

const rawStarChartEntry = z.object({
  planet: z.string(),
  junction_tag: z.string().nullable(),
});

const rawOffChartPlace = z.object({
  place: z.string(),
  after: z.string(),
  unlocked_by: z.string().nullable(),
});

const rawUpdateName = z.object({
  version: z.number().int().positive(),
  name: z.string().min(1),
});

const rawGoal = z.object({
  label: z.string(),
  audience: z.string().optional(),
  pathway: z.enum(["star_chart", "collect", "grow", "explore"]).optional(),
  resolution: z.string().optional(),
  source: z.string().optional(),
  place: z.string().optional(),
  quest: z.string().optional(),
  logic: z.string().optional(),
  requires: z.array(z.string()).default([]),
  check: rawCheck.optional(),
  manual_checklist_if_missing: z.array(z.string()).default([]),
});

const rawGraphSchema = z.object({
  version: z.number(),
  meta: z.record(z.string(), z.unknown()).optional(),
  star_chart_order: z.array(rawStarChartEntry),
  off_chart_places: z.array(rawOffChartPlace).default([]),
  update_names: z.array(rawUpdateName).default([]),
  nodes: z.record(z.string(), rawNode),
  goals: z.record(z.string(), rawGoal),
});

const FIELD_PATH_RE =
  /^([A-Za-z_][A-Za-z0-9_]*)(\[\])?(?:\.([A-Za-z_][A-Za-z0-9_]*|\{[a-z_][a-z0-9_]*\}))?$/i;

export interface FieldPath {
  root: string;
  isArray: boolean;
  property?: string;
}

export type Check =
  | { kind: "array-contains"; path: FieldPath; equals: string }
  | { kind: "array-where"; path: FieldPath; where: Predicate; condition: Predicate }
  | { kind: "scalar"; path: FieldPath; op: ComparisonOp; value: string | number }
  | { kind: "manual"; question: string };

interface GraphNode {
  id: string;
  label: string;
  type: string;
  item: string | null;
  requires: string[];
  check: Check;
}

export interface StarChartEntry {
  planet: string;
  junctionTag: string | null;
}

interface OffChartPlace {
  place: string;
  after: string;
  unlockedBy: string | null;
}

interface UpdateName {
  version: number;
  name: string;
}

export interface GraphGoal {
  id: string;
  label: string;
  audience?: string;
  pathway?: string;
  resolution?: string;
  source?: string;
  place?: string;
  quest?: string;
  requires: string[];
  check?: Check;
  manualChecklistIfMissing: string[];
}

export interface Graph {
  version: number;
  starChartOrder: StarChartEntry[];
  offChartPlaces: OffChartPlace[];
  updateNames: UpdateName[];
  nodes: Record<string, GraphNode>;
  goals: Record<string, GraphGoal>;
}

export function parseFieldPath(raw: string): FieldPath {
  const match = FIELD_PATH_RE.exec(raw.trim());
  if (!match?.[1]) {
    throw new Error(`Invalid field path in grafo.yaml: ${JSON.stringify(raw)}`);
  }
  const path: FieldPath = { root: match[1], isArray: Boolean(match[2]) };
  if (match[3]) path.property = match[3];
  return path;
}

export function normalizeGraph(input: unknown): Graph {
  const raw = rawGraphSchema.parse(input);

  const nodes: Record<string, GraphNode> = {};
  for (const [id, node] of Object.entries(raw.nodes)) {
    nodes[id] = {
      id,
      label: node.label,
      type: node.type,
      item: node.item ?? null,
      requires: node.requires,
      check: normalizeCheck(node.check),
    };
  }

  const goals: Record<string, GraphGoal> = {};
  for (const [id, goal] of Object.entries(raw.goals)) {
    const normalized: GraphGoal = {
      id,
      label: goal.label,
      requires: goal.requires,
      manualChecklistIfMissing: goal.manual_checklist_if_missing,
    };
    if (goal.audience !== undefined) normalized.audience = goal.audience;
    if (goal.pathway !== undefined) normalized.pathway = goal.pathway;
    if (goal.resolution !== undefined) normalized.resolution = goal.resolution;
    if (goal.source !== undefined) normalized.source = goal.source;
    if (goal.place !== undefined) normalized.place = goal.place;
    if (goal.quest !== undefined) normalized.quest = goal.quest;
    if (goal.check !== undefined) normalized.check = normalizeCheck(goal.check);
    goals[id] = normalized;
  }

  const graph: Graph = {
    version: raw.version,
    starChartOrder: raw.star_chart_order.map((entry) => ({
      planet: entry.planet,
      junctionTag: entry.junction_tag,
    })),
    offChartPlaces: raw.off_chart_places.map((entry) => ({
      place: entry.place,
      after: entry.after,
      unlockedBy: entry.unlocked_by,
    })),
    updateNames: raw.update_names,
    nodes,
    goals,
  };

  assertReferencesResolve(graph);
  return graph;
}

function normalizeCheck(raw: z.infer<typeof rawCheck>): Check {
  if ("manual" in raw) {
    return { kind: "manual", question: raw.question };
  }
  if ("where" in raw) {
    return {
      kind: "array-where",
      path: parseFieldPath(raw.field),
      where: parsePredicate(raw.where),
      condition: parsePredicate(raw.condition),
    };
  }
  if ("equals" in raw) {
    return { kind: "array-contains", path: parseFieldPath(raw.field), equals: raw.equals };
  }
  return { kind: "scalar", path: parseFieldPath(raw.field), op: raw.compare, value: raw.value };
}

function assertReferencesResolve(graph: Graph): void {
  const known = new Set(Object.keys(graph.nodes));
  const problems: string[] = [];

  const chart = new Set(graph.starChartOrder.map((entry) => entry.planet));
  for (const place of graph.offChartPlaces) {
    if (chart.has(place.place))
      problems.push(`off_chart_places.${place.place} is already a planet`);
    if (!chart.has(place.after))
      problems.push(`off_chart_places.${place.place}.after -> ${place.after}`);
  }

  for (const node of Object.values(graph.nodes)) {
    for (const req of node.requires) {
      if (!known.has(req)) problems.push(`nodes.${node.id}.requires -> ${req}`);
    }
  }
  for (const goal of Object.values(graph.goals)) {
    for (const req of goal.requires) {
      if (!known.has(req)) problems.push(`goals.${goal.id}.requires -> ${req}`);
    }
  }
  if (problems.length > 0) {
    throw new Error(`grafo.yaml references nodes that do not exist:\n  ${problems.join("\n  ")}`);
  }
}
