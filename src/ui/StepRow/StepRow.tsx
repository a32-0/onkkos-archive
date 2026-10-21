import type { ReactNode } from "react";

import { Icon } from "../Icon/Icon";
import styles from "./StepRow.module.css";

export function StepRow({
  title,
  art,
  best,
  locked,
  status,
  open,
  bodyId,
  onToggle,
  children,
}: {
  title: string;
  art?: string | null;
  best?: boolean;
  locked?: boolean;
  status?: string;
  open: boolean;
  bodyId: string;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <div className={locked ? styles.locked : styles.row}>
      <button
        type="button"
        className={styles.head}
        aria-expanded={open}
        aria-controls={open ? bodyId : undefined}
        onClick={onToggle}
      >
        {art !== undefined &&
          (art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.art} />)}
        <span className={best ? styles.best : styles.title}>{title}</span>
        {status && <span className={styles.status}>{status}</span>}
        <span className={open ? styles.up : styles.down}>
          <Icon name="chevron-backward" />
        </span>
      </button>
      {open && (
        <div id={bodyId} className={styles.body}>
          {children}
        </div>
      )}
    </div>
  );
}
