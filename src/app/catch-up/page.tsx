import type { ComponentProps } from "react";

import { resume } from "@/app/actions";
import { chromeOf } from "@/app/chrome";
import { requireScreen, startHereOf } from "@/app/screen";
import { RESUME, SUMMARY } from "@/content/catch-up";
import { allPlaces } from "@/domain/catalog/places";
import { gameUpdates, updateStanding, type GameUpdate } from "@/domain/catalog/updates";
import { bestPlaces, whatsNew } from "@/domain/catalog/whats-new";
import { readReach } from "@/domain/place/reach";
import { describeMonth, shortMonth } from "@/domain/since";
import { readParam, type SearchParams } from "@/domain/types/next";
import { catalogData, updateSources } from "@/infra/catalog/data";
import { placeIndex } from "@/infra/place/load";
import { readSince } from "@/infra/session";
import type { Screen } from "@/infra/screen";
import { gameIcons } from "@/infra/wiki/icons";
import { Resume } from "@/screens/resume/Resume";
import { Summary } from "@/screens/summary/Summary";
import { summarySections } from "@/screens/summary/view";

function metaOf(update: GameUpdate): string {
  return RESUME.meta(update.version, shortMonth(update.yearMonth));
}

async function summaryOf(
  screen: Screen,
  since: string,
): Promise<Pick<ComponentProps<typeof Summary>, "card" | "updates" | "sections" | "month">> {
  const sources = updateSources();
  const updates = gameUpdates(screen.graph, sources);
  const { update, current } = updateStanding(screen.graph, sources, since, screen.profile);
  const news = whatsNew(
    {
      data: catalogData(),
      places: new Set(allPlaces(screen.graph).map((place) => place.name)),
      bestPlaces: bestPlaces(placeIndex()),
      reach: readReach(screen.graph, screen.profile),
      now: Date.now(),
    },
    since,
  );

  return {
    card: {
      kind: current ? "up-to-date" : "last-played",
      eyebrow: current ? SUMMARY.upToDate : SUMMARY.lastPlayed,
      name: update?.name ?? describeMonth(since),
      meta: update ? metaOf(update) : "",
      art: update?.art ?? null,
    },
    updates: updates
      .filter((one) => one.version !== update?.version)
      .map((one) => ({ value: one.yearMonth, name: one.name, meta: metaOf(one), art: one.art })),
    sections: summarySections(news, await gameIcons()),
    month: shortMonth(since),
  };
}

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
        choose={resume}
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
