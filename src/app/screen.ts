import "server-only";

import { redirect } from "next/navigation";

import { asksWhenLastPlayed } from "@/domain/graph/star-chart";
import { firstPlace, startHere } from "@/domain/place/start-here";
import { itemRanks } from "@/domain/place/state";
import { avatarOf } from "@/domain/profile/avatar";
import { metOnkko, onkkoSpeaks } from "@/domain/profile/onkko";
import type { RawProfile } from "@/domain/types/profile";
import { glyphImages } from "@/infra/catalog/items";
import { loadGraph } from "@/infra/graph/load";
import { loadSystems, placeCatalog, placeIndex } from "@/infra/place/load";
import { nextReadAt, readScreen, type Screen } from "@/infra/screen";
import { readOnkko } from "@/infra/session";
import { connectAfter, placeRoute, ROUTES } from "@/routes";
import type { ShellPlayer } from "@/screens/shell/read-cycle";
import type { OnkkoVoice } from "@/screens/shell/voice";

export async function requireScreen(): Promise<Screen> {
  const read = await readScreen();
  if (read.state === "no-account") redirect(ROUTES.connect);
  if (read.state === "failed") redirect(connectAfter(read.reason, read.retryAt));
  return read.screen;
}

export function playerOf(screen: Screen, now: number = Date.now()): ShellPlayer {
  return {
    name: screen.display.displayName ?? screen.accountId,
    avatar: avatarOf(screen.profile, glyphImages()),
    masteryRank: screen.display.masteryRank ?? 0,
    minutesSinceRead: Math.max(0, Math.floor((now - screen.fetchedAt) / 60_000)),
    nextReadAt: nextReadAt(screen.fetchedAt),
    fresh: !screen.cached,
  };
}

export function startHereOf(screen: Screen): string {
  const { systems } = loadSystems();
  const place =
    startHere(
      screen.graph,
      screen.profile,
      systems,
      placeIndex(),
      itemRanks(screen.profile, placeCatalog().entries),
    ) ?? firstPlace(systems);
  return place ? placeRoute(place.system, place.place) : ROUTES.system;
}

export function entranceAfter(profile: RawProfile): string {
  return asksWhenLastPlayed(loadGraph(), profile) ? ROUTES.features : ROUTES.goals;
}

export async function voiceOf(screen: Screen): Promise<OnkkoVoice> {
  return {
    met: metOnkko(screen.profile),
    on: onkkoSpeaks(screen.profile, await readOnkko()),
  };
}
