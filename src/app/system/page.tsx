import type { Metadata } from "next";
import { chromeOf } from "@/app/chrome";
import { requireScreen } from "@/app/screen";
import type { SearchParams } from "@/domain/types/next";
import { MapScreen } from "@/screens/map/MapScreen";

import { PAGE_TITLES } from "@/content/app";
import { mapAt, mapOf } from "./map";

export const metadata: Metadata = { title: PAGE_TITLES.map };

export default async function SystemPage({ searchParams }: { searchParams: SearchParams }) {
  const screen = await requireScreen();
  const { at, start } = await mapAt(screen, await searchParams, true);
  return <MapScreen chrome={await chromeOf(screen)} {...await mapOf(screen, at, start)} />;
}
