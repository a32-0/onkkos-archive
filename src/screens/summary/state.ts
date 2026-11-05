import type { BeyondWords } from "@/content/reach";
import type { IconName } from "@/ui/Icon/glyphs";
import type { FeaturedCardKind } from "@/ui/FeaturedCard/FeaturedCard";

interface SummaryTile {
  name: string;
  href: string;
  art: string | null;
  reading: string;
  place: string;
  mastered: boolean;
}

export type SummaryLens = "left" | "mastered";

export interface SummaryGroup {
  id: string;
  key: string;
  name: string;
  icon: string | null;
  symbol?: IconName;
  count: string;
  tiles: SummaryTile[];
  more: BeyondWords | null;
  lenses: boolean;
  empty: Record<SummaryLens, { title: string; line: string }>;
}

export interface SummarySection {
  id: "arsenal" | "collection";
  label: string;
  groups: SummaryGroup[];
}

export interface SummaryCardView {
  kind: FeaturedCardKind;
  eyebrow: string;
  name: string;
  meta: string;
  art: string | null;
}

export interface SummaryUpdate {
  version: string;
  versions: readonly string[];
  dates: readonly string[];
  value: string;
  name: string;
  meta: string;
  art: string | null;
  newest: boolean;
  selected: boolean;
}

export type SummaryAction = (form: FormData) => Promise<void>;
