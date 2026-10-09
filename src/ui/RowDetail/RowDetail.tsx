import type { ReactNode } from "react";

import styles from "./RowDetail.module.css";

export function RowDetail({ text, link }: { text: string; link?: ReactNode }) {
  return (
    <p className={styles.detail}>
      {text}
      {link && <> {link}</>}
    </p>
  );
}
