import "server-only";

import type { ProseAsk, StepPlan, StepRow, StepSection } from "@/domain/catalog/checks";
import type { Wiki } from "@/domain/catalog/wiki";
import { wikiPassage } from "@/infra/wiki/client";

interface ReadyRow extends Omit<StepRow, "prose"> {
  prose: string[] | null;
}

export interface ReadySection extends Omit<StepSection, "groups"> {
  groups: { title: StepSection["groups"][number]["title"]; rows: ReadyRow[] }[];
}

function canonical(wiki: Wiki, title: string): string {
  return wiki.titles.get(title) ?? title;
}

function askKey(ask: ProseAsk): string {
  return `${ask.source}:${ask.title}`;
}

function ready(wiki: Wiki, ask: ProseAsk): ProseAsk {
  return { ...ask, title: canonical(wiki, ask.title) };
}

export async function withProse(wiki: Wiki, plan: StepPlan): Promise<ReadySection[]> {
  const asks = new Map<string, ProseAsk>();
  for (const section of plan.sections) {
    for (const group of section.groups) {
      for (const row of group.rows) {
        if (!row.prose) continue;
        const ask = ready(wiki, row.prose);
        asks.set(askKey(ask), ask);
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
      rows: group.rows.map((row) => ({
        ...row,
        prose: row.prose ? (answers.get(askKey(ready(wiki, row.prose))) ?? null) : null,
        wikiTitle: row.wikiTitle === null ? null : canonical(wiki, row.wikiTitle),
      })),
    })),
  }));
}
