import type { ReactNode } from "react";

import styles from "./Timeline.module.css";

export type TimelineStep = { id: string; alternative?: boolean; content: ReactNode };

export function Timeline({ steps }: { steps: readonly TimelineStep[] }) {
  return (
    <ol className={styles.timeline}>
      {steps.map((step) => (
        <li key={step.id} className={styles.step}>
          <span className={styles.rail} aria-hidden>
            {!step.alternative && (
              <span className={styles.marker}>
                <span className={styles.diamond} />
              </span>
            )}
            <span className={styles.line} />
          </span>
          <div className={styles.content}>{step.content}</div>
        </li>
      ))}
    </ol>
  );
}
