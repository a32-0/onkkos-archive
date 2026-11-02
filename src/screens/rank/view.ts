import { RANK } from "@/content/rank";
import { itemRoute } from "@/routes";
import type { CatalogItem } from "@/domain/catalog/items";
import type { RankItem, RankProgress } from "@/domain/profile/mastery-rank";
import type { RankOverviewChip } from "@/ui/RankOverview/RankOverview";

import type { StepRowView, StepsView } from "../item/steps/state";
import type { RankCardView, RankOverviewView } from "./state";

type Progress = Extract<RankProgress, { state: "progress" }>;

const GROUP_ICONS: Readonly<Record<CatalogItem["group"], string>> = {
  Warframes: "warframes",
  Primary: "primary",
  Secondary: "secondary",
  Melee: "melee",
  Archwing: "archwing",
  Companions: "companion",
};

const WEAPON_GROUPS: ReadonlySet<CatalogItem["group"]> = new Set(["Primary", "Secondary", "Melee"]);

export type IconMap = Readonly<Record<string, string>>;

export function groupIcon(icons: IconMap, item: CatalogItem): string | null {
  return icons[GROUP_ICONS[item.group]] ?? null;
}

function chipsOf(progress: Progress, icons: IconMap, from: string): RankOverviewChip[] {
  const chips: RankOverviewChip[] = progress.shown.map((one) => ({
    key: one.item.uniqueName,
    label: one.item.name,
    icon: groupIcon(icons, one.item),
    state: "default",
    href: itemRoute(one.item.name, from),
  }));
  if (progress.more > 0) {
    chips.push({
      key: "more",
      label: RANK.more(progress.more),
      icon: null,
      state: "more",
      name: RANK.moreName(progress.more),
    });
  }
  return chips;
}

export function rankOverview(
  progress: RankProgress,
  icons: IconMap,
  art: string | null,
  from: string,
): RankOverviewView {
  if (progress.state === "highest") {
    return {
      art,
      share: 1,
      highest: true,
      figure: RANK.percent(1),
      label: RANK.highest,
      progressLabel: RANK.highest,
      empty: { icon: "military-tech", title: RANK.everyRank.title, line: RANK.everyRank.line },
    };
  }
  const base = {
    art,
    share: progress.share,
    highest: false,
    figure: RANK.percent(progress.share),
    label: RANK.way(progress.next),
    progressLabel: RANK.progress(progress.next),
  };
  if (progress.full) {
    return {
      ...base,
      empty: {
        icon: "military-tech",
        title: RANK.testReady.title(progress.next),
        line: RANK.testReady.line,
      },
    };
  }
  if (progress.shown.length === 0) {
    return {
      ...base,
      empty: { icon: "military-tech", ...RANK.nothingToRank },
    };
  }
  return { ...base, left: { caption: RANK.toRank, chips: chipsOf(progress, icons, from) } };
}

export function rankCard(progress: RankProgress | null, href: string): RankCardView | null {
  if (progress === null || progress.state === "highest") return null;
  const seal = RANK.seal(progress.next);
  if (progress.full) {
    return { seal, title: RANK.card.test(progress.next), line: RANK.card.full, href };
  }
  return {
    seal,
    title: RANK.card.reach(progress.next),
    line:
      progress.covers && progress.shown.length > 0
        ? RANK.card.named(progress.shown.map((one) => one.item.name))
        : RANK.steps.newWeapon(progress.newWeapons),
    href,
  };
}

function row(id: string, title: string, detail: string): StepRowView {
  return {
    id,
    anchor: null,
    title,
    alternative: false,
    best: false,
    locked: false,
    detail,
    prose: null,
    link: null,
  };
}

function sharedMax(items: readonly RankItem[]): number | null {
  const maxes = new Set(items.map((one) => one.item.maxRank));
  const [max] = maxes;
  return maxes.size === 1 && max !== undefined ? max : null;
}

function shortestRows(progress: Progress): StepRowView[] {
  const weapons = progress.newWeapons;
  if (progress.shown.length === 0) {
    return [
      row(
        "rank-new",
        RANK.steps.rankNew,
        `${RANK.steps.allMaxed} ${RANK.steps.newWeapon(weapons)}`,
      ),
      row("rank-warframe", RANK.steps.orWarframe, RANK.steps.warframe(progress.newWarframes)),
    ];
  }
  const names = progress.shown.map((one) => one.item.name);
  const took = RANK.steps.took(progress.shown.map((one) => one.rank));
  return [
    row(
      "rank-these",
      RANK.steps.rankThese(names, sharedMax(progress.shown)),
      `${took} ${progress.covers ? RANK.steps.enough(progress.next) : RANK.steps.closer}`,
    ),
    row("rank-new", RANK.steps.orNewWeapons(weapons), RANK.steps.newWeapon(weapons)),
  ];
}

function unlockCounts(items: readonly CatalogItem[]) {
  return {
    warframes: items.filter((item) => item.group === "Warframes").length,
    weapons: items.filter((item) => WEAPON_GROUPS.has(item.group)).length,
    companions: items.filter((item) => item.group === "Companions").length,
    other: items.filter((item) => item.group === "Archwing").length,
  };
}

function block(key: string, title: string, rows: StepRowView[]) {
  return {
    key,
    title,
    cards: [{ key, anchor: null, header: null, checkable: false, groups: [{ key, rows }] }],
  };
}

export function rankSteps(progress: Progress): StepsView {
  const test = [row("rank-test", RANK.steps.takeTest(progress.next), RANK.steps.testLine)];
  if (progress.unlocks.length > 0) {
    test.push(
      row(
        "rank-unlocks",
        RANK.steps.unlocks(progress.next),
        RANK.steps.unlocked(unlockCounts(progress.unlocks)),
      ),
    );
  }
  return {
    scope: RANK.title,
    blocks: [
      ...(progress.full ? [] : [block("shortest", RANK.steps.shortest, shortestRows(progress))]),
      block("test", RANK.steps.test, test),
    ],
  };
}
