import type { ReactNode } from "react";

import styles from "./ControlRow.module.css";

export function ControlRow({
  label,
  action = false,
  children,
}: {
  label: string;
  action?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={action ? styles.action : styles.control}>{children}</span>
    </div>
  );
}
