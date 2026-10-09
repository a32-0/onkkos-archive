import type { ReactNode } from "react";

import styles from "./PlayerMenu.module.css";

export type ReadCyclePart = { text: string; strong?: boolean };

export function PlayerMenu({
  name,
  rank,
  rankTitle,
  disconnect,
  readCycle,
}: {
  name: string;
  rank: string;
  rankTitle: string;
  disconnect: ReactNode;
  readCycle: readonly ReadCyclePart[];
}) {
  return (
    <div className={styles.menu}>
      <div className={styles.player}>
        <span className={styles.avatar} aria-hidden />
        <p className={styles.name}>{name}</p>
        <p className={styles.rank}>{rank}</p>
        <p className={styles.title}>{rankTitle}</p>
      </div>
      <div className={styles.foot}>
        {disconnect}
        <p className={styles.cycle}>
          {readCycle.map((part, index) => (
            <span key={index} className={part.strong ? styles.strong : undefined}>
              {part.text}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
