import styles from "./ElementCombo.module.css";

export function ElementCombo({ meets, makes }: { meets: string; makes: string }) {
  return (
    <span className={styles.combo}>
      <span className={styles.meets}>{meets}</span>
      <span className={styles.arrow} aria-label="makes">
        →
      </span>
      <span className={styles.makes}>{makes}</span>
    </span>
  );
}
