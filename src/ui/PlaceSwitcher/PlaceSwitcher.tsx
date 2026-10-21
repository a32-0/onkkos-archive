import { Icon } from "../Icon/Icon";
import { fit } from "../fit";
import type { LinkComponent } from "../link";
import styles from "./PlaceSwitcher.module.css";

export function PlaceSwitcher({
  href,
  kicker,
  name,
  link,
}: {
  href: string;
  kicker: string;
  name: string;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.card}>
      <span className={styles.text}>
        <span className={styles.kicker}>{kicker}</span>
        <span className={styles.name} style={fit(name)}>
          {name}
        </span>
      </span>
      <span className={styles.chevron}>
        <Icon name="chevron-backward" />
      </span>
    </Link>
  );
}
