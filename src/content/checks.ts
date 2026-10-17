interface Odds {
  runs: number | null;
  rotation: string | null;
  stage: string | null;
  chance: number | null;
}

interface RelicOdds {
  rarity: string | null;
  intact: number | null;
  radiant: number | null;
}

interface Price {
  cost: number | null;
  currency: string | null;
  rank: string | null;
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

function number(value: number): string {
  return value.toLocaleString("en-US");
}

function listOf(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function joined(parts: readonly (string | null | undefined)[]): string | null {
  const kept = parts.filter((part): part is string => typeof part === "string" && part.length > 0);
  return kept.length > 0 ? kept.join(" · ") : null;
}

function price(cost: number | null, currency: string | null): string | null {
  return cost === null ? null : `${number(cost)} ${currency ?? ""}`.trim();
}

export const BRIEF = {
  oddsBrief: ({ runs, rotation, stage, chance }: Odds) =>
    runs !== null
      ? joined([
          `~${runs} ${plural(runs, "Run", "Runs")}`,
          rotation ? `Rotation ${rotation}` : stage,
        ])
      : joined([chance !== null && chance > 0 ? `${chance}%` : null, rotation, stage]),
  relicBrief: ({ rarity, intact, radiant }: RelicOdds) =>
    joined([
      rarity,
      intact === null ? null : `${intact}% Intact`,
      radiant === null ? null : `${radiant}% Radiant`,
    ]),
  vendorBrief: ({ vendor, cost, currency, rank }: Price & { vendor: string }) =>
    joined([vendor, price(cost, currency), rank]),
  priceBrief: ({ cost, currency, rank }: Price) => joined([price(cost, currency), rank]),
  marketBrief: ({ credits }: { credits: number }) => `Market · ${number(credits)} credits`,
  marketPriceBrief: ({ credits, platinum }: { credits: number | null; platinum: number | null }) =>
    credits === null ? `${number(platinum ?? 0)} platinum` : `${number(credits)} credits`,
  costs: ({ costs }: { costs: readonly { currency: string; amount: number }[] }) =>
    listOf(costs.map((one) => `${number(one.amount)} ${one.currency}`)),
  percent: ({ chance }: { chance: number }) => `${chance}%`,
} as const;

export function briefLine(parts: readonly (string | null)[]): string {
  return joined(parts) ?? "";
}
