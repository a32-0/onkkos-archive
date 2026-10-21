import { Icon } from "../Icon/Icon";
import type { LinkComponent } from "../link";
import styles from "./TopBar.module.css";

export function TopBar({
  title,
  back,
  backLabel,
  link,
}: {
  title: string;
  back: string;
  backLabel: string;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <header className={styles.bar}>
      <Link href={back} className={styles.back} aria-label={backLabel}>
        <Icon name="chevron-backward" />
      </Link>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
