type StepStatus = "done" | "todo" | "manual" | "blocked";

export type StepReason =
  | { kind: "mastery"; actual: number | null; target: string | number }
  | { kind: "rank"; tree: string | null; actual: number | null; target: string | number }
  | { kind: "not-joined" }
  | { kind: "junction"; from: string; to: string }
  | { kind: "start" }
  | { kind: "after"; nodes: string[] };

export interface PlanStep {
  id: string;
  label: string;
  status: StepStatus;
  blockedBy: string[];
  question?: string;
  quest?: string;
  reason?: StepReason;
}

export interface Plan {
  goalId: string;
  complete: boolean;
  steps: PlanStep[];
  next: PlanStep | null;
  junctions?: { completed: number; total: number };
}
