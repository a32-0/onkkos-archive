import type { InputHTMLAttributes } from "react";

import styles from "./Field.module.css";

export function Field({
  invalid = false,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "style"> & { invalid?: boolean }) {
  return <input {...rest} className={styles.field} aria-invalid={invalid || undefined} />;
}
