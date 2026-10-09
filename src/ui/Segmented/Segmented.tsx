import styles from "./Segmented.module.css";

export type SegmentedOption = { value: string; label: string };

export function Segmented({
  label,
  options,
  chosen,
  onChoose,
}: {
  label: string;
  options: readonly [SegmentedOption, SegmentedOption];
  chosen: string | null;
  onChoose: (value: string) => void;
}) {
  return (
    <div className={styles.segmented} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === chosen ? styles.chosen : styles.option}
          aria-pressed={option.value === chosen}
          onClick={() => onChoose(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
