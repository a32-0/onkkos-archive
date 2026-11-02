import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { chromeOf } from "@/app/chrome";
import { rankOf } from "@/app/rank";
import { requireScreen } from "@/app/screen";
import { RANK } from "@/content/rank";
import { fetchWikiFileUrls } from "@/infra/wiki/client";
import { gameIcons } from "@/infra/wiki/icons";
import { ROUTES } from "@/routes";
import { RankScreen } from "@/screens/rank/RankScreen";
import { rankOverview, rankSteps } from "@/screens/rank/view";

export const metadata: Metadata = { title: RANK.title };

const rankArt = (rank: number) => `IconRank${rank}.png`;

export default async function RankPage() {
  const screen = await requireScreen();
  const progress = rankOf(screen);
  if (progress === null || progress.state !== "progress") redirect(ROUTES.goals);
  const file = rankArt(progress.next);
  const [icons, art] = await Promise.all([gameIcons(), fetchWikiFileUrls([file])]);
  return (
    <RankScreen
      chrome={await chromeOf(screen)}
      page={{
        kicker: RANK.kicker,
        name: RANK.name(progress.next),
        overview: rankOverview(progress, icons, art.get(file) ?? null, "goal"),
        steps: rankSteps(progress),
      }}
    />
  );
}
