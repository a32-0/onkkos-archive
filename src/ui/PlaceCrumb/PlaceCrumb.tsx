import type { LinkComponent } from "../link";
import styles from "./PlaceCrumb.module.css";

export function PlaceCrumb({
  href,
  label,
  place,
  art,
  link,
}: {
  href: string;
  label: string;
  place: string;
  art: string | null;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.crumb}>
      {art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.art} />}
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.place}>{place}</span>
      </span>
    </Link>
  );
}
