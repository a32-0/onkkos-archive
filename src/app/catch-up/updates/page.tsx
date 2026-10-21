import type { Metadata } from "next";
import { remeasure, resume } from "@/app/actions";
import { chromeOf } from "@/app/chrome";
import { requireScreen } from "@/app/screen";
import { readParam, type SearchParams } from "@/domain/types/next";
import { readSince } from "@/infra/session";
import { catchUpAt, ROUTES } from "@/routes";
import { Updates } from "@/screens/summary/Updates";

import { PAGE_TITLES } from "@/content/app";
import { otherUpdates } from "../summary";

export const metadata: Metadata = { title: PAGE_TITLES.updates };

export default async function UpdatesPage({ searchParams }: { searchParams: SearchParams }) {
  const screen = await requireScreen();
  const query = await searchParams;
  const fromMap = readParam(query, "from") === "navigation";
  const onboarding = !fromMap && readParam(query, "step") === "summary";
  const back = fromMap ? ROUTES.system : catchUpAt(onboarding ? "summary" : null);
  return (
    <Updates
      chrome={await chromeOf(screen)}
      tab={fromMap ? "navigation" : "resume"}
      onboarding={onboarding}
      updates={otherUpdates(screen, await readSince())}
      choose={fromMap ? remeasure : resume}
      back={back}
    />
  );
}
