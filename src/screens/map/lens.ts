import type { Lens, MapTileView } from "./state";

export function shownUnder(tile: MapTileView, lens: Lens | null): boolean {
  if (lens === "mastered") return tile.mastered;
  if (lens === "new") return tile.fresh && !tile.beyond;
  return tile.left && !tile.beyond;
}

export function nextLens(current: Lens | null, chosen: string): Lens | null {
  if (chosen === current) return null;
  return chosen === "mastered" || chosen === "new" ? chosen : current;
}
