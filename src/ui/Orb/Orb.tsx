import type { CSSProperties } from "react";

import styles from "./Orb.module.css";

export type OrbSize = "xs" | "s" | "m" | "l";

export function Orb({ color, size }: { color: string | null; size: OrbSize }) {
  return (
    <span
      className={styles[size]}
      style={color ? ({ "--orb-color": color } as CSSProperties) : undefined}
      aria-hidden
    />
  );
}
