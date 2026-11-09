const TIMES: Readonly<Record<number, string>> = { 2: "twice", 3: "three times" };

function after(on: string): string {
  const what = on.replace(/^On\s+/i, "").toLowerCase();
  return /^[aeiou]/.test(what) ? `after an ${what}` : `after a ${what}`;
}

export const MOD = {
  whatItDoes: "What it does",
  example: "Example",
  without: "Without",
  withIt: "With it",
  pairsWith: "Pairs with",
  rank: (ranks: number) => `Max rank ${ranks}`,
  cost: (capacity: number, slot: number, polarity: string | null) =>
    polarity ? `costs ${capacity}, or ${slot} in a ${polarity} slot` : `costs ${capacity}`,
  trigger: ({
    on,
    seconds,
    stacks,
  }: {
    on: string;
    seconds: number | null;
    stacks: number | null;
  }) =>
    [
      `Only ${after(on)}`,
      seconds !== null ? `lasts ${seconds} s` : null,
      stacks !== null && stacks > 1 ? `${TIMES[stacks] ?? `${stacks} times`} at most` : null,
    ]
      .filter((part): part is string => part !== null)
      .join(", ") + ".",
} as const;
