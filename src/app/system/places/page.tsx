import { chromeOf } from "@/app/chrome";
import { requireScreen } from "@/app/screen";
import { MAP } from "@/content/system";
import { readParam, type SearchParams } from "@/domain/types/next";
import { ROUTES, systemsRoute } from "@/routes";
import { PlaceList } from "@/screens/map/PlaceList";
import { Shell } from "@/screens/shell/Shell";

import { mapAt, mapOf } from "../map";

export default async function PlacesPage({ searchParams }: { searchParams: SearchParams }) {
  const screen = await requireScreen();
  const query = await searchParams;
  const { at, start } = await mapAt(screen, query, false);
  const { view } = await mapOf(screen, at, start);
  const chosen = readParam(query, "list") ?? view.system;
  const system =
    view.places.find((one) => one.id === chosen) ??
    view.places.find((one) => one.id === view.system);
  const chrome = await chromeOf(screen);
  return (
    <Shell
      chrome={chrome}
      tab="navigation"
      tabs
      bar={{ title: MAP.locations, back: ROUTES.system }}
    >
      {system && (
        <PlaceList
          system={system}
          systemsHref={systemsRoute(view.system, view.place, system.id)}
          voice={chrome.voice.on}
        />
      )}
    </Shell>
  );
}
