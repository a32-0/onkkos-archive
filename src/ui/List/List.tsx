import type { ReactNode } from "react";

import styles from "./List.module.css";

export function List({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <ul className={styles.list} aria-label={label}>
      {children}
    </ul>
  );
}

export function ListEntry({ children }: { children: ReactNode }) {
  return <li className={styles.entry}>{children}</li>;
}
