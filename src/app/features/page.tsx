import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PAGE_TITLES } from "@/content/app";
import { requireScreen, startHereOf, voiceOf } from "@/app/screen";
import { asksWhenLastPlayed } from "@/domain/graph/star-chart";
import { ROUTES } from "@/routes";
import { TwoWaysIn } from "@/screens/two-ways-in/TwoWaysIn";

export const metadata: Metadata = { title: PAGE_TITLES.features };

export default async function FeaturesPage() {
  const screen = await requireScreen();
  if (!asksWhenLastPlayed(screen.graph, screen.profile)) redirect(ROUTES.goals);
  return (
    <TwoWaysIn
      name={screen.display.displayName ?? null}
      voice={(await voiceOf(screen)).on}
      skip={startHereOf(screen)}
    />
  );
}
