import type { ButtonHTMLAttributes } from "react";

import type { LinkComponent } from "../link";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "text";

export function Button({
  variant = "primary",
  loading = false,
  href,
  link,
  external = false,
  disabled,
  type = "button",
  children,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style"> & {
  variant?: ButtonVariant;
  loading?: boolean;
  href?: string;
  link?: LinkComponent;
  external?: boolean;
}) {
  if (href !== undefined && external) {
    return (
      <a
        href={href}
        className={styles[variant]}
        data-variant={variant}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  }
  if (href !== undefined) {
    const Link = link ?? "a";
    return (
      <Link href={href} className={styles[variant]} data-variant={variant}>
        {children}
      </Link>
    );
  }
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
