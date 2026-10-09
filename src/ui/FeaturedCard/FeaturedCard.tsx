import { Icon } from "../Icon/Icon";
import styles from "./FeaturedCard.module.css";

export type FeaturedCardKind = "last-played" | "up-to-date";

export function FeaturedCard({
  kind,
  eyebrow,
  name,
  meta,
  art,
  open,
  listId,
  onToggle,
}: {
  kind: FeaturedCardKind;
  eyebrow: string;
  name: string;
  meta: string;
  art: string | null;
  open: boolean;
  listId: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.card}
      aria-expanded={open}
      aria-controls={open ? listId : undefined}
      onClick={onToggle}
    >
      {art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.blank} />}
      <span className={styles.text}>
        <span className={styles[kind]}>{eyebrow}</span>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>{meta}</span>
      </span>
      <span className={styles.chevron}>
        <Icon name="chevron-backward" />
      </span>
    </button>
  );
}
