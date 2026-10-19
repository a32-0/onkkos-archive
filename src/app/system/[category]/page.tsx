import { redirect } from "next/navigation";

import { chromeOf } from "@/app/chrome";
import { requireScreen } from "@/app/screen";
import type { SearchParams } from "@/domain/types/next";
import { placeRoute } from "@/routes";
import { MapCategory } from "@/screens/map/MapCategory";

import { mapAt, mapOf } from "../map";

export default async function MapCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: SearchParams;
}) {
  const screen = await requireScreen();
  const { category } = await params;
  const { at, start } = await mapAt(screen, await searchParams, false);
  const { view } = await mapOf(screen, at, start);
  const group = view.sections
    .flatMap((section) => section.groups)
    .find((one) => one.key === category);
  if (!group) redirect(placeRoute(at.system.id, at.place));
  return (
    <MapCategory
      chrome={await chromeOf(screen)}
      group={group}
      system={at.system.id}
      systemName={view.systemName}
      place={view.place}
      orb={view.overview.orb}
      newLens={view.newLens}
      empty={view.empty}
    />
  );
}
