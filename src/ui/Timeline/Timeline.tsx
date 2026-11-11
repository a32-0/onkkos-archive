import type { ReactNode } from "react";

import styles from "./Timeline.module.css";

export type TimelineStep = {
  id: string;
  alternative?: boolean;
  best?: boolean;
  locked?: boolean;
  done?: boolean;
  content: ReactNode;
};

export function Timeline({ steps }: { steps: readonly TimelineStep[] }) {
  return (
    <ol className={styles.timeline}>
      {steps.map((step) => (
        <li key={step.id} className={step.alternative ? styles.alternative : styles.step}>
          <span className={step.locked ? styles.locked : styles.rail} aria-hidden>
            {!step.alternative && (
              <span className={styles.marker}>
                <span
                  className={step.done ? styles.met : step.best ? styles.best : styles.diamond}
                />
              </span>
            )}
            {!step.done && <span className={styles.line} />}
          </span>
          <div className={styles.content}>{step.content}</div>
        </li>
      ))}
    </ol>
  );
}
