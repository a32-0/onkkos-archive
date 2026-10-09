import { Badge } from "../Badge/Badge";
import type { LinkComponent } from "../link";
import type { RowCount } from "../PlaceRow/PlaceRow";
import styles from "./SystemRow.module.css";

export function SystemRow({
  href,
  name,
  art,
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
  art: string | null;
  satellite?: string;
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
        {art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.art} />}
        {satellite && <img className={styles.satellite} src={satellite} alt="" />}
      </span>
      <span className={mastered ? styles.inline : styles.text}>
        <span className={styles.name}>{name}</span>
        {soon ? (
          <span className={styles.soon}>{soon}</span>
        ) : mastered ? (
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
    </>
  );
  if (soon || !href) return <div className={styles.static}>{body}</div>;
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.row} aria-current={onView || undefined}>
      {body}
    </Link>
  );
}
