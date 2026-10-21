import type { CATALOGUES } from "@/content/goals";
import type { ReachGap } from "@/domain/place/reach";
import type { IconName } from "@/ui/Icon/glyphs";
import type { Suggestion } from "@/ui/SuggestionList/SuggestionList";

export type GoalKind = "planet" | "necramech" | "quest";

export interface GoalInput {
  id: string;
  kind: GoalKind;
  href: string;
  junction: { from: string; to: string } | null;
}

export interface GoalCardView {
  id: string;
  href: string;
  icon: IconName;
  title: string;
  line: string;
}

export interface SearchInput {
  kind: "item" | "collectible" | "place" | "quest";
  name: string;
  catalogue: keyof typeof CATALOGUES;
  art: string | null;
  system: string | null;
  gap: ReachGap | null;
}

export type SearchRow = Suggestion & { href: string };
