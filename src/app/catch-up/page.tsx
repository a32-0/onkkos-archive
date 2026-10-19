import { resume } from "@/app/actions";
import { chromeOf } from "@/app/chrome";
import { requireScreen, startHereOf } from "@/app/screen";
import { gameUpdates } from "@/domain/catalog/updates";
import { describeMonth, shortMonth } from "@/domain/since";
import { readParam, type SearchParams } from "@/domain/types/next";
import { updateSources } from "@/infra/catalog/data";
import { readSince } from "@/infra/session";
import { Resume } from "@/screens/resume/Resume";
import { Summary } from "@/screens/summary/Summary";

import { metaOf, summaryOf } from "./summary";

export default async function CatchUpPage({ searchParams }: { searchParams: SearchParams }) {
  const screen = await requireScreen();
  const step = readParam(await searchParams, "step");
  const onboarding = step === "resume" || step === "summary";
  const since = await readSince();
  if (since && step !== "resume") {
    return (
      <Summary
        chrome={await chromeOf(screen)}
        onboarding={onboarding}
        skip={startHereOf(screen)}
        {...await summaryOf(screen, since)}
      />
    );
  }

  const updates = gameUpdates(screen.graph, updateSources()).map((update, index) => ({
    since: update.yearMonth,
    name: update.name,
    version: update.version,
    versions: update.versions,
    dates: update.yearMonths.map((month) =>
      [month, describeMonth(month), shortMonth(month)].join(" "),
    ),
    meta: metaOf(update),
    art: update.art,
    newest: index === 0,
  }));
  return (
    <Resume
      chrome={await chromeOf(screen)}
      onboarding={onboarding}
      updates={updates}
      choose={resume}
      skip={startHereOf(screen)}
    />
  );
}
