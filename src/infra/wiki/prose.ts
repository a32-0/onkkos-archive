import "server-only";

import type { ProseAsk, StepPlan, StepRow, StepSection } from "@/domain/catalog/checks";
import { askedPage, linkedPage, pageOf, type Wiki } from "@/domain/catalog/wiki";
import { wikiPassage } from "@/infra/wiki/client";

interface ReadyRow extends Omit<StepRow, "prose"> {
  prose: string[] | null;
}

export interface ReadySection extends Omit<StepSection, "groups"> {
  groups: { title: StepSection["groups"][number]["title"]; rows: ReadyRow[] }[];
}

function askKey(ask: ProseAsk): string {
  return `${ask.source}:${ask.title}`;
}

function ready(wiki: Wiki, ask: ProseAsk | null): ProseAsk | null {
  if (ask === null) return null;
  const page = pageOf(wiki, ask.title);
  return page === null ? null : { ...ask, title: page ?? askedPage(wiki, ask.title) };
}

export async function withProse(
  wiki: Wiki,
  plan: StepPlan,
  owner: string,
): Promise<ReadySection[]> {
  const asks = new Map<string, ProseAsk>();
  for (const section of plan.sections) {
    for (const group of section.groups) {
      for (const row of group.rows) {
        const ask = ready(wiki, row.prose);
        if (ask) asks.set(askKey(ask), ask);
      }
    }
  }

  const answers = new Map(
    await Promise.all(
      [...asks].map(async ([key, ask]) => [key, await wikiPassage(ask.title, ask.source)] as const),
    ),
  );

  return plan.sections.map((section) => ({
    ...section,
    groups: section.groups.map((group) => ({
      title: group.title,
      rows: group.rows.map((row) => {
        const ask = ready(wiki, row.prose);
        return {
          ...row,
          prose: ask ? (answers.get(askKey(ask)) ?? null) : null,
          wikiTitle: row.wikiTitle === null ? null : linkedPage(wiki, row.wikiTitle, owner),
        };
      }),
    })),
  }));
}
