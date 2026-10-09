import { Quill } from "../Wordmark/Quill";
import styles from "./LoadingCard.module.css";

export function LoadingCard({ line }: { line: string }) {
  return (
    <div className={styles.card} role="status">
      <Quill className={styles.quill} />
      <p className={styles.line}>{line}</p>
    </div>
  );
}
