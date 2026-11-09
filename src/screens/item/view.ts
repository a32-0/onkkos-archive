import { STEPS as STEP_WORDS } from "@/content/checks";
import { ITEM } from "@/content/item";
import { MOD } from "@/content/mod";
import { MAP } from "@/content/system";
import type { BriefLine } from "@/domain/catalog/summary";
import { itemRoute, placeRoute, type ItemView } from "@/routes";
import type { BuiltIntoChip } from "@/ui/BuiltInto/BuiltInto";
import { GLYPHS, type IconName } from "@/ui/Icon/glyphs";
import type { ItemHeroState } from "@/ui/ItemHero/ItemHero";

import { openedFrom, tabHome } from "../shell/tabs";
import { stepsView } from "./steps/view";
import { detailOf, tileLines, titled } from "../summary/lines";
import type {
  ItemFacts,
  ItemPageView,
  ItemRowView,
  ItemSectionView,
  ModFactsView,
  ModPageView,
} from "./state";

const STEPS = "steps";
const SUMMARY = "summary";

export function initialView(asked: string | null, beyond: boolean): ItemView {
  if (asked === STEPS || asked === SUMMARY) return asked;
  return beyond ? STEPS : SUMMARY;
}

export function heroState(facts: ItemFacts): ItemHeroState {
  const { state } = facts;
  if (facts.collectible || facts.quest) return { kind: "none" };
  if (state.kind === "done") return { kind: "mastered", label: MAP.mastered };
  if (state.kind === "ranked") return { kind: "rank", label: MAP.rank(state.rank, state.max) };
  if (state.kind === "absent") return { kind: facts.prime ? "prime" : "absent" };
  return { kind: "none" };
}

function rowOf(facts: ItemFacts, line: BriefLine, from: string, blueprint: boolean): ItemRowView {
  const own = line.thing === null ? undefined : facts.lines[line.thing];
  const told = own ? tileLines(own.reading, own.where) : tileLines(line.reading, line.where);
  const words =
    told.reading || told.place ? told : { reading: "", place: detailOf(line.detail) ?? "" };
  const art = line.imageUrl ?? (blueprint ? null : facts.art);
  return {
    key: line.id,
    name: line.optional ? STEP_WORDS.optional(titled(line.title)) : titled(line.title),
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

export function builtIntoChips(facts: ItemFacts, from: string): BuiltIntoChip[] {
  if (facts.builtInto.every((recipe) => recipe.done)) return [];
  return facts.builtInto.map((recipe) => ({
    key: recipe.name,
    label: ITEM.builtIntoChip(recipe.name, recipe.count),
    icon: recipe.icon,
    state: recipe.done ? "done" : "default",
    href: itemRoute(recipe.name, from),
  }));
}

export function itemPage(
  facts: ItemFacts,
  from: string | null,
  asked: string | null,
): ItemPageView {
  const tab = openedFrom(from);
  const origin = from ?? "";
  const kicker = facts.quest ? ITEM.quest : facts.group ? ITEM.kicker[facts.group] : "";
  const state = facts.state.kind;
  return {
    title: facts.quest ? ITEM.quests : facts.group ? MAP.groups[facts.group].name : facts.name,
    back: tabHome(tab),
    tab,
    kicker,
    name: facts.name,
    art: facts.art,
    hero: heroState(facts),
    owned: !facts.collectible && !facts.quest && (state === "done" || state === "ranked"),
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
    steps: stepsView(facts.steps, facts.name, origin),
    builtInto: builtIntoChips(facts, origin),
    mod: facts.mod && modPage(facts.mod, facts),
  };
}

function modIcon(icon: string): IconName {
  return icon in GLYPHS ? (icon as IconName) : "extension";
}

function modPage(mod: ModFactsView, facts: Pick<ItemFacts, "art" | "name">): ModPageView {
  return {
    overview: {
      art: facts.art,
      name: facts.name,
      capacity: mod.capacity,
      polarity: mod.polarityArt,
      ranks: mod.ranks,
      rank: MOD.rank(mod.ranks),
      cost: MOD.cost(mod.capacity, mod.slot, mod.polarity),
    },
    title: MOD.whatItDoes,
    effects: mod.effects.map((effect) => ({
      ...effect,
      icon: modIcon(effect.icon),
      example: effect.example && {
        label: MOD.example,
        before: { label: MOD.without, ...effect.example.before },
        after: { label: MOD.withIt, ...effect.example.after },
        line: effect.example.line,
      },
      pairs:
        effect.pairs.length > 0
          ? {
              label: MOD.pairsWith,
              combos: effect.pairs.map((pair) => ({ meets: pair.with, makes: pair.makes })),
            }
          : null,
    })),
  };
}
