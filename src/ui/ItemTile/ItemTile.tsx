import { Badge } from "../Badge/Badge";
import type { LinkComponent } from "../link";
import styles from "./ItemTile.module.css";

export type ItemTileState = { kind: "rank" | "mastered"; label: string };

export function ItemTile({
  href,
  name,
  reading,
  place,
  art,
  state,
  link,
}: {
  href: string;
  name: string;
  reading: string;
  place: string;
  art: string | null;
  state?: ItemTileState;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.tile}>
      {art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.art} />}
      {state && (
        <>
          <span className={styles[`${state.kind}-tint`]} />
          <span className={styles.badge}>
            <Badge kind={state.kind} label={state.label} />
          </span>
        </>
      )}
      <span className={styles.band}>
        <span className={styles.name}>{name}</span>
        <span className={styles.reading}>{reading}</span>
        <span className={styles.place}>{place}</span>
      </span>
    </Link>
  );
}
