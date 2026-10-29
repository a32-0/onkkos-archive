import { Quill } from "../Wordmark/Quill";
import styles from "./LoadingCard.module.css";

const STROKE = "M0 4 C20 0 40 8 60 4 C70 2 80 6 88 4";

export function LoadingCard({ line }: { line: string }) {
  return (
    <div className={styles.overlay} role="status">
      <div className={styles.card}>
        <span className={styles.stage} aria-hidden>
          <span className={styles.pen}>
            <Quill className={styles.quill} />
          </span>
          <svg
            className={styles.stroke}
            viewBox="0 0 88 8"
            preserveAspectRatio="none"
            focusable="false"
          >
            <path d={STROKE} pathLength={1} />
          </svg>
        </span>
        <p className={styles.line}>{line}</p>
      </div>
    </div>
  );
}
