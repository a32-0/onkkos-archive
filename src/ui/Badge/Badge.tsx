import styles from "./Badge.module.css";

export type BadgeKind = "newest" | "start-here" | "new" | "mastered" | "rank";

export function Badge({ kind, label }: { kind: BadgeKind; label: string }) {
  return <span className={styles[kind]}>{label}</span>;
}
