export type Kind = { one: string; many: string };

function noun(count: number, kind: Kind): string {
  return count === 1 ? kind.one : kind.many;
}

export const REACH = {
  rank: (count: number, kind: Kind, need: number, have: number) =>
    `${count} more ${noun(count, kind)} ${count === 1 ? "needs" : "need"} Mastery Rank ${need} or higher. You are Mastery Rank ${have}.`,
  place: (count: number, kind: Kind, from: string, to: string) =>
    `${count} more ${noun(count, kind)} ${count === 1 ? "comes" : "come"} from places past ${to}. Clear the ${to} Junction, on ${from}, to go on.`,
  clan: (count: number, kind: Kind) =>
    `${count} more ${noun(count, kind)} ${count === 1 ? "comes" : "come"} from the Dojo. Join a clan to enter it.`,
  both: (count: number, kind: Kind, need: number | null, to: string | null) =>
    `${count} more ${noun(count, kind)} ${count === 1 ? "needs" : "need"} ${[
      need === null ? null : `Mastery Rank ${need}`,
      to === null ? "a clan's Dojo" : `a place past ${to}`,
    ]
      .filter((part) => part !== null)
      .join(" or ")}.`,
} as const;
