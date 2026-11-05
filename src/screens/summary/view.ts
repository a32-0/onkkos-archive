import { SUMMARY } from "@/content/catch-up";
import { shortName } from "@/content/names";
import { REACH, type BeyondWords, type Kind } from "@/content/reach";
import type { Beyond, NewGroup, WhatsNew } from "@/domain/catalog/whats-new";
import { itemRoute } from "@/routes";

import { GROUP_SYMBOLS } from "../map/symbols";
import { tileLines, titled } from "./lines";
import type { SummaryGroup, SummarySection } from "./state";

const FROM = "resume";

function reason(beyond: Beyond): string {
  const only = beyond.kinds.length === 1 ? beyond.kinds[0] : null;
  if (only === "rank" && beyond.need !== null && beyond.have !== null) {
    return REACH.rank(beyond.count, beyond.need, beyond.have);
  }
  if (only === "junction" && beyond.junction) {
    return REACH.place(beyond.count, beyond.junction.from, beyond.junction.to);
  }
  if (only === "clan") return REACH.clan(beyond.count);
  return REACH.both(beyond.count, beyond.need, beyond.junction?.to ?? null);
}

function beyondWords(beyond: Beyond, kind: Kind): BeyondWords {
  return {
    title: REACH.title(beyond.count),
    whole: REACH.whole(beyond.count, kind, true),
    line: reason(beyond),
  };
}

function routeLines(tile: NewGroup["tiles"][number]): { reading: string; place: string } {
  const lines = tileLines(tile.reading, tile.where);
  return lines.reading === "" && tile.route ? { ...lines, reading: titled(tile.route) } : lines;
}

function groupView(group: NewGroup, icons: Readonly<Record<string, string>>): SummaryGroup {
  const words = SUMMARY.groups[group.group];
  return {
    id: `summary-${group.group}`,
    key: group.group,
    name: words.name,
    icon: icons[group.group] ?? null,
    ...(GROUP_SYMBOLS[group.group] && { symbol: GROUP_SYMBOLS[group.group] }),
    count: SUMMARY.count(group.count),
    tiles: group.tiles.map((tile) => ({
      name: shortName(tile.name, group.group),
      href: itemRoute(tile.name, FROM),
      art: tile.art,
      mastered: tile.mastered,
      ...routeLines(tile),
    })),
    more: group.beyond ? beyondWords(group.beyond, words) : null,
    lenses: group.lenses,
    empty: SUMMARY.emptyLens(words),
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
