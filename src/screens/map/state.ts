import type { IconName } from "@/ui/Icon/glyphs";
import type { ItemTileState } from "@/ui/ItemTile/ItemTile";
import type { PlaceCardCount } from "@/ui/PlaceCard/PlaceCard";
import type { RowCount } from "@/ui/PlaceRow/PlaceRow";

export type Lens = "left" | "mastered" | "new";

export interface MapTileView {
  name: string;
  href: string;
  art: string | null;
  reading: string;
  place: string;
  state?: ItemTileState;
  left: boolean;
  mastered: boolean;
  fresh: boolean;
  beyond: boolean;
}

export interface MapGroupView {
  id: string;
  name: string;
  icon: string | null;
  symbol?: IconName;
  count?: string;
  tiles: MapTileView[];
  more: { left: string | null; fresh: string | null };
}

export interface MapSectionView {
  id: string;
  label: string;
  groups: MapGroupView[];
}

interface PlaceCardView {
  system: string;
  name: string;
  orb: string | null;
  items: PlaceCardCount & { word: string };
  mastered?: string;
  progress: { value: number; max: number; label: string };
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
  card: PlaceCardView;
  newLens: boolean;
  nothingLeft: { title: string; line: string } | null;
  empty: Record<Lens, { title: string; line: string }>;
  sections: MapSectionView[];
  system: string;
  places: PlaceListSystem[];
  systems: SystemRowView[];
  moreSystems: string | null;
}
