import styles from "./ProgressBar.module.css";

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const share = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      data-mastered={share === 1 || undefined}
    >
      <span className={styles.fill} style={{ width: `${share * 100}%` }} />
    </div>
  );
}
