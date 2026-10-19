import { SHELL } from "@/content/nav";

export type ReadCyclePart = { text: string; strong?: boolean };

export interface ShellPlayer {
  name: string;
  avatar: string | null;
  masteryRank: number;
  minutesSinceRead: number;
  nextReadAt: number;
  fresh: boolean;
}

export function readCycle(player: ShellPlayer): ReadCyclePart[] {
  const next = new Date(player.nextReadAt).toISOString().slice(11, 16);
  return SHELL.readCycle(SHELL.age(player.minutesSinceRead, player.fresh), next);
}
