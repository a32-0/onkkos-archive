import type { Metadata } from "next";

import { chromeOf } from "@/app/chrome";
import { goalState } from "@/app/goals/goals";
import { requireScreen } from "@/app/screen";
import { GOALS } from "@/content/goals";
import { Milestones } from "@/screens/goals/Milestones";
import { milestoneRows } from "@/screens/goals/view";

export const metadata: Metadata = { title: GOALS.milestones.title };

export default async function MilestonesPage() {
  const screen = await requireScreen();
  return (
    <Milestones chrome={await chromeOf(screen)} rows={milestoneRows(goalState(screen).done)} />
  );
}
