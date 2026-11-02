import "server-only";

import { rankProgress, type RankProgress } from "@/domain/profile/mastery-rank";
import { catalogData } from "@/infra/catalog/data";
import { masteryCatalog } from "@/infra/catalog/items";
import type { Screen } from "@/infra/screen";

export function rankOf(screen: Screen): RankProgress | null {
  const data = catalogData();
  return rankProgress(screen.profile, {
    catalog: data.arsenal,
    weights: masteryCatalog(),
    nodes: data.wiki.nodes,
  });
}
