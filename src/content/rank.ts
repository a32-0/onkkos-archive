const LEGENDARY_FROM = 31;

const SHARES: Readonly<Record<number, string>> = {
  2: "about half",
  3: "about a third",
  4: "about a quarter",
};

function rankName(rank: number): string {
  return rank >= LEGENDARY_FROM ? `Legendary ${rank - LEGENDARY_FROM + 1}` : `Rank ${rank}`;
}

function sealOf(rank: number): string {
  return rank >= LEGENDARY_FROM ? `L${rank - LEGENDARY_FROM + 1}` : String(rank);
}

function listed(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function shareOf(parts: number): string {
  return SHARES[parts] ?? `about ${Math.max(1, Math.round(100 / parts))}%`;
}

function counted(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export const RANK = {
  title: "Mastery Rank",
  kicker: "Mastery Rank",
  name: rankName,
  seal: sealOf,
  legendary: (rank: number) => rank >= LEGENDARY_FROM,
  progress: (rank: number) => `Progress to ${rankName(rank)}`,
  way: (rank: number) => `Of the way to ${rankName(rank)}`,
  percent: (share: number) => `${Math.floor(share * 100)}%`,
  highest: "The highest rank there is",
  toRank: "Rank these to get there",
  more: (count: number) => `+${count}`,
  moreName: (count: number) => `${count} more below max rank`,
  nothingToRank: {
    title: "Everything you own is at max rank",
    line: "Build something new or clear more of the Star Chart to keep going.",
  },
  everyRank: {
    title: "Every rank reached",
    line: "When the game adds a new rank, the way to it shows here.",
  },
  testReady: {
    title: (rank: number) => `Ready for the ${rankName(rank)} test`,
    line: "Take it in the game. If you fail, you can try again after 24 hours.",
  },
  card: {
    reach: (rank: number) =>
      rank >= LEGENDARY_FROM ? `Reach ${rankName(rank)}` : `Reach Mastery Rank ${rank}`,
    test: (rank: number) => `Take the ${rankName(rank)} test`,
    named: (names: readonly string[]) => `Ranking ${listed(names)} takes you there.`,
    full: "Your bar is full. Take the test in the game.",
  },
  steps: {
    shortest: "The shortest way",
    test: "The test",
    rankThese: (names: readonly string[], max: number | null) =>
      `Rank ${listed(names)} to ${max === null ? "max rank" : max}`,
    took: (ranks: readonly number[]) =>
      ranks.length === 1
        ? `You took it to rank ${ranks[0]}.`
        : `You took them to ranks ${listed(ranks.map(String))}.`,
    enough: (rank: number) => `That is enough for ${rankName(rank)}.`,
    closer: "That takes you part of the way. New items do the rest.",
    orNewWeapons: (count: number) =>
      count === 1 ? "Or rank one new weapon" : `Or rank ${count} new weapons`,
    rankNew: "Rank something new",
    allMaxed: "Everything you have ranked is at max rank.",
    newWeapon: (parts: number) =>
      parts === 1
        ? "One new weapon at rank 30 covers what is left."
        : `Each new weapon you take to rank 30 covers ${shareOf(parts)} of what is left.`,
    orWarframe: "Or a new Warframe",
    warframe: (parts: number) =>
      parts === 1
        ? "A Warframe gives twice what a weapon gives, so one at rank 30 covers it all."
        : `A Warframe gives twice what a weapon gives, so each one at rank 30 covers ${shareOf(parts)} of what is left.`,
    takeTest: (rank: number) => `Take the ${rankName(rank)} test`,
    testLine:
      "Take it in the game once your bar is full. If you fail, you can try again after 24 hours.",
    unlocks: (rank: number) => `What ${rankName(rank)} unlocks`,
    unlocked: (counts: { warframes: number; weapons: number; companions: number; other: number }) =>
      `${listed(
        [
          counts.warframes > 0 && counted(counts.warframes, "Warframe", "Warframes"),
          counts.weapons > 0 && counted(counts.weapons, "weapon", "weapons"),
          counts.companions > 0 && counted(counts.companions, "companion", "companions"),
          counts.other > 0 && counted(counts.other, "other item", "other items"),
        ].filter((part): part is string => typeof part === "string"),
      )} you cannot build yet.`,
  },
} as const;
