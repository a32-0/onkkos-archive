import type { Lens, MapGroupView, MapTileView } from "./state";

const LENSES: readonly Lens[] = ["left", "mastered", "new"];

export function shownUnder(tile: MapTileView, lens: Lens): boolean {
  if (lens === "mastered") return tile.mastered;
  if (lens === "new") return tile.fresh && !tile.beyond;
  return tile.left && !tile.beyond;
}

export function shownIn(
  group: MapGroupView,
  lens: Lens,
): { tiles: MapTileView[]; more: string | null } {
  return {
    tiles: group.tiles.filter((tile) => shownUnder(tile, lens)),
    more: lens === "mastered" ? null : lens === "new" ? group.more.fresh : group.more.left,
  };
}

export function nextLens(current: Lens, chosen: string): Lens {
  return LENSES.find((lens) => lens === chosen) ?? current;
}
