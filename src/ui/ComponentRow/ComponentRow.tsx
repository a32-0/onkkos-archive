import type { ReactNode } from "react";

import { Checkbox } from "../Checkbox/Checkbox";
import { Icon } from "../Icon/Icon";
import styles from "./ComponentRow.module.css";

export function ComponentRow({
  title,
  art,
  ticked,
  open,
  bodyId,
  onTick,
  onToggle,
  children,
}: {
  title: string;
  art: string | null;
  ticked: boolean;
  open: boolean;
  bodyId: string;
  onTick: (ticked: boolean) => void;
  onToggle: () => void;
  children?: ReactNode;
}) {
  const shown = open && !ticked;
  return (
    <div className={ticked ? styles.ticked : styles.row}>
      <div className={styles.head}>
        <Checkbox
          label={title}
          checked={ticked}
          onChange={(event) => onTick(event.target.checked)}
        />
        {art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.art} />}
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={shown}
          aria-controls={shown ? bodyId : undefined}
          onClick={onToggle}
        >
          <span className={styles.title}>{title}</span>
          <span className={shown ? styles.up : styles.down}>
            <Icon name="chevron-backward" />
          </span>
        </button>
      </div>
      {shown && (
        <div id={bodyId} className={styles.body}>
          {children}
        </div>
      )}
    </div>
  );
}
