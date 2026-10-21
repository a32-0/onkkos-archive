import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MAP } from "@/content/system";
import { chromeOf } from "@/app/chrome";
import { requireScreen } from "@/app/screen";
import { readParam, type SearchParams } from "@/domain/types/next";
import { placeRoute } from "@/routes";
import { nextLens } from "@/screens/map/lens";
import { MapCategory } from "@/screens/map/MapCategory";

import { mapAt, mapOf } from "../map";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const group = (MAP.groups as Record<string, { name: string } | undefined>)[category];
  return group ? { title: group.name } : {};
}

export default async function MapCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: SearchParams;
}) {
  const screen = await requireScreen();
  const { category } = await params;
  const query = await searchParams;
  const { at, start } = await mapAt(screen, query, false);
  const { view } = await mapOf(screen, at, start);
  const group = view.sections
    .flatMap((section) => section.groups)
    .find((one) => one.key === category);
  if (!group) redirect(placeRoute(at.system.id, at.place));
  const asked = nextLens("left", readParam(query, "view") ?? "left");
  const initial = !group.lenses || (asked === "new" && !view.newLens) ? "left" : asked;
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
      initial={initial}
    />
  );
}
