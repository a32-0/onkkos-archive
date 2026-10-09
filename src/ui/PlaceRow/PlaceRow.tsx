import { Badge } from "../Badge/Badge";
import type { LinkComponent } from "../link";
import styles from "./PlaceRow.module.css";

export type RowCount = { count: string; label: string };

export function PlaceRow({
  href,
  name,
  art,
  count,
  mastered,
  startHere,
  isNew,
  onView,
  link,
}: {
  href: string;
  name: string;
  art: string | null;
  count?: RowCount;
  mastered?: string;
  startHere?: string;
  isNew?: string;
  onView?: boolean;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.row} aria-current={onView || undefined}>
      {art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.art} />}
      <span className={mastered ? styles.inline : styles.text}>
        <span className={styles.name}>{name}</span>
        {mastered ? (
          <Badge kind="mastered" label={mastered} />
        ) : (
          count && (
            <span className={styles.count}>
              <b className={styles.strong}>{count.count}</b> {count.label}
            </span>
          )
        )}
      </span>
      {startHere && <Badge kind="start-here" label={startHere} />}
      {isNew && <Badge kind="new" label={isNew} />}
    </Link>
  );
}
