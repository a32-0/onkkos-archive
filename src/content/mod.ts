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
  squad: "It counts for the whole squad.",
  cooldown: (seconds: number) => `Ready again after ${seconds} s.`,
  rank: (ranks: number) => `Max rank ${ranks}`,
  capacity: (capacity: number, aura: boolean) => (aura ? `+${capacity}` : `${capacity}`),
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
