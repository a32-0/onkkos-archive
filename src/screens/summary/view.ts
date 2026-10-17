import { SUMMARY } from "@/content/catch-up";
import { REACH, type Kind } from "@/content/reach";
import type { Beyond, NewGroup, WhatsNew } from "@/domain/catalog/whats-new";
import { itemRoute } from "@/routes";

import { tileLines } from "./lines";
import type { SummaryGroup, SummarySection } from "./state";

const FROM = "resume";

function moreLine(beyond: Beyond, kind: Kind): string {
  const only = beyond.kinds.length === 1 ? beyond.kinds[0] : null;
  if (only === "rank" && beyond.need !== null && beyond.have !== null) {
    return REACH.rank(beyond.count, kind, beyond.need, beyond.have);
  }
  if (only === "junction" && beyond.junction) {
    return REACH.place(beyond.count, kind, beyond.junction.from, beyond.junction.to);
  }
  if (only === "clan") return REACH.clan(beyond.count, kind);
  return REACH.both(beyond.count, kind, beyond.need, beyond.junction?.to ?? null);
}

function groupView(group: NewGroup, icons: Readonly<Record<string, string>>): SummaryGroup {
  const words = SUMMARY.groups[group.group];
  return {
    id: `summary-${group.group}`,
    name: words.name,
    icon: icons[group.group] ?? null,
    count: SUMMARY.count(group.count),
    tiles: group.tiles.map((tile) => ({
      name: tile.name,
      href: itemRoute(tile.name, FROM),
      art: tile.art,
      ...tileLines(tile.reading, tile.where),
    })),
    more: group.beyond ? moreLine(group.beyond, words) : null,
  };
}

export function summarySections(
  news: WhatsNew,
  icons: Readonly<Record<string, string>>,
): SummarySection[] {
  const sections: SummarySection[] = [
    {
      id: "arsenal",
      label: SUMMARY.arsenal,
      groups: news.arsenal.map((group) => groupView(group, icons)),
    },
    {
      id: "collection",
      label: SUMMARY.collection,
      groups: news.collection.map((group) => groupView(group, icons)),
    },
  ];
  return sections.filter((section) => section.groups.length > 0);
}
