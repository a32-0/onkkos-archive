import { Icon } from "../Icon/Icon";
import type { LinkComponent } from "../link";
import styles from "./FeaturedCard.module.css";

export type FeaturedCardKind = "last-played" | "up-to-date";

export function FeaturedCard({
  kind,
  eyebrow,
  name,
  meta,
  art,
  href,
  link,
}: {
  kind: FeaturedCardKind;
  eyebrow: string;
  name: string;
  meta: string;
  art: string | null;
  href: string;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.card}>
      {art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.blank} />}
      <span className={styles.text}>
        <span className={styles[kind]}>{eyebrow}</span>
        <span className={styles.name}>{name}</span>
        {meta && <span className={styles.meta}>{meta}</span>}
      </span>
      <span className={styles.chevron}>
        <Icon name="chevron-backward" />
      </span>
    </Link>
  );
}
