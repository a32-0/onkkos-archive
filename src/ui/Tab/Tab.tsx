import type { IconName } from "../Icon/glyphs";
import { Icon } from "../Icon/Icon";
import type { LinkComponent } from "../link";
import styles from "./Tab.module.css";

export type TabPlacement = "bottom" | "header";

export function Tab({
  href,
  icon,
  label,
  active,
  placement,
  link,
}: {
  href: string;
  icon: IconName;
  label: string;
  active: boolean;
  placement: TabPlacement;
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <Link
      href={href}
      className={`${styles[placement]} ${active ? styles.active : styles.inactive}`}
      aria-current={active ? "page" : undefined}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </Link>
  );
}
