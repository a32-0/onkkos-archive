import { Badge } from "../Badge/Badge";
import type { LinkComponent } from "../link";
import { Orb } from "../Orb/Orb";
import type { RowCount } from "../PlaceRow/PlaceRow";
import styles from "./SystemRow.module.css";

export function SystemRow({
  href,
  name,
  orb,
  satellite,
  count,
  mastered,
  startHere,
  soon,
  onView,
  link,
}: {
  href?: string;
  name: string;
  orb: string | null;
  satellite?: string | null;
  count?: RowCount;
  mastered?: string;
  startHere?: string;
  soon?: string;
  onView?: boolean;
  link?: LinkComponent;
}) {
  const body = (
    <>
      <span className={styles.arts}>
        <Orb color={orb} size="m" />
        <span className={styles.satellite}>
          <Orb color={satellite ?? null} size="xs" />
        </span>
      </span>
      <span className={styles.text}>
        <span className={styles.name}>{name}</span>
        {soon ? (
          <span className={styles.soon}>{soon}</span>
        ) : mastered ? null : (
          count && (
            <span className={styles.count}>
              <b className={styles.strong}>{count.count}</b> {count.label}
            </span>
          )
        )}
      </span>
      {mastered ? (
        <Badge kind="mastered" label={mastered} />
      ) : (
        startHere && <Badge kind="start-here" label={startHere} />
      )}
    </>
  );
  if (soon || !href) {
    return (
      <div
        className={soon ? styles.disabled : styles.static}
        aria-disabled={soon ? true : undefined}
      >
        {body}
      </div>
    );
  }
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.row} aria-current={onView || undefined}>
      {body}
    </Link>
  );
}
