import { Children, type ReactNode } from "react";

import styles from "./Rail.module.css";

export function Rail({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <ul id={id} aria-label={label} className={styles.rail}>
      {Children.map(children, (child) => (
        <li className={styles.cell}>{child}</li>
      ))}
    </ul>
  );
}
