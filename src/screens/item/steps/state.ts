import type { Phrase, StepRow, StepSection } from "@/domain/catalog/checks";
import type { ReachGap } from "@/domain/place/reach";

export interface ProseRow extends Omit<StepRow, "prose"> {
  prose: string[] | null;
  wikiUrl: string | null;
}

export interface ProseSection extends Omit<StepSection, "groups"> {
  groups: { title: Phrase | null; rows: ProseRow[] }[];
}

export interface StepsFacts {
  sections: ProseSection[];
  lock: { row: string; gap: ReachGap } | null;
}

export interface StepLinkView {
  href: string;
  label: string;
  target: "wiki" | "page";
}

export interface StepRowView {
  id: string;
  anchor: string | null;
  title: string;
  art?: string | null;
  alternative: boolean;
  best: boolean;
  locked: boolean;
  detail: string | null;
  prose: string[] | null;
  link: StepLinkView | null;
}

interface StepGroupView {
  key: string;
  rows: StepRowView[];
}

export interface StepCardView {
  key: string;
  anchor: string | null;
  header: { title: string; art: string | null } | null;
  checkable: boolean;
  groups: StepGroupView[];
}

export interface StepBlockView {
  key: string;
  title: string;
  cards: StepCardView[];
}

export interface StepsView {
  scope: string;
  blocks: StepBlockView[];
}
