import { notFound } from "next/navigation";

import { disconnect, resume } from "@/app/actions";
import { playerOf, requireScreen, startHereOf } from "@/app/screen";
import { RESUME } from "@/content/catch-up";
import { gameUpdates } from "@/domain/catalog/updates";
import { describeMonth, recentMonths, shortMonth } from "@/domain/since";
import { readParam, type SearchParams } from "@/domain/types/next";
import { updateSources } from "@/infra/catalog/data";
import { readSince } from "@/infra/session";
import { Resume } from "@/screens/resume/Resume";

const MONTHS_LISTED = 12;

export default async function CatchUpPage({ searchParams }: { searchParams: SearchParams }) {
  const screen = await requireScreen();
  const step = readParam(await searchParams, "step");
  const onboarding = step === "resume" || step === "summary";
  if ((await readSince()) && step !== "resume") notFound();

  const updates = gameUpdates(screen.graph, updateSources()).map((update, index) => ({
    since: update.yearMonth,
    name: update.name,
    version: update.version,
    meta: RESUME.meta(update.version, shortMonth(update.yearMonth)),
    art: update.art,
    newest: index === 0,
  }));
  const months = recentMonths(new Date(), MONTHS_LISTED).map((value) => ({
    value,
    label: describeMonth(value),
  }));

  return (
    <Resume
      player={playerOf(screen)}
      disconnect={disconnect}
      onboarding={onboarding}
      updates={updates}
      months={months}
      choose={resume}
      skip={startHereOf(screen)}
    />
  );
}
