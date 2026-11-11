import type { ReactNode } from "react";

import { Icon } from "../Icon/Icon";
import styles from "./ComponentRow.module.css";

export function ComponentRow({
  title,
  art,
  locked,
  status,
  open,
  bodyId,
  onToggle,
  children,
}: {
  title: string;
  art: string | null;
  locked?: boolean;
  status?: string;
  open: boolean;
  bodyId: string;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <div className={locked ? styles.locked : styles.row}>
      <div className={styles.head}>
        {art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.art} />}
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={open ? bodyId : undefined}
          onClick={onToggle}
        >
          <span className={styles.title}>{title}</span>
          {status && <span className={styles.status}>{status}</span>}
          <span className={open ? styles.up : styles.down}>
            <Icon name="chevron-backward" />
          </span>
        </button>
      </div>
      {open && (
        <div id={bodyId} className={styles.body}>
          {children}
        </div>
      )}
    </div>
  );
}
