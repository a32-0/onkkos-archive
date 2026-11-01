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
  failedAt: number | null;
  toast: { kind: "connected" | "updated"; key: string } | null;
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

export function staleLine(player: ShellPlayer, local: string): string {
  return SHELL.stale(SHELL.age(player.minutesSinceRead, false), local);
}

export function readCycle(player: ShellPlayer, local: string): ReadCyclePart[] {
  return SHELL.readCycle(SHELL.age(player.minutesSinceRead, player.fresh), local);
}
