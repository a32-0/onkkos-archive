import type { IconName } from "@/ui/Icon/glyphs";
import type { PlaceOverviewKind } from "@/ui/PlaceOverview/PlaceOverview";
import type { RowCount } from "@/ui/PlaceRow/PlaceRow";

export type Lens = "left" | "mastered" | "new";

export interface MapTileView {
  name: string;
  href: string;
  art: string | null;
  reading: string;
  place: string;
  left: boolean;
  mastered: boolean;
  fresh: boolean;
  beyond: boolean;
}

export interface MapGroupView {
  id: string;
  key: string;
  lenses: boolean;
  mastered: boolean;
  name: string;
  icon: string | null;
  symbol?: IconName;
  tiles: MapTileView[];
  more: { left: string | null; fresh: string | null };
}

interface MapSectionView {
  id: string;
  label: string;
  groups: MapGroupView[];
}

interface PlaceOverviewView {
  orb: string | null;
  done: number;
  readable: number;
  count: string;
  label: string;
  progressLabel: string;
  left?: { caption: string; kinds: readonly PlaceOverviewKind[] };
}

export interface PlaceRowView {
  name: string;
  href: string;
  orb: string | null;
  count?: RowCount;
  mastered?: string;
  startHere?: string;
  isNew?: string;
  gap?: string;
  listed: boolean;
  onView: boolean;
}

export interface PlaceListSystem {
  id: string;
  name: string;
  orb: string | null;
  rows: PlaceRowView[];
  more: string | null;
}

export interface SystemRowView {
  id: string;
  name: string;
  orb: string | null;
  satellite: string | null;
  count?: RowCount;
  mastered?: string;
  startHere?: string;
  soon?: string;
  onView: boolean;
}

export interface MapView {
  place: string;
  systemName: string;
  overview: PlaceOverviewView;
  newLens: boolean;
  nothingLeft: { title: string; line: string } | null;
  empty: Record<Lens, { title: string; line: string }>;
  sections: MapSectionView[];
  system: string;
  places: PlaceListSystem[];
  systems: SystemRowView[];
  moreSystems: string | null;
}
