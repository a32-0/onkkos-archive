import type { Part } from "@/domain/catalog/checks";
import type { ModEffect, Rarity } from "@/domain/catalog/mod-effects";
import type { BriefBlock } from "@/domain/catalog/summary";
import type { Group } from "@/domain/place/catalog";
import type { ItemState } from "@/domain/place/state";
import type { ItemView } from "@/routes";
import type { BuiltIntoChip } from "@/ui/BuiltInto/BuiltInto";
import type { IconName } from "@/ui/Icon/glyphs";
import type { ItemHeroState } from "@/ui/ItemHero/ItemHero";
import type { ModEffectExample } from "@/ui/ModEffect/ModEffect";

import type { ShellTab } from "../shell/tabs";
import type { StepsFacts, StepsView } from "./steps/state";

export interface ItemPlace {
  system: string;
  systemName: string;
  place: string;
  orb: string | null;
}

export interface BuiltIntoFact {
  name: string;
  count: number;
  icon: string | null;
  done: boolean;
}

export interface ModFactsView {
  rarity: Rarity | null;
  category: string | null;
  effects: ModEffect[];
}

export interface ModPageView {
  overview: {
    art: string | null;
    name: string;
    rarity: Rarity | null;
  };
  title: string;
  effects: (Omit<ModEffect, "icon" | "example" | "pairs"> & {
    icon: IconName;
    example: ModEffectExample | null;
    pairs: { label: string; combos: { meets: string; makes: string }[] } | null;
  })[];
}

export interface ItemFacts {
  name: string;
  group: Group | null;
  collectible: boolean;
  quest: boolean;
  mode: boolean;
  art: string | null;
  blueprint: string;
  prime: boolean;
  state: ItemState;
  blocks: BriefBlock[];
  lines: Readonly<Record<string, { reading: Part[]; where: Part[] }>>;
  place: ItemPlace | null;
  orbs: Readonly<Record<string, string>>;
  beyond: boolean;
  steps: StepsFacts;
  builtInto: BuiltIntoFact[];
  mod: ModFactsView | null;
}

export interface ItemRowView {
  key: string;
  name: string;
  reading: string;
  place: string;
  art: string | null;
  orb: string | null;
  blueprint?: string | null;
  href?: string;
}

export interface ItemSectionView {
  id: string;
  title: string;
  rows: ItemRowView[];
}

export interface ItemPageView {
  title: string;
  back: string;
  tab: ShellTab | null;
  kicker: string;
  name: string;
  art: string | null;
  hero: ItemHeroState;
  owned: boolean;
  crumb: { href: string; place: string; orb: string | null } | null;
  view: ItemView;
  hrefs: Record<ItemView, string>;
  sections: ItemSectionView[];
  steps: StepsView;
  builtInto: BuiltIntoChip[];
  mod: ModPageView | null;
}
