import { readFileSync, writeFileSync } from "node:fs";

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Limits {
  width: number;
  widest: number;
  height: number;
  lowest: number;
}

type Place = Pick<Area, "x" | "y">;

export type Bounds = Pick<Area, "width" | "height"> & Partial<Place>;

const TITLE_BAR_MIDDLE = 16;

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function within(value: unknown, low: number, high: number, fallback: number): number {
  return isNumber(value) ? Math.round(Math.min(Math.max(value, low), high)) : fallback;
}

function areaUnderTitleBar(place: Place, width: number, areas: readonly Area[]): Area | undefined {
  const middle = place.x + width / 2;
  const bar = place.y + TITLE_BAR_MIDDLE;
  return areas.find(
    (area) =>
      middle >= area.x &&
      middle < area.x + area.width &&
      bar >= area.y &&
      bar < area.y + area.height,
  );
}

export function fitBounds(
  saved: unknown,
  limits: Limits,
  areas: readonly Area[],
  primary: Area,
): Bounds {
  const given = (saved ?? {}) as Partial<Bounds>;
  const width = within(given.width, limits.width, limits.widest, limits.width);
  const place =
    isNumber(given.x) && isNumber(given.y)
      ? { x: Math.round(given.x), y: Math.round(given.y) }
      : null;
  const area = place ? areaUnderTitleBar(place, width, areas) : undefined;
  const tallest = Math.max(limits.lowest, (area ?? primary).height);
  const opening = Math.min(limits.height, tallest);
  const height = within(given.height, limits.lowest, tallest, opening);
  return place && area ? { width, height, ...place } : { width, height };
}

export function readBounds(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function writeBounds(file: string, bounds: Bounds): void {
  try {
    writeFileSync(file, JSON.stringify(bounds));
  } catch (error) {
    console.warn(
      `The window's size and place were not kept: ${error instanceof Error ? error.message : error}`,
    );
  }
}
