import { Badge } from "../Badge/Badge";
import type { LinkComponent } from "../link";
import { Orb } from "../Orb/Orb";
import styles from "./PlaceRow.module.css";

export type RowCount = { count: string; label: string };

export function PlaceRow({
  href,
  name,
  orb,
  count,
  gap,
  mastered,
  startHere,
  isNew,
  onView,
  link,
}: {
  href: string;
  name: string;
  orb: string | null;
  count?: RowCount;
  gap?: string;
  mastered?: string;
  startHere?: string;
  isNew?: string;
  onView?: boolean;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.row} aria-current={onView || undefined}>
      <Orb color={orb} size="m" />
      <span className={styles.text}>
        <span className={styles.name}>{name}</span>
        {mastered ? null : gap ? (
          <span className={styles.gap}>{gap}</span>
        ) : (
          count && (
            <span className={styles.count}>
              <b className={styles.strong}>{count.count}</b> {count.label}
            </span>
          )
        )}
      </span>
      {mastered ? (
        <Badge kind="mastered" label={mastered} />
      ) : startHere ? (
        <Badge kind="start-here" label={startHere} />
      ) : (
        isNew && <Badge kind="new" label={isNew} />
      )}
    </Link>
  );
}
