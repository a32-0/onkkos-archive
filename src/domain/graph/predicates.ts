export type ComparisonOp = "==" | "!=" | ">=" | "<=" | ">" | "<";

export const COMPARISON_OPS: readonly ComparisonOp[] = ["==", "!=", ">=", "<=", ">", "<"];

export interface Predicate {
  field: string;
  op: ComparisonOp;
  value: string | number;
}

const PREDICATE_RE = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(==|!=|>=|<=|>|<)\s*(.+?)\s*$/;
const PLACEHOLDER_RE = /^\{[a-z_][a-z0-9_]*\}$/i;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;

export class PredicateParseError extends Error {
  constructor(input: string, detail: string) {
    super(`Could not parse the predicate ${JSON.stringify(input)}: ${detail}`);
    this.name = "PredicateParseError";
  }
}

export function parsePredicate(input: string): Predicate {
  const match = PREDICATE_RE.exec(input);
  if (!match) {
    throw new PredicateParseError(input, "it does not match `field OP value`");
  }
  const [, field, op, rawValue] = match;
  if (!field || !op || rawValue === undefined) {
    throw new PredicateParseError(input, "the expression is missing parts");
  }
  return { field, op: op as ComparisonOp, value: parseLiteral(rawValue, input) };
}

export function isPlaceholder(value: unknown): value is string {
  return typeof value === "string" && PLACEHOLDER_RE.test(value);
}

export function placeholderName(value: string): string {
  return value.slice(1, -1);
}

export function resolveValue(
  value: string | number,
  params: Readonly<Record<string, string | number>>,
): string | number {
  if (!isPlaceholder(value)) return value;
  const name = placeholderName(value);
  const provided = params[name];
  if (provided === undefined) {
    throw new Error(`Missing required parameter ${JSON.stringify(name)}`);
  }
  if (typeof provided === "number") return provided;
  return NUMBER_RE.test(provided) ? Number(provided) : provided;
}

export function compare(left: unknown, op: ComparisonOp, right: string | number): boolean {
  if (op === "==") return left === right;
  if (op === "!=") return left !== right;

  if (typeof left !== "number" || typeof right !== "number") return false;

  switch (op) {
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    case ">":
      return left > right;
    case "<":
      return left < right;
  }
}

export function testPredicate(
  predicate: Predicate,
  target: Record<string, unknown> | undefined,
  params: Readonly<Record<string, string | number>> = {},
): boolean {
  if (!target) return false;
  return compare(target[predicate.field], predicate.op, resolveValue(predicate.value, params));
}

function parseLiteral(raw: string, original: string): string | number {
  const quoted = /^(['"])(.*)\1$/.exec(raw);
  if (quoted?.[2] !== undefined) return quoted[2];
  if (PLACEHOLDER_RE.test(raw)) return raw;
  if (NUMBER_RE.test(raw)) return Number(raw);

  throw new PredicateParseError(
    original,
    `unrecognised literal ${JSON.stringify(raw)} (quote it if it is a string)`,
  );
}
