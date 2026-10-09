import type { InputHTMLAttributes } from "react";

import { Icon } from "../Icon/Icon";
import styles from "./Checkbox.module.css";

export function Checkbox({
  label,
  checked,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "style" | "aria-label"> & {
  label: string;
  checked: boolean;
}) {
  return (
    <span className={checked ? styles.on : styles.off}>
      <input
        {...rest}
        type="checkbox"
        className={styles.input}
        checked={checked}
        aria-label={label}
      />
      <Icon name={checked ? "check-box" : "check-box-outline-blank"} />
    </span>
  );
}
