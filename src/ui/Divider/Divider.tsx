import styles from "./Divider.module.css";

export function Divider({ label }: { label: string }) {
  return (
    <h2 className={styles.divider}>
      <span className={styles.label}>{label}</span>
      <span className={styles.line} aria-hidden />
    </h2>
  );
}
