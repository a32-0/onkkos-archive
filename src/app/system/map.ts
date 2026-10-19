import "server-only";

import { redirect } from "next/navigation";

import { cardOf } from "@/app/catch-up/summary";
import { allPlaces } from "@/domain/catalog/places";
import { gameUpdates, updateStanding } from "@/domain/catalog/updates";
import { bestPlaces, itemLine, masteryReqOf } from "@/domain/catalog/whats-new";
import { placeMap, systemStandings } from "@/domain/place/map";
import { readReach } from "@/domain/place/reach";
import type { SystemEntry } from "@/domain/place/schema";
import { firstPlace, startHere, type PlaceRef } from "@/domain/place/start-here";
import { itemRanks } from "@/domain/place/state";
import { readParam, type ResolvedSearchParams } from "@/domain/types/next";
import { catalogData, updateSources } from "@/infra/catalog/data";
import { loadSystems, placeCatalog, placeIndex } from "@/infra/place/load";
import type { Screen } from "@/infra/screen";
import { readPlace, readSince } from "@/infra/session";
import { gameIcons } from "@/infra/wiki/icons";
import { placeRoute, ROUTES } from "@/routes";
import type { MapView } from "@/screens/map/state";
import { mapView } from "@/screens/map/view";
import type { SummaryCardView } from "@/screens/summary/state";

export interface MapAt {
  system: SystemEntry;
  place: string;
}

function located(
  systems: readonly SystemEntry[],
  system: string | null,
  place: string | null,
): MapAt | null {
  const entry = systems.find((one) => one.id === system && one.released);
  return entry && place !== null && entry.places.includes(place) ? { system: entry, place } : null;
}

function startOf(screen: Screen): PlaceRef | null {
  return startHere(
    screen.graph,
    screen.profile,
    loadSystems().systems,
    placeIndex(),
    itemRanks(screen.profile, placeCatalog().entries),
  );
}

export async function mapAt(
  screen: Screen,
  query: ResolvedSearchParams,
  strict: boolean,
): Promise<{ at: MapAt; start: PlaceRef | null }> {
  const { systems } = loadSystems();
  const start = startOf(screen);
  const at = located(systems, readParam(query, "system"), readParam(query, "place"));
  if (at) return { at, start };
  const last = await readPlace();
  const kept = last && located(systems, last.system, last.place);
  const target = kept
    ? { system: kept.system.id, place: kept.place }
    : (start ?? firstPlace(systems));
  if (!target) redirect(ROUTES.goals);
  if (strict) redirect(placeRoute(target.system, target.place));
  const entry = located(systems, target.system, target.place);
  if (!entry) redirect(ROUTES.goals);
  return { at: entry, start };
}

export async function mapOf(
  screen: Screen,
  at: MapAt,
  start: PlaceRef | null,
): Promise<{ view: MapView; card: SummaryCardView }> {
  const since = await readSince();
  const { systems, colors } = loadSystems();
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
    lineOf: (name) => itemLine(sources, name),
    masteryReqOf: (name) => masteryReqOf(data, name),
  });

  const updateData = updateSources();
  const { update, current } =
    since === null
      ? { update: gameUpdates(screen.graph, updateData)[0] ?? null, current: true }
      : updateStanding(screen.graph, updateData, since, screen.profile);

  const card = cardOf(update, current, "");
  return {
    view: mapView({
      map,
      standings: systemStandings(systems, index, ranks, reach, since),
      start,
      since,
      icons: await gameIcons(),
      orbs: colors,
    }),
    card: since === null ? { ...card, meta: "" } : card,
  };
}
