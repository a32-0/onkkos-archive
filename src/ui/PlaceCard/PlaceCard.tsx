import { Badge } from "../Badge/Badge";
import { Icon } from "../Icon/Icon";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import styles from "./PlaceCard.module.css";

export type PlaceCardCount = { count: string; label: string };

export function PlaceCard({
  system,
  name,
  art,
  onOpen,
  nodes,
  items,
  mastered,
  progress,
}: {
  system: string;
  name: string;
  art: string | null;
  onOpen: () => void;
  nodes?: { title: string; lines: readonly PlaceCardCount[] };
  items: PlaceCardCount & { word: string };
  mastered?: string;
  progress: { value: number; max: number; label: string };
}) {
  return (
    <section className={styles.card}>
      <button type="button" className={styles.head} aria-haspopup="dialog" onClick={onOpen}>
        <span className={styles.heading}>
          <span className={styles.system}>{system}</span>
          <span className={styles.name}>{name}</span>
        </span>
        <span className={styles.chevron}>
          <Icon name="chevron-backward" />
        </span>
      </button>
      {art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.art} />}
      <div className={mastered ? styles.done : styles.state}>
        {nodes && (
          <>
            <p className={styles.title}>{nodes.title}</p>
            <p className={styles.nodes}>
              {nodes.lines.map((line) => (
                <span key={line.label}>
                  <b className={styles.count}>{line.count}</b> {line.label}
                </span>
              ))}
            </p>
          </>
        )}
        <p className={styles.items}>
          <span>
            <b className={styles.count}>{items.count}</b> {items.label}{" "}
            <span className={styles.word}>{items.word}</span>
          </span>
          {mastered && <Badge kind="mastered" label={mastered} />}
        </p>
        <ProgressBar {...progress} />
      </div>
    </section>
  );
}
