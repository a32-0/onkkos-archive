import { readFileSync, writeFileSync } from "node:fs";

export interface Size {
  width: number;
  height: number;
}

export interface Limits {
  width: number;
  widest: number;
  height: number;
  lowest: number;
}

function within(value: unknown, low: number, high: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(Math.min(Math.max(value, low), high))
    : fallback;
}

export function fitSize(saved: unknown, limits: Limits, screenHeight: number): Size {
  const tallest = Math.max(limits.lowest, screenHeight);
  const opening = Math.min(limits.height, tallest);
  const given = (saved ?? {}) as Partial<Size>;
  return {
    width: within(given.width, limits.width, limits.widest, limits.width),
    height: within(given.height, limits.lowest, tallest, opening),
  };
}

export function readSize(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function writeSize(file: string, size: Size): void {
  try {
    writeFileSync(file, JSON.stringify(size));
  } catch (error) {
    console.warn(
      `The window's size was not kept: ${error instanceof Error ? error.message : error}`,
    );
  }
}
