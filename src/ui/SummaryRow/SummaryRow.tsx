import { BlueprintArt } from "../BlueprintArt/BlueprintArt";
import type { LinkComponent } from "../link";
import styles from "./SummaryRow.module.css";

export function SummaryRow({
  href,
  name,
  reading,
  place,
  art,
  blueprint,
  link,
}: {
  href?: string;
  name: string;
  reading?: string;
  place?: string;
  art: string | null;
  blueprint?: string | null;
  link?: LinkComponent;
}) {
  const body = (
    <>
      {blueprint !== undefined ? (
        <BlueprintArt part={art} blueprint={blueprint} />
      ) : art ? (
        <img className={styles.art} src={art} alt="" />
      ) : (
        <span className={styles.art} />
      )}
      <span className={styles.band}>
        <span className={styles.name}>{name}</span>
        {reading && <span className={styles.reading}>{reading}</span>}
        {place && <span className={styles.place}>{place}</span>}
      </span>
    </>
  );
  if (!href) return <div className={styles.row}>{body}</div>;
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.link}>
      {body}
    </Link>
  );
}
