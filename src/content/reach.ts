export type Kind = { one: string; many: string };

export interface BeyondWords {
  title: string;
  whole: string;
  line: string;
}

function noun(count: number, kind: Kind): string {
  return count === 1 ? kind.one : kind.many;
}

function them(count: number): string {
  return count === 1 ? "it" : "them";
}

function they(count: number, one: string, many: string): string {
  return count === 1 ? `It ${one}` : `They ${many}`;
}

export const REACH = {
  title: (count: number) => `${count} more out of reach`,
  whole: (count: number, kind: Kind, fresh: boolean) =>
    `${count} ${fresh ? "new " : ""}${noun(count, kind)} out of reach`,
  rank: (count: number, need: number, have: number) =>
    `${they(count, "needs", "need")} Mastery Rank ${need} or higher. You are Mastery Rank ${have}.`,
  place: (count: number, from: string, to: string) =>
    `Clear the ${to} Junction, on ${from}, to reach ${them(count)}.`,
  clan: (count: number) =>
    `${they(count, "comes", "come")} from the Dojo. Join a clan to enter it.`,
  both: (count: number, need: number | null, to: string | null) =>
    `${they(count, "needs", "need")} ${[
      need === null ? null : `Mastery Rank ${need}`,
      to === null ? "a clan's Dojo" : `a place past ${to}`,
    ]
      .filter((part) => part !== null)
      .join(" or ")}.`,
} as const;
