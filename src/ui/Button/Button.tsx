import type { ButtonHTMLAttributes } from "react";

import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "text";

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  type = "button",
  children,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style"> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  return (
    <button
      {...rest}
      type={type}
      className={styles[variant]}
      data-variant={variant}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {children}
    </button>
  );
}
