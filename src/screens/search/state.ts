import type { ADVANCED } from "@/content/search";

import type { SearchRow, Standing } from "../goals/state";

export type TypeGroup = keyof typeof ADVANCED.types;

export interface SearchFilters {
  term: string;
  types: TypeGroup[];
  state: Standing | null;
  reach: boolean;
  vaulted: boolean;
  shown: number;
}

export interface SearchPageView {
  rows: SearchRow[];
  total: number;
  more: boolean;
}
