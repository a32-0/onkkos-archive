export const ZOOM_LEVELS = [100, 115, 130] as const;

export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export type ZoomStep = "in" | "out" | "reset";

export interface ZoomKey {
  type: string;
  key: string;
  code: string;
  control: boolean;
  alt: boolean;
  meta: boolean;
}

const BASE: ZoomLevel = 100;

export function isZoomLevel(value: unknown): value is ZoomLevel {
  return ZOOM_LEVELS.some((level) => level === value);
}

export function zoomFrom(value: string | undefined): ZoomLevel {
  const level = Number(value);
  return isZoomLevel(level) ? level : BASE;
}

export function stepZoom(level: ZoomLevel, step: ZoomStep): ZoomLevel {
  if (step === "reset") return BASE;
  const index = ZOOM_LEVELS.indexOf(level) + (step === "in" ? 1 : -1);
  return ZOOM_LEVELS[Math.min(Math.max(index, 0), ZOOM_LEVELS.length - 1)] ?? BASE;
}

export function zoomStepOf(input: ZoomKey): ZoomStep | null {
  if (input.type !== "keyDown" || !input.control || input.alt || input.meta) return null;
  if (input.key === "+" || input.key === "=" || input.code === "NumpadAdd") return "in";
  if (input.key === "-" || input.code === "NumpadSubtract") return "out";
  if (input.key === "0" || input.code === "Numpad0") return "reset";
  return null;
}

export function widthAt(level: ZoomLevel, width: number): number {
  return Math.ceil((width * level) / BASE);
}

export function isZoomMessage(message: unknown): message is { kind: "zoom"; level: ZoomLevel } {
  const told = message as { kind?: unknown; level?: unknown } | null;
  return told?.kind === "zoom" && isZoomLevel(told.level);
}
