import type { LinkComponent } from "../link";
import { Orb } from "../Orb/Orb";
import styles from "./PlaceCrumb.module.css";

export function PlaceCrumb({
  href,
  label,
  place,
  art,
  orb,
  link,
}: {
  href: string;
  label: string;
  place: string;
  art: string | null;
  orb?: string | null;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.crumb}>
      {orb !== undefined ? (
        <Orb color={orb} size="s" />
      ) : art ? (
        <img className={styles.art} src={art} alt="" />
      ) : (
        <span className={styles.art} />
      )}
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.place}>{place}</span>
      </span>
    </Link>
  );
}
