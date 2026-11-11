import type { IconName } from "../Icon/glyphs";
import { Icon } from "../Icon/Icon";
import type { LinkComponent } from "../link";
import styles from "./MilestoneRow.module.css";

export function MilestoneRow({
  href,
  icon,
  title,
  line,
  link,
}: {
  href: string;
  icon: IconName;
  title: string;
  line: string;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.row}>
      <span className={styles.text}>
        <span className={styles.headline}>
          <span className={styles.icon}>
            <Icon name={icon} />
          </span>
          <span className={styles.title}>{title}</span>
        </span>
        <span className={styles.line}>{line}</span>
      </span>
      <span className={styles.trailing}>
        <Icon name="chevron-backward" />
      </span>
    </Link>
  );
}
