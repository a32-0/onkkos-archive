import { GameIcon } from "../GameIcon/GameIcon";
import type { IconName } from "../Icon/glyphs";
import { Icon } from "../Icon/Icon";
import type { LinkComponent } from "../link";
import styles from "./ListItem.module.css";

export function ListItem({
  href,
  icon = null,
  symbol,
  title,
  badge,
  supporting,
  link,
}: {
  href: string;
  icon?: string | null;
  symbol?: IconName;
  title: string;
  badge?: string;
  supporting?: string;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.item}>
      {icon ? (
        <span className={styles.leading}>
          <GameIcon url={icon} />
        </span>
      ) : (
        symbol && (
          <span className={styles.leading}>
            <Icon name={symbol} />
          </span>
        )
      )}
      <span className={styles.text}>
        <span className={styles.headline}>
          <span className={styles.title}>{title}</span>
          {badge && <span className={styles.badge}>{badge}</span>}
        </span>
        {supporting && <span className={styles.supporting}>{supporting}</span>}
      </span>
      <span className={styles.trailing}>
        <Icon name="chevron-backward" />
      </span>
    </Link>
  );
}
