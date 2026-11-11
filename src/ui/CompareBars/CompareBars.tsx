import styles from "./CompareBars.module.css";

export interface CompareBar {
  label: string;
  value: string;
  share: number;
}

function width(share: number): string {
  return `${Math.round(Math.min(1, Math.max(0, share)) * 100)}%`;
}

export function CompareBars({ before, after }: { before: CompareBar; after: CompareBar }) {
  return (
    <dl className={styles.bars}>
      {[
        { bar: before, tone: styles.before },
        { bar: after, tone: styles.after },
      ].map(({ bar, tone }) => (
        <div key={bar.label} className={`${styles.row} ${tone}`}>
          <dt className={styles.label}>{bar.label}</dt>
          <dd className={styles.track}>
            <span className={styles.fill} style={{ width: width(bar.share) }} />
          </dd>
          <dd className={styles.value}>{bar.value}</dd>
        </div>
      ))}
    </dl>
  );
}
