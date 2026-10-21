import type { ReactNode } from "react";

import styles from "./ControlRow.module.css";

export function ControlRow({
  label,
  fill = false,
  children,
}: {
  label: string;
  fill?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={fill ? styles.fill : styles.control}>{children}</span>
    </div>
  );
}
