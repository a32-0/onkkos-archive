import { GLYPHS, type IconName } from "./glyphs";
import styles from "./Icon.module.css";

export type IconSize = 16 | 20 | 24;

export function Icon({
  name,
  size = 24,
  label,
}: {
  name: IconName;
  size?: IconSize;
  label?: string;
}) {
  return (
    <svg
      className={`${styles.icon} ${styles[`s${size}`]}`}
      viewBox="0 0 24 24"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={GLYPHS[name]} />
    </svg>
  );
}
