import { Icon } from "../Icon/Icon";
import type { LinkComponent } from "../link";
import styles from "./TopBar.module.css";

export function TopBar({
  title,
  back,
  backLabel,
  heading = true,
  link,
}: {
  title: string;
  back: string;
  backLabel: string;
  heading?: boolean;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  const Title = heading ? "h1" : "p";
  return (
    <header className={styles.bar}>
      <Link href={back} className={styles.back} aria-label={backLabel}>
        <Icon name="chevron-backward" />
      </Link>
      <Title className={styles.title}>{title}</Title>
    </header>
  );
}
