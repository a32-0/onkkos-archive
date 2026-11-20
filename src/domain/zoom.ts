export const ZOOM_LEVELS = [100, 115, 130] as const;

export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export const ZOOM_COOKIE = "wf_zoom";

const BASE: ZoomLevel = 100;

function isZoomLevel(value: unknown): value is ZoomLevel {
  return ZOOM_LEVELS.some((level) => level === value);
}

export function zoomFrom(value: unknown): ZoomLevel {
  const level = Number(value);
  return isZoomLevel(level) ? level : BASE;
}
