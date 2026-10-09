import type { ButtonHTMLAttributes } from "react";

import styles from "./ShowMore.module.css";

export function ShowMore({
  label,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style" | "children"> & {
  label: string;
}) {
  return (
    <button {...rest} type="button" className={styles.more}>
      {label}
    </button>
  );
}
