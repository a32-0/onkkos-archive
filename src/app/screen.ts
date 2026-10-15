import "server-only";

import { redirect } from "next/navigation";

import { nextReadAt, readScreen, type Screen } from "@/infra/screen";
import { connectAfter, ROUTES } from "@/routes";
import type { ShellPlayer } from "@/screens/shell/read-cycle";

export async function requireScreen(): Promise<Screen> {
  const read = await readScreen();
  if (read.state === "no-account") redirect(ROUTES.connect);
  if (read.state === "failed") redirect(connectAfter(read.reason, read.retryAt));
  return read.screen;
}

export function playerOf(screen: Screen, now: number = Date.now()): ShellPlayer {
  return {
    name: screen.display.displayName ?? screen.accountId,
    masteryRank: screen.display.masteryRank ?? 0,
    minutesSinceRead: Math.max(0, Math.floor((now - screen.fetchedAt) / 60_000)),
    nextReadAt: nextReadAt(screen.fetchedAt),
    fresh: !screen.cached,
  };
}
