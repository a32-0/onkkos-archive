import "server-only";

import { RESUME, SUMMARY } from "@/content/catch-up";
import { allPlaces } from "@/domain/catalog/places";
import { gameUpdates, updateStanding, type GameUpdate } from "@/domain/catalog/updates";
import { bestPlaces, whatsNew } from "@/domain/catalog/whats-new";
import { readReach } from "@/domain/place/reach";
import { itemRanks } from "@/domain/place/state";
import { describeMonth, shortMonth } from "@/domain/since";
import { catalogData, updateSources } from "@/infra/catalog/data";
import { placeCatalog, placeIndex } from "@/infra/place/load";
import type { Screen } from "@/infra/screen";
import { gameIcons } from "@/infra/wiki/icons";
import type { SummaryCardView, SummarySection, SummaryUpdate } from "@/screens/summary/state";
import { summarySections } from "@/screens/summary/view";

export function datesOf(update: GameUpdate): string[] {
  return update.yearMonths.map((month) =>
    [month, describeMonth(month), shortMonth(month)].join(" "),
  );
}

export function metaOf(update: GameUpdate): string {
  return RESUME.meta(update.version, shortMonth(update.yearMonth));
}

export function cardOf(
  update: GameUpdate | null,
  current: boolean,
  fallback: string,
): SummaryCardView {
  return {
    kind: current ? "up-to-date" : "last-played",
    eyebrow: current ? SUMMARY.upToDate : SUMMARY.lastPlayed,
    name: update?.name ?? fallback,
    meta: update ? metaOf(update) : "",
    art: update?.art ?? null,
  };
}

export function chosenUpdate(screen: Screen, since: string | null): string | null {
  if (since === null) return null;
  return (
    updateStanding(screen.graph, updateSources(), since, screen.profile).update?.version ?? null
  );
}

export function everyUpdate(screen: Screen, since: string | null): SummaryUpdate[] {
  const updates = gameUpdates(screen.graph, updateSources());
  const chosen = chosenUpdate(screen, since);
  return updates.map((one) => ({
    version: one.version,
    versions: one.versions,
    dates: datesOf(one),
    value: one.yearMonth,
    name: one.name,
    meta: metaOf(one),
    art: one.art,
    newest: one.version === updates[0]?.version,
    selected: one.version === chosen,
  }));
}

export async function summaryOf(
  screen: Screen,
  since: string,
): Promise<{ card: SummaryCardView; sections: SummarySection[]; month: string }> {
  const { update, current } = updateStanding(screen.graph, updateSources(), since, screen.profile);
  const news = whatsNew(
    {
      data: catalogData(),
      places: new Set(allPlaces(screen.graph).map((place) => place.name)),
      bestPlaces: bestPlaces(placeIndex()),
      reach: readReach(screen.graph, screen.profile),
      ranks: itemRanks(screen.profile, placeCatalog().entries),
      now: Date.now(),
    },
    since,
  );
  return {
    card: cardOf(update, current, describeMonth(since)),
    sections: summarySections(news, await gameIcons()),
    month: shortMonth(since),
  };
}
