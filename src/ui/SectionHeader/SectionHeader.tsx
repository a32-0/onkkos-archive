import { GameIcon } from "../GameIcon/GameIcon";
import { Icon } from "../Icon/Icon";
import styles from "./SectionHeader.module.css";

export type SectionFold = { open: boolean; controls: string; onToggle: () => void };

export function SectionHeader({
  title,
  icon,
  art,
  fold,
}: {
  title: string;
  icon?: string | null;
  art?: string | null;
  fold?: SectionFold;
}) {
  const label = (
    <span className={styles.label}>
      {art !== undefined ? (
        art ? (
          <img className={styles.art} src={art} alt="" />
        ) : (
          <span className={styles.art} />
        )
      ) : (
        <GameIcon url={icon ?? null} />
      )}
      <span className={styles.title}>{title}</span>
    </span>
  );
  return (
    <h2 className={styles.header}>
      {fold ? (
        <button
          type="button"
          className={styles.fold}
          aria-expanded={fold.open}
          aria-controls={fold.open ? fold.controls : undefined}
          onClick={fold.onToggle}
        >
          {label}
          <span className={fold.open ? styles.up : styles.down}>
            <Icon name="chevron-backward" />
          </span>
        </button>
      ) : (
        label
      )}
    </h2>
  );
}
