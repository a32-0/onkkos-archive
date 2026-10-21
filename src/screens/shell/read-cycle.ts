import { useSyncExternalStore } from "react";

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

const LOCAL_TIME: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

function localTime(at: number): string {
  return new Date(at).toLocaleTimeString("en-US", LOCAL_TIME);
}

const still = () => () => {};

export function useLocalTime(at: number): string | null {
  return useSyncExternalStore(
    still,
    () => localTime(at),
    () => null,
  );
}

export function readCycle(player: ShellPlayer, local: string | null = null): ReadCyclePart[] {
  const next = new Date(player.nextReadAt).toISOString().slice(11, 16);
  return SHELL.readCycle(SHELL.age(player.minutesSinceRead, player.fresh), next, local);
}
