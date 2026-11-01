import {
  collectibleStepPlan,
  questStepPlan,
  stepPlan,
  type Reader,
  type StepPlan,
} from "@/domain/catalog/checks";
import { collectibleView } from "@/domain/catalog/collectibles";
import type { CatalogData } from "@/domain/catalog/data";
import { dossier } from "@/domain/catalog/dossier";
import { askedPage } from "@/domain/catalog/wiki";

export interface OwnedPlan {
  owner: string;
  kind: "arsenal" | "collectible" | "quest";
  plan: StepPlan;
}

export function everyPlan(
  data: CatalogData,
  places: ReadonlySet<string>,
  reader: Reader,
): OwnedPlan[] {
  return [
    ...data.arsenal.map((item) => ({
      owner: item.name,
      kind: "arsenal" as const,
      plan: stepPlan(data, dossier(item, data.arsenal), reader),
    })),
    ...[...data.collectibles.values()].map((collectible) => ({
      owner: collectible.name,
      kind: "collectible" as const,
      plan: collectibleStepPlan(data, collectibleView(data, collectible, places, places), reader),
    })),
    ...data.spine.arcs
      .flatMap((arc) => arc.quests)
      .map((quest) => ({
        owner: quest.name,
        kind: "quest" as const,
        plan: questStepPlan(data, quest, reader),
      })),
  ];
}

export function linkedTitles(data: CatalogData, plans: readonly OwnedPlan[]): string[] {
  const titles = new Set<string>();
  for (const { owner, plan } of plans) {
    titles.add(askedPage(data.wiki, owner));
    for (const section of plan.sections) {
      for (const group of section.groups) {
        for (const row of group.rows) {
          if (row.wikiTitle !== null) titles.add(askedPage(data.wiki, row.wikiTitle));
          if (row.prose !== null) titles.add(askedPage(data.wiki, row.prose.title));
        }
      }
    }
  }
  return [...titles].sort();
}
