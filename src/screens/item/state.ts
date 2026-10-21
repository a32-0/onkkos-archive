import type { Part } from "@/domain/catalog/checks";
import type { BriefBlock } from "@/domain/catalog/summary";
import type { Group } from "@/domain/place/catalog";
import type { ItemState } from "@/domain/place/state";
import type { ItemView } from "@/routes";
import type { ItemHeroState } from "@/ui/ItemHero/ItemHero";

import type { ShellTab } from "../shell/tabs";
import type { StepsFacts, StepsView } from "./steps/state";

export interface ItemPlace {
  system: string;
  systemName: string;
  place: string;
  orb: string | null;
}

export interface ItemFacts {
  name: string;
  group: Group | null;
  collectible: boolean;
  quest: boolean;
  art: string | null;
  blueprint: string;
  prime: boolean;
  state: ItemState;
  blocks: BriefBlock[];
  lines: Readonly<Record<string, { reading: Part[]; where: Part[] }>>;
  place: ItemPlace | null;
  beyond: boolean;
  steps: StepsFacts;
}

export interface ItemRowView {
  key: string;
  name: string;
  reading: string;
  place: string;
  art: string | null;
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
}
