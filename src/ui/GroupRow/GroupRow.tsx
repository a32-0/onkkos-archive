import type { ReactNode } from "react";

import { GameIcon } from "../GameIcon/GameIcon";
import { Icon } from "../Icon/Icon";
import styles from "./GroupRow.module.css";

export function GroupRow({
  icon,
  name,
  count,
  open,
  railId,
  onToggle,
  children,
}: {
  icon: string | null;
  name: string;
  count?: string;
  open: boolean;
  railId: string;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <section className={styles.group}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={open}
        aria-controls={open ? railId : undefined}
        onClick={onToggle}
      >
        <span className={styles.title}>
          <GameIcon url={icon} />
          <span className={styles.name}>{name}</span>
          {count && <span className={styles.count}>{count}</span>}
        </span>
        <span className={open ? styles.up : styles.down}>
          <Icon name="chevron-backward" />
        </span>
      </button>
      {open && children}
    </section>
  );
}
