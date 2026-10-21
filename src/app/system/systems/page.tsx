import type { Metadata } from "next";
import { chromeOf } from "@/app/chrome";
import { requireScreen } from "@/app/screen";
import { MAP } from "@/content/system";
import { readParam, type SearchParams } from "@/domain/types/next";
import { placesRoute } from "@/routes";
import { SystemList } from "@/screens/map/SystemList";
import { Shell } from "@/screens/shell/Shell";

import { PAGE_TITLES } from "@/content/app";
import { mapAt, mapOf } from "../map";

export const metadata: Metadata = { title: PAGE_TITLES.systems };

export default async function SystemsPage({ searchParams }: { searchParams: SearchParams }) {
  const screen = await requireScreen();
  const query = await searchParams;
  const { at, start } = await mapAt(screen, query, false);
  const { view } = await mapOf(screen, at, start);
  const chosen = readParam(query, "list") ?? view.system;
  const chrome = await chromeOf(screen);
  return (
    <Shell
      chrome={chrome}
      tab="navigation"
      tabs
      bar={{ title: MAP.systems, back: placesRoute(view.system, view.place, chosen) }}
    >
      <SystemList
        systems={view.systems}
        more={view.moreSystems}
        chosen={chosen}
        system={view.system}
        place={view.place}
        voice={chrome.voice.on}
      />
    </Shell>
  );
}
