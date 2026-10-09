import { LETTERS } from "./letters";
import { Quill } from "./Quill";
import styles from "./Wordmark.module.css";

export type WordmarkSize = "splash" | "header" | "sheet";

export function Wordmark({ size, label }: { size: WordmarkSize; label: string }) {
  return (
    <svg className={styles[size]} viewBox="0 0 275.333 80" role="img" aria-label={label}>
      <Quill x="0" y="0" width="53.333" height="80" />
      <g className={styles.letters}>
        {LETTERS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
