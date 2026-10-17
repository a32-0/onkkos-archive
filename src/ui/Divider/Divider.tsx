import styles from "./Divider.module.css";

export function Divider({ label, flush = false }: { label: string; flush?: boolean }) {
  return (
    <h2 className={flush ? styles.flush : styles.divider}>
      <span className={styles.label}>{label}</span>
      <span className={styles.line} aria-hidden />
    </h2>
  );
}
