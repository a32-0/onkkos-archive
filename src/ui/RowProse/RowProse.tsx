import type { ReactNode } from "react";

import styles from "./RowProse.module.css";

export function RowProse({
  paragraphs,
  link,
}: {
  paragraphs: readonly string[];
  link?: ReactNode;
}) {
  return (
    <div className={styles.prose}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={styles.paragraph}>
          {paragraph}
          {link && index === paragraphs.length - 1 && <> {link}</>}
        </p>
      ))}
    </div>
  );
}
