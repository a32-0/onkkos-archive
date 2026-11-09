import { CATALOGUES, GAPS, GOALS } from "@/content/goals";
import type { ReachGap } from "@/domain/place/reach";
import { itemRoute, placeRoute, ROUTES } from "@/routes";
import type { IconName } from "@/ui/Icon/glyphs";

import type {
  GoalCardView,
  GoalInput,
  GoalKind,
  MilestoneRowView,
  SearchInput,
  SearchRow,
} from "./state";

const FROM = "goal";
const SHOWN = 8;

const ICONS: Readonly<Record<string, IconName>> = {
  unlock_next_planet: "flag",
  build_necramech: "precision-manufacturing",
  build_helminth: "biotech",
  unlock_1999: "auto-stories",
  play_new_war: "swords",
  play_jade_shadows: "dark-mode",
  hunt_archon: "diamond",
  unlock_steel_path: "skull",
  play_constellations: "auto-awesome",
  hunt_kuva_lich: "target",
};

const KIND_ICONS: Readonly<Record<GoalKind, IconName>> = {
  planet: "flag",
  necramech: "precision-manufacturing",
  quest: "auto-stories",
  item: "biotech",
  lich: "target",
  "steel-path": "skull",
};

function cardWords(goal: GoalInput): { title: string; line: string } | null {
  if (goal.id === "unlock_next_planet") {
    const card = GOALS.cards.unlock_next_planet;
    return goal.junction
      ? { title: card.title, line: card.line(goal.junction.from, goal.junction.to) }
      : null;
  }
  if (goal.id in GOALS.cards && goal.id !== "unlock_next_planet") {
    return GOALS.cards[goal.id as Exclude<keyof typeof GOALS.cards, "unlock_next_planet">];
  }
  return null;
}

function iconOf(goal: GoalInput): IconName {
  return ICONS[goal.id] ?? KIND_ICONS[goal.kind];
}

export function goalCards(goals: readonly GoalInput[]): GoalCardView[] {
  return goals.flatMap((goal) => {
    const words = cardWords(goal);
    return words ? [{ id: goal.id, href: goal.href, icon: iconOf(goal), ...words }] : [];
  });
}

export function milestoneRows(done: readonly GoalInput[]): MilestoneRowView[] {
  return done.flatMap((goal) => {
    if (goal.id === "unlock_next_planet") {
      const card = GOALS.cards.unlock_next_planet;
      return [
        {
          id: goal.id,
          href: goal.href,
          icon: iconOf(goal),
          title: card.title,
          line: GOALS.milestones.planetDone,
        },
      ];
    }
    const words = cardWords(goal);
    return words ? [{ id: goal.id, href: goal.href, icon: iconOf(goal), ...words }] : [];
  });
}

function gapWords(gap: ReachGap): string {
  if (gap.kind === "rank") return GAPS.rank(gap.need, gap.have);
  if (gap.kind === "junction") return GAPS.junction(gap.from, gap.to);
  return GAPS.clan;
}

function hrefOf(hit: SearchInput): string {
  if (hit.kind === "place") return hit.system ? placeRoute(hit.system, hit.name) : ROUTES.system;
  return itemRoute(hit.name, FROM, hit.gap ? "steps" : undefined);
}

export function orderedInputs(hits: readonly SearchInput[]): SearchInput[] {
  return [...hits].sort((a, b) => b.score - a.score || Number(!!a.gap) - Number(!!b.gap));
}

export function suggestionRows(hits: readonly SearchInput[]): SearchRow[] {
  return searchRows(orderedInputs(hits).slice(0, SHOWN));
}

export function searchRows(hits: readonly SearchInput[]): SearchRow[] {
  return hits.map((hit) => {
    const catalogue = CATALOGUES[hit.catalogue];
    return {
      value: `${hit.kind}:${hit.name}`,
      name: hit.name,
      catalogue: hit.gap ? GAPS.join(catalogue, gapWords(hit.gap)) : catalogue,
      art: hit.art,
      ...(hit.kind === "place" && { round: true, orb: hit.orb ?? null }),
      href: hrefOf(hit),
    };
  });
}
