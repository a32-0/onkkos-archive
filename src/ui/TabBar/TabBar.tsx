import type { IconName } from "../Icon/glyphs";
import type { LinkComponent } from "../link";
import { Tab, type TabPlacement } from "../Tab/Tab";
import styles from "./TabBar.module.css";

export type TabBarItem = { href: string; icon: IconName; label: string; active: boolean };

export function TabBar({
  label,
  items,
  placement,
  link,
}: {
  label: string;
  items: readonly TabBarItem[];
  placement: TabPlacement;
  link?: LinkComponent;
}) {
  return (
    <nav className={styles[placement]} aria-label={label}>
      {items.map((item) => (
        <Tab key={item.href} {...item} placement={placement} link={link} />
      ))}
    </nav>
  );
}
