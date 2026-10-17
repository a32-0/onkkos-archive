import type { ItemTileState } from "@/ui/ItemTile/ItemTile";
import type { PlaceCardCount } from "@/ui/PlaceCard/PlaceCard";
import type { RowCount } from "@/ui/PlaceRow/PlaceRow";

export type Lens = "mastered" | "new";

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
  art: string | null;
  nodes?: { title: string; lines: readonly PlaceCardCount[] };
  items: PlaceCardCount & { word: string };
  mastered?: string;
  progress: { value: number; max: number; label: string };
}

export interface PlaceRowView {
  name: string;
  href: string;
  art: string | null;
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
  art: string | null;
  rows: PlaceRowView[];
  more: string[];
}

export interface SystemRowView {
  id: string;
  name: string;
  art: string | null;
  satellite?: string;
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
  sections: MapSectionView[];
  system: string;
  places: PlaceListSystem[];
  systems: SystemRowView[];
  moreSystems: string | null;
}
