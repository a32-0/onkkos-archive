import type { IconName } from "../Icon/glyphs";
import { Icon } from "../Icon/Icon";
import type { LinkComponent } from "../link";
import styles from "./ChoiceCard.module.css";

export type ChoiceCardUse = "two-ways-in" | "goal";

export function ChoiceCard({
  use,
  href,
  icon,
  title,
  line,
  link,
}: {
  use: ChoiceCardUse;
  href: string;
  icon: IconName;
  title: string;
  line: string;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link href={href} className={styles[use]}>
      <Icon name={icon} size={40} />
      <span className={use === "goal" ? styles.titleUpper : styles.titleCaps}>{title}</span>
      <span className={styles.line}>{line}</span>
    </Link>
  );
}
