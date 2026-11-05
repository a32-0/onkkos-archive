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

function covering(count: number): string {
  return count === 1 ? "so one covers what is left." : `so ${count} cover what is left.`;
}

function lowerFirst(text: string): string {
  return `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

export const RANK = {
  title: "Mastery Rank",
  kicker: "Mastery Rank",
  name: rankName,
  seal: sealOf,
  legendary: (rank: number) => rank >= LEGENDARY_FROM,
  progress: (rank: number) => `Progress to ${rankName(rank)}`,
  way: (rank: number) => `Progress to ${rankName(rank)}`,
  seeWay: "See the way",
  seeTest: "See the test",
  percent: (share: number) => `${Math.floor(share * 100)}%`,
  percentTo: (share: number, rank: number) => `${Math.floor(share * 100)}% to ${rankName(rank)}`,
  highest: "The highest rank there is",
  toRank: "Rank these to get there",
  more: (count: number) => `+${count}`,
  moreName: (count: number) => `${count} more below max rank`,
  nothingToRank: {
    title: "Everything you own is at max rank",
    line: "Build something new or clear more of the Star Chart to keep going.",
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
    most: (title: string) => `${title} (Most mastery)`,
    or: (title: string) => `Or ${lowerFirst(title)}`,
    necramechTitle: (count: number) =>
      count === 1 ? "Rank a new Necramech" : `Rank ${count} new Necramechs`,
    necramechDetail: (count: number, covers: boolean) =>
      covers
        ? `A Necramech goes to rank 40 and gives 8,000 mastery, ${covering(count)}`
        : `A Necramech goes to rank 40 and gives 8,000 mastery. ${
            count === 1
              ? "The one you have not ranked takes you part of the way."
              : `The ${count} you have not ranked take you part of the way.`
          }`,
    warframeTitle: (count: number) =>
      count === 1
        ? "Rank a new Warframe, companion or Archwing"
        : `Rank ${count} new Warframes, companions or Archwings`,
    warframeDetail: (count: number) => `Each gives 6,000 mastery at rank 30, ${covering(count)}`,
    fortyTitle: (count: number) =>
      count === 1
        ? "Rank a new weapon that goes to rank 40"
        : `Rank ${count} new weapons that go to rank 40`,
    fortyDetail: (count: number) =>
      `Kuva, Tenet and Coda weapons, and a few others, go to rank 40 and give 4,000 mastery, ${covering(count)}`,
    weaponTitle: (count: number) =>
      count === 1 ? "Rank a new weapon" : `Rank ${count} new weapons`,
    weaponDetail: (count: number) => `Each gives 3,000 mastery at rank 30, ${covering(count)}`,
    intrinsicTitle: (count: number) =>
      count === 1 ? "Raise an Intrinsic one rank" : `Raise your Intrinsics ${count} ranks`,
    intrinsicDetail: (count: number, covers: boolean) =>
      covers
        ? `Each rank of a Railjack or Drifter Intrinsic gives 1,500 mastery, ${covering(count)}`
        : `Each rank of a Railjack or Drifter Intrinsic gives 1,500 mastery. The ${counted(count, "rank", "ranks")} you have left take you part of the way.`,
    nodeTitle: (count: number) =>
      count === 1 ? "Complete a Star Chart node" : `Complete ${count} Star Chart nodes`,
    nodeDetail: (count: number, covers: boolean) =>
      `A node gives its mastery once, and again on the Steel Path. ${
        covers
          ? count === 1
            ? "The one you have left that gives the most covers what is left."
            : `The ${count} you have left that give the most cover what is left.`
          : `The ${counted(count, "node", "nodes")} you have left take you part of the way.`
      }`,
    newWeapon: (parts: number) =>
      parts === 1
        ? "One new weapon at rank 30 covers what is left."
        : `Each new weapon you take to rank 30 covers ${shareOf(parts)} of what is left.`,
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
