import { Badge } from "../Badge/Badge";
import { Icon } from "../Icon/Icon";
import { Orb } from "../Orb/Orb";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import styles from "./PlaceCard.module.css";

export type PlaceCardCount = { count: string; label: string };

export function PlaceCard({
  system,
  name,
  orb,
  onOpen,
  items,
  mastered,
  progress,
}: {
  system: string;
  name: string;
  orb: string | null;
  onOpen: () => void;
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
      <Orb color={orb} size="l" />
      <div className={mastered ? styles.done : styles.state}>
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
