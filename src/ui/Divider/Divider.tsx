import styles from "./Divider.module.css";

export function Divider({ label }: { label?: string }) {
  if (label === undefined) return <hr className={styles.rule} />;
  return (
    <h2 className={styles.divider}>
      <span className={styles.label}>{label}</span>
      <span className={styles.line} aria-hidden />
    </h2>
  );
}
