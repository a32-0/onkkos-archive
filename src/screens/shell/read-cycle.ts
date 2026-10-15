import { SHELL } from "@/content/nav";
import type { ReadCyclePart } from "@/ui/PlayerMenu/PlayerMenu";

export interface ShellPlayer {
  name: string;
  masteryRank: number;
  minutesSinceRead: number;
  nextReadAt: number;
  fresh: boolean;
}

export function readCycle(player: ShellPlayer): ReadCyclePart[] {
  const next = new Date(player.nextReadAt).toISOString().slice(11, 16);
  return SHELL.readCycle(SHELL.age(player.minutesSinceRead, player.fresh), next);
}
