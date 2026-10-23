import { Icon } from "../Icon/Icon";
import type { LinkComponent } from "../link";
import styles from "./PlayerChip.module.css";

export function PlayerChip({
  href,
  name,
  avatar = null,
  link,
}: {
  href: string;
  name: string;
  avatar?: string | null;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles.chip}>
      {avatar ? (
        <img className={styles.glyph} src={avatar} alt="" />
      ) : (
        <span className={styles.avatar} aria-hidden />
      )}
      <span>{name}</span>
      <span className={styles.chevron}>
        <Icon name="chevron-backward" />
      </span>
    </Link>
  );
}
