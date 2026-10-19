import { redirect } from "next/navigation";

import { chromeOf } from "@/app/chrome";
import { requireScreen } from "@/app/screen";
import { readParam, type SearchParams } from "@/domain/types/next";
import { readSince } from "@/infra/session";
import { catchUpAt } from "@/routes";
import { SummaryCategory } from "@/screens/summary/SummaryCategory";

import { summaryOf } from "../summary";

export default async function CatchUpCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: SearchParams;
}) {
  const screen = await requireScreen();
  const { category } = await params;
  const onboarding = readParam(await searchParams, "step") === "summary";
  const home = catchUpAt(onboarding ? "summary" : null);
  const since = await readSince();
  if (!since) redirect(home);
  const { sections } = await summaryOf(screen, since);
  const group = sections.flatMap((section) => section.groups).find((one) => one.key === category);
  if (!group) redirect(home);
  return (
    <SummaryCategory
      chrome={await chromeOf(screen)}
      onboarding={onboarding}
      group={group}
      back={home}
    />
  );
}
