import styles from "./FilterChip.module.css";

export function FilterChip({
  label,
  pressed,
  onToggle,
}: {
  label: string;
  pressed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={pressed ? styles.on : styles.off}
      aria-pressed={pressed}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}
