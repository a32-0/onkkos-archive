import type { Lens, MapGroupView, MapSectionView, MapTileView } from "./state";

const LENSES: readonly Lens[] = ["left", "mastered", "new"];

export interface ShownGroup {
  group: MapGroupView;
  tiles: MapTileView[];
  more: string | null;
}

export function shownUnder(tile: MapTileView, lens: Lens): boolean {
  if (lens === "mastered") return tile.mastered;
  if (lens === "new") return tile.fresh && !tile.beyond;
  return tile.left && !tile.beyond;
}

export function shownGroups(
  sections: readonly MapSectionView[],
  lens: Lens,
): { section: MapSectionView; groups: ShownGroup[] }[] {
  return sections.flatMap((section) => {
    const groups = section.groups.flatMap((group) => {
      const tiles = group.tiles.filter((tile) => shownUnder(tile, lens));
      const more = lens === "mastered" ? null : lens === "new" ? group.more.fresh : group.more.left;
      return tiles.length > 0 || more ? [{ group, tiles, more }] : [];
    });
    return groups.length > 0 ? [{ section, groups }] : [];
  });
}

export function nextLens(current: Lens, chosen: string): Lens {
  return LENSES.find((lens) => lens === chosen) ?? current;
}
