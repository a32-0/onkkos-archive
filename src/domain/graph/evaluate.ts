import {
  compare,
  isPlaceholder,
  placeholderName,
  resolveValue,
  testPredicate,
} from "@/domain/graph/predicates";
import type { Check, FieldPath } from "@/domain/graph/schema";
import type { StepReason } from "@/domain/types/plan";
import type { RawProfile } from "@/domain/types/profile";

export type CheckOutcome =
  | { status: "done" }
  | { status: "todo"; reason?: StepReason }
  | { status: "manual"; question: string };

export type GoalParams = Readonly<Record<string, string | number>>;

const MASTERY_FIELD = "PlayerLevel";
const STANDING_ROOT = "Affiliations";

export function readField(profile: RawProfile, path: FieldPath, params: GoalParams = {}): unknown {
  const root = profile[path.root];
  if (root === undefined || root === null) return undefined;

  if (!path.isArray) {
    if (!path.property) return root;
    if (typeof root !== "object") return undefined;
    return (root as Record<string, unknown>)[resolvePropertyKey(path.property, params)];
  }
  if (!Array.isArray(root)) return undefined;
  if (!path.property) return root;

  const propertyKey = resolvePropertyKey(path.property, params);
  return root
    .map((item) =>
      item && typeof item === "object" ? (item as Record<string, unknown>)[propertyKey] : undefined,
    )
    .filter((value) => value !== undefined);
}

export function evaluateCheck(
  check: Check,
  profile: RawProfile,
  params: GoalParams = {},
): CheckOutcome {
  switch (check.kind) {
    case "manual":
      return { status: "manual", question: check.question };

    case "array-contains": {
      const values = readField(profile, check.path, params);
      if (!Array.isArray(values) || !values.includes(check.equals)) return { status: "todo" };
      return { status: "done" };
    }

    case "array-where": {
      const list = readField(profile, check.path, params);
      if (!Array.isArray(list)) return todo(absentReason(check.path));

      const match = list.find(
        (item): item is Record<string, unknown> =>
          !!item &&
          typeof item === "object" &&
          testPredicate(check.where, item as Record<string, unknown>, params),
      );
      if (!match) return todo(absentReason(check.path));
      if (testPredicate(check.condition, match, params)) return { status: "done" };

      const actual = match[check.condition.field];
      return todo({
        kind: "rank",
        tree: null,
        actual: typeof actual === "number" ? actual : null,
        target: resolveValueSafe(check.condition.value, params),
      });
    }

    case "scalar": {
      const actual = readField(profile, check.path, params);
      const expected = resolveValue(check.value, params);
      if (compare(actual, check.op, expected)) return { status: "done" };
      return todo(scalarReason(check.path, actual, expected, params));
    }
  }
}

function todo(reason: StepReason | undefined): CheckOutcome {
  return reason ? { status: "todo", reason } : { status: "todo" };
}

function absentReason(path: FieldPath): StepReason | undefined {
  return path.root === STANDING_ROOT ? { kind: "not-joined" } : undefined;
}

function scalarReason(
  path: FieldPath,
  actual: unknown,
  expected: string | number,
  params: GoalParams,
): StepReason {
  const reading = typeof actual === "number" ? actual : null;
  if (path.root === MASTERY_FIELD) return { kind: "mastery", actual: reading, target: expected };
  return { kind: "rank", tree: treeKey(path, params), actual: reading, target: expected };
}

function treeKey(path: FieldPath, params: GoalParams): string | null {
  if (!path.property) return null;
  try {
    return resolvePropertyKey(path.property, params);
  } catch {
    return null;
  }
}

function resolvePropertyKey(property: string, params: GoalParams): string {
  if (!isPlaceholder(property)) return property;
  const name = placeholderName(property);
  const provided = params[name];
  if (provided === undefined) {
    throw new Error(`Missing required parameter ${JSON.stringify(name)}`);
  }
  return String(provided);
}

function resolveValueSafe(value: string | number, params: GoalParams): string | number {
  try {
    return resolveValue(value, params);
  } catch {
    return value;
  }
}
