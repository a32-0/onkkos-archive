import { Badge } from "../Badge/Badge";
import { GameIcon } from "../GameIcon/GameIcon";
import type { IconName } from "../Icon/glyphs";
import { Icon } from "../Icon/Icon";
import { Orb } from "../Orb/Orb";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import styles from "./PlaceCard.module.css";

export type PlaceCardCount = { count: string; label: string };

export type PlaceCardKind = { name: string; icon: string | null; symbol?: IconName; count: number };

export function PlaceCard({
  system,
  name,
  orb,
  onOpen,
  left,
  items,
  mastered,
  progress,
}: {
  system: string;
  name: string;
  orb: string | null;
  onOpen: () => void;
  left?: { title: string; kinds: readonly PlaceCardKind[] };
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
        {left && (
          <div className={styles.left}>
            <p className={styles.caption}>{left.title}</p>
            <ul className={styles.kinds}>
              {left.kinds.map((kind) => (
                <li key={kind.name} className={styles.kind}>
                  <span className={styles.symbol} role="img" aria-label={kind.name}>
                    {kind.icon ? (
                      <GameIcon url={kind.icon} />
                    ) : (
                      kind.symbol && <Icon name={kind.symbol} size={20} />
                    )}
                  </span>
                  <b className={styles.count}>{kind.count}</b>
                </li>
              ))}
            </ul>
          </div>
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
