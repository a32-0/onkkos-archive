import { redirect } from "next/navigation";
import type { ComponentProps } from "react";

import { remeasure } from "@/app/actions";
import { chromeOf } from "@/app/chrome";
import { requireScreen } from "@/app/screen";
import { RESUME, SUMMARY } from "@/content/catch-up";
import { MAP } from "@/content/system";
import { allPlaces } from "@/domain/catalog/places";
import { gameUpdates, updateStanding, type GameUpdate } from "@/domain/catalog/updates";
import { bestPlaces, itemLine, masteryReqOf } from "@/domain/catalog/whats-new";
import { placeMap, systemStandings } from "@/domain/place/map";
import { readReach } from "@/domain/place/reach";
import type { SystemEntry } from "@/domain/place/schema";
import { firstPlace, startHere, type PlaceRef } from "@/domain/place/start-here";
import { itemRanks } from "@/domain/place/state";
import { nodeCountsByPlace } from "@/domain/profile/nodes";
import { shortMonth } from "@/domain/since";
import { readParam, type SearchParams } from "@/domain/types/next";
import { catalogData, updateSources } from "@/infra/catalog/data";
import { loadSystems, placeCatalog, placeIndex } from "@/infra/place/load";
import type { Screen } from "@/infra/screen";
import { readPlace, readSince } from "@/infra/session";
import { gameIcons, placeIcons } from "@/infra/wiki/icons";
import { placeRoute, ROUTES } from "@/routes";
import { MapScreen } from "@/screens/map/MapScreen";
import { mapView } from "@/screens/map/view";

function located(
  systems: readonly SystemEntry[],
  system: string | null,
  place: string | null,
): { system: SystemEntry; place: string } | null {
  const entry = systems.find((one) => one.id === system && one.released);
  return entry && place !== null && entry.places.includes(place) ? { system: entry, place } : null;
}

function metaOf(update: GameUpdate): string {
  return RESUME.meta(update.version, shortMonth(update.yearMonth));
}

async function mapOf(
  screen: Screen,
  at: { system: SystemEntry; place: string },
  start: PlaceRef | null,
): Promise<Omit<ComponentProps<typeof MapScreen>, "chrome" | "choose">> {
  const since = await readSince();
  const { systems } = loadSystems();
  const index = placeIndex();
  const data = catalogData();
  const ranks = itemRanks(screen.profile, placeCatalog().entries);
  const reach = readReach(screen.graph, screen.profile);
  const sources = {
    data,
    places: new Set(allPlaces(screen.graph).map((place) => place.name)),
    bestPlaces: bestPlaces(index),
    reach,
    now: Date.now(),
  };
  const map = placeMap({
    system: at.system,
    place: at.place,
    view: index.get(at.place) ?? null,
    ranks,
    reach,
    since,
    nodes: nodeCountsByPlace(screen.profile),
    lineOf: (name) => itemLine(sources, name),
    masteryReqOf: (name) => masteryReqOf(data, name),
  });

  const updateData = updateSources();
  const updates = gameUpdates(screen.graph, updateData);
  const { update, current } = updateStanding(screen.graph, updateData, since, screen.profile);

  return {
    view: mapView({
      map,
      standings: systemStandings(systems, index, ranks, reach, since),
      start,
      since,
      icons: await gameIcons(),
      orbs: await placeIcons(systems.flatMap((system) => system.places)),
    }),
    card: {
      kind: current ? "up-to-date" : "last-played",
      eyebrow: current ? SUMMARY.upToDate : SUMMARY.lastPlayed,
      name: update?.name ?? MAP.pickUpdate,
      meta: update ? metaOf(update) : "",
      art: update?.art ?? null,
    },
    updates: updates
      .filter((one) => one.version !== update?.version)
      .map((one) => ({ value: one.yearMonth, name: one.name, meta: metaOf(one), art: one.art })),
  };
}

export default async function SystemPage({ searchParams }: { searchParams: SearchParams }) {
  const screen = await requireScreen();
  const query = await searchParams;
  const { systems } = loadSystems();
  const start = startHere(
    screen.graph,
    screen.profile,
    systems,
    placeIndex(),
    itemRanks(screen.profile, placeCatalog().entries),
  );
  const at = located(systems, readParam(query, "system"), readParam(query, "place"));
  if (!at) {
    const last = await readPlace();
    const kept = last && located(systems, last.system, last.place);
    const target = kept
      ? { system: kept.system.id, place: kept.place }
      : (start ?? firstPlace(systems));
    redirect(target ? placeRoute(target.system, target.place) : ROUTES.goals);
  }

  return (
    <MapScreen
      chrome={await chromeOf(screen)}
      choose={remeasure}
      {...await mapOf(screen, at, start)}
    />
  );
}
