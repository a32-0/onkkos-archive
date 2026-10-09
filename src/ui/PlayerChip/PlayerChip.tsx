import type { ButtonHTMLAttributes } from "react";

import { Icon } from "../Icon/Icon";
import styles from "./PlayerChip.module.css";

export function PlayerChip({
  name,
  open,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style" | "children"> & {
  name: string;
  open: boolean;
}) {
  return (
    <button
      {...rest}
      type="button"
      className={styles.chip}
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      <span className={styles.avatar} aria-hidden />
      <span>{name}</span>
      <span className={styles.chevron}>
        <Icon name="chevron-backward" />
      </span>
    </button>
  );
}
