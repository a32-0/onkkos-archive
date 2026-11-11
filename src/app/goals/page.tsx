import type { Metadata } from "next";

import { chromeOf } from "@/app/chrome";
import { goalState } from "@/app/goals/goals";
import { rankOf } from "@/app/rank";
import { requireScreen, startHereOf } from "@/app/screen";
import { PAGE_TITLES } from "@/content/app";
import { ROUTES } from "@/routes";
import { Goals } from "@/screens/goals/Goals";
import { goalCards } from "@/screens/goals/view";
import { rankCard } from "@/screens/rank/view";

export const metadata: Metadata = { title: PAGE_TITLES.goal };

export default async function GoalsPage() {
  const screen = await requireScreen();
  const { open, done } = goalState(screen);
  return (
    <Goals
      chrome={await chromeOf(screen)}
      cards={goalCards(open)}
      rank={rankCard(rankOf(screen), ROUTES.rank)}
      reached={done.length > 0 ? { href: ROUTES.milestones, count: done.length } : null}
      skip={startHereOf(screen)}
    />
  );
}
