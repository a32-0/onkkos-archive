import type { IconName } from "@/ui/Icon/glyphs";
import type { RankOverviewChip } from "@/ui/RankOverview/RankOverview";

import type { StepsView } from "../item/steps/state";

export interface RankOverviewView {
  art: string | null;
  share: number;
  highest: boolean;
  figure: string;
  label: string;
  progressLabel: string;
  left?: { caption: string; chips: RankOverviewChip[] };
  empty?: { icon: IconName; title: string; line: string };
}

export interface RankCardView {
  seal: string;
  title: string;
  line: string;
  href: string;
}

export interface RankPageView {
  kicker: string;
  name: string;
  overview: RankOverviewView;
  steps: StepsView;
}
