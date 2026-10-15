import type { WikiCircuit, WikiRotation } from "@/domain/catalog/wiki";

export type CircuitMode = "normal" | "steelPath";

interface CircuitStatus {
  weeksAway: number;
}

const WEEK_MS = 604_800_000;

function anchorOf(anchor: string): number {
  const [year = 0, month = 1, day = 1] = anchor.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function currentIndex(rotation: WikiRotation, now: number): number {
  const cycle = WEEK_MS * rotation.period;
  const elapsed = (((now - anchorOf(rotation.anchor)) % cycle) + cycle) % cycle;
  return Math.floor(elapsed / WEEK_MS);
}

export function circuitStatus(
  circuit: WikiCircuit,
  mode: CircuitMode,
  name: string,
  now: number,
): CircuitStatus | null {
  const rotation = circuit[mode];
  const wanted = name.toLowerCase();
  const week = rotation.weeks.find((entry) =>
    entry.choices.some((choice) => choice.toLowerCase() === wanted),
  );
  if (!week) return null;
  const index = currentIndex(rotation, now);
  return { weeksAway: (week.index - index + rotation.period) % rotation.period };
}

export function inCircuit(circuit: WikiCircuit, mode: CircuitMode, name: string): boolean {
  const wanted = name.toLowerCase();
  return circuit[mode].weeks.some((entry) =>
    entry.choices.some((choice) => choice.toLowerCase() === wanted),
  );
}

export function circuitTier(circuit: WikiCircuit, part: string): number | null {
  return circuit.tiers[part] ?? null;
}
