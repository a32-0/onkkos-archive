import { BlueprintArt } from "../BlueprintArt/BlueprintArt";
import type { LinkComponent } from "../link";
import { Orb } from "../Orb/Orb";
import styles from "./SummaryRow.module.css";

export function SummaryRow({
  href,
  name,
  reading,
  place,
  art,
  orb,
  blueprint,
  link,
}: {
  href?: string;
  name: string;
  reading?: string;
  place?: string;
  art: string | null;
  orb?: string | null;
  blueprint?: string | null;
  link?: LinkComponent;
}) {
  const body = (
    <>
      {blueprint !== undefined ? (
        <BlueprintArt part={art} blueprint={blueprint} />
      ) : orb ? (
        <span className={styles.ground}>
          <Orb color={orb} size="m" />
        </span>
      ) : art ? (
        <img className={styles.art} src={art} alt="" />
      ) : (
        <span className={styles.slot} />
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
