import type { IconName } from "@/ui/Icon/glyphs";
import type { FeaturedCardKind } from "@/ui/FeaturedCard/FeaturedCard";

interface SummaryTile {
  name: string;
  href: string;
  art: string | null;
  reading: string;
  place: string;
}

export interface SummaryGroup {
  id: string;
  key: string;
  name: string;
  icon: string | null;
  symbol?: IconName;
  count: string;
  tiles: SummaryTile[];
  more: string | null;
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
  value: string;
  name: string;
  meta: string;
  art: string | null;
}

export type SummaryAction = (form: FormData) => Promise<void>;
