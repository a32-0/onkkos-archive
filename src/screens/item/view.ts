import { ITEM } from "@/content/item";
import { MAP } from "@/content/system";
import type { BriefLine } from "@/domain/catalog/summary";
import { itemRoute, placeRoute, type ItemView } from "@/routes";
import type { ItemHeroState } from "@/ui/ItemHero/ItemHero";

import { openedFrom, tabHome } from "../shell/tabs";
import { tileLines, titled } from "../summary/lines";
import type { ItemFacts, ItemPageView, ItemRowView, ItemSectionView } from "./state";

const STEPS = "steps";
const SUMMARY = "summary";

export function initialView(asked: string | null, beyond: boolean): ItemView {
  if (asked === STEPS || asked === SUMMARY) return asked;
  return beyond ? STEPS : SUMMARY;
}

export function heroState(facts: ItemFacts): ItemHeroState {
  const { state } = facts;
  if (facts.collectible) return { kind: "none" };
  if (state.kind === "done") return { kind: "mastered", label: MAP.mastered };
  if (state.kind === "ranked") return { kind: "rank", label: MAP.rank(state.rank, state.max) };
  if (state.kind === "absent") return { kind: facts.prime ? "prime" : "absent" };
  return { kind: "none" };
}

function rowOf(facts: ItemFacts, line: BriefLine, from: string, blueprint: boolean): ItemRowView {
  const own = line.thing === null ? undefined : facts.lines[line.thing];
  const words = own ? tileLines(own.reading, own.where) : tileLines(line.reading, line.where);
  const art = line.imageUrl ?? (facts.collectible && !blueprint ? facts.art : null);
  return {
    key: line.id,
    name: titled(line.title),
    reading: words.reading,
    place: words.place,
    art,
    ...(blueprint && { blueprint: facts.blueprint }),
    ...(blueprint
      ? { href: itemRoute(facts.name, from, STEPS, line.id) }
      : line.thing !== null && { href: itemRoute(line.thing, from) }),
  };
}

function sectionsOf(facts: ItemFacts, from: string): ItemSectionView[] {
  return facts.blocks.map((block) => ({
    id: block.id,
    title: titled(block.title),
    rows: block.lines.map((line) => rowOf(facts, line, from, block.id === "blueprints")),
  }));
}

export function itemPage(
  facts: ItemFacts,
  from: string | null,
  asked: string | null,
): ItemPageView {
  const tab = openedFrom(from);
  const origin = from ?? "";
  const kicker = facts.group ? ITEM.kicker[facts.group] : "";
  const state = facts.state.kind;
  return {
    title: facts.group ? MAP.groups[facts.group].name : facts.name,
    back: tabHome(tab),
    tab,
    kicker,
    name: facts.name,
    art: facts.art,
    hero: heroState(facts),
    owned: !facts.collectible && (state === "done" || state === "ranked"),
    crumb: facts.place && {
      href: placeRoute(facts.place.system, facts.place.place),
      place: MAP.crumb(facts.place.systemName, facts.place.place),
      orb: facts.place.orb,
    },
    view: initialView(asked, facts.beyond),
    hrefs: {
      summary: itemRoute(facts.name, origin, SUMMARY),
      steps: itemRoute(facts.name, origin, STEPS),
    },
    sections: sectionsOf(facts, origin),
  };
}
