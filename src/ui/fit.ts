import type { CSSProperties } from "react";

export function fit(text: string): CSSProperties {
  return { "--chars": Math.max(text.length, 1) } as CSSProperties;
}
