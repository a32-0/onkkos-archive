import { DETAILS, STEPS, TITLES } from "@/content/checks";
import { MAP } from "@/content/system";
import type { ReachGap } from "@/domain/place/reach";
import { itemRoute, stepAnchor } from "@/routes";

import { detailOf, titled } from "../../summary/lines";
import type {
  ProseRow,
  ProseSection,
  StepBlockView,
  StepCardView,
  StepLinkView,
  StepRowView,
  StepsFacts,
  StepsView,
} from "./state";

const PART = "part:";
const PREREQUISITES = "prerequisites";
const OR_SAYS = new Set(["tradeTitle", "wholeTitle"]);

function gapWords(gap: ReachGap): string {
  if (gap.kind === "rank") return DETAILS.masteryDetail({ now: gap.have, required: gap.need });
  if (gap.kind === "junction") return MAP.junctionGap(gap.from, gap.to);
  return MAP.clanGap;
}

function titleOf(row: ProseRow): string {
  const { title } = row;
  let text =
    row.alternative && title.say === "openRelicTitle"
      ? STEPS.relicAlternative(title.relic, title.vaulted)
      : titled(title);
  if (row.alternative) text = STEPS.alternative(text);
  if (row.optional) text = STEPS.optional(text);
  return row.best ? STEPS.highestChance(text) : text;
}

function linkOf(row: ProseRow, from: string): StepLinkView | null {
  if (row.thing !== null) {
    return { href: itemRoute(row.thing, from), label: STEPS.ourPage, target: "page" };
  }
  return row.wikiUrl === null ? null : { href: row.wikiUrl, label: STEPS.wiki, target: "wiki" };
}

export function stepsView(facts: StepsFacts, item: string, from: string): StepsView {
  const lock = facts.lock;
  let locked = false;

  const rowOf = (section: ProseSection, row: ProseRow): StepRowView => {
    const gap = lock !== null && section.id === PREREQUISITES && row.id === lock.row;
    const view: StepRowView = {
      id: row.id,
      anchor: row.id.startsWith(PART) ? stepAnchor(row.id) : null,
      title: titleOf(row),
      ...(row.imageUrl !== null && { art: row.imageUrl }),
      ...(section.checkable && { art: row.imageUrl }),
      alternative: row.alternative || OR_SAYS.has(row.title.say),
      best: row.best,
      locked,
      detail: gap ? gapWords(lock.gap) : detailOf(row.detail),
      prose: row.prose,
      link: linkOf(row, from),
    };
    if (gap) locked = true;
    return view;
  };

  const cardOf = (section: ProseSection): StepCardView => ({
    key: section.id,
    anchor: section.id.startsWith(PART) ? stepAnchor(section.id) : null,
    header: section.id.startsWith(PART)
      ? { title: titled(section.title), art: section.imageUrl }
      : null,
    checkable: section.checkable,
    groups: section.groups.map((group, index) => ({
      key: `${section.id}:${index}`,
      rows: group.rows.map((row) => rowOf(section, row)),
    })),
  });

  const blocks: StepBlockView[] = [];
  for (const section of facts.sections) {
    const card = cardOf(section);
    const last = blocks.at(-1);
    if (section.id.startsWith(PART) && last?.key === PART) {
      last.cards.push(card);
    } else if (section.id.startsWith(PART)) {
      blocks.push({ key: PART, title: TITLES.sectionBlueprints(), cards: [card] });
    } else {
      blocks.push({ key: section.id, title: titled(section.title), cards: [card] });
    }
  }

  return { scope: `item:${item}`, blocks };
}
