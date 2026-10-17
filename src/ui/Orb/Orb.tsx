import type { CSSProperties } from "react";

import styles from "./Orb.module.css";

export type OrbSize = "xs" | "s" | "m" | "l";

export interface OrbNodes {
  seed: string;
  total: number;
  lit: number;
}

const BOX = 120;
const SPREAD = 42;
const DOT = 3.5;

function random(seed: string): () => number {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => {
    state = Math.imul(state ^ (state >>> 15), 2246822507);
    state = Math.imul(state ^ (state >>> 13), 3266489909);
    state ^= state >>> 16;
    return (state >>> 0) / 4294967296;
  };
}

function constellation(seed: string, total: number): { x: number; y: number }[] {
  const next = random(seed);
  const center = BOX / 2;
  return Array.from({ length: total }, (_, index) => {
    const angle = (index / total) * Math.PI * 2 + next() * 1.2;
    const reach = SPREAD * (0.35 + next() * 0.65);
    return { x: center + Math.cos(angle) * reach, y: center + Math.sin(angle) * reach };
  });
}

export function Orb({
  color,
  size,
  nodes,
}: {
  color: string | null;
  size: OrbSize;
  nodes?: OrbNodes;
}) {
  const points = nodes && nodes.total > 0 ? constellation(nodes.seed, nodes.total) : [];
  return (
    <span
      className={styles[size]}
      style={color ? ({ "--orb-color": color } as CSSProperties) : undefined}
      aria-hidden
    >
      {points.length > 0 && (
        <svg className={styles.nodes} viewBox={`0 0 ${BOX} ${BOX}`}>
          <polyline className={styles.line} points={points.map((p) => `${p.x},${p.y}`).join(" ")} />
          {points.map((point, index) => (
            <circle
              key={index}
              className={index < (nodes?.lit ?? 0) ? styles.lit : styles.dim}
              cx={point.x}
              cy={point.y}
              r={DOT}
            />
          ))}
        </svg>
      )}
    </span>
  );
}
