import type { ReactNode } from "react";

import styles from "./SearchCard.module.css";

export function SearchCard({
  title,
  line,
  children,
}: {
  title: string;
  line: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.line}>{line}</p>
      {children}
    </section>
  );
}
