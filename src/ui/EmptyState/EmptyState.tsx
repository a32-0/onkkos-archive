import type { IconName } from "../Icon/glyphs";
import { Icon } from "../Icon/Icon";
import styles from "./EmptyState.module.css";

export function EmptyState({ icon, title, line }: { icon: IconName; title: string; line: string }) {
  return (
    <div className={styles.empty}>
      <Icon name={icon} size={40} />
      <p className={styles.title}>{title}</p>
      <p className={styles.line}>{line}</p>
    </div>
  );
}
