import styles from "./LevelLine.module.css";

export type LevelOption = { value: string; label: string };

export function LevelLine({
  label,
  name,
  options,
  chosen,
  onChoose,
}: {
  label: string;
  name: string;
  options: readonly LevelOption[];
  chosen: string;
  onChoose: (value: string) => void;
}) {
  return (
    <fieldset className={styles.line}>
      <legend className={styles.legend}>{label}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.level}>
          <input
            className={styles.input}
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === chosen}
            onChange={() => onChoose(option.value)}
          />
          <span className={styles.node} aria-hidden />
          <span className={option.value === chosen ? styles.chosen : styles.text}>
            {option.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
