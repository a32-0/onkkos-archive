import styles from "./SuggestionRow.module.css";

export function SuggestionRow({
  id,
  name,
  catalogue,
  art,
  round,
  active,
  onChoose,
}: {
  id: string;
  name: string;
  catalogue: string;
  art: string | null;
  round?: boolean;
  active: boolean;
  onChoose: () => void;
}) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      className={styles.row}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onChoose}
    >
      {art ? (
        <img className={round ? styles.round : styles.art} src={art} alt="" />
      ) : (
        <span className={round ? styles["blank-round"] : styles.blank} />
      )}
      <span className={styles.text}>
        <span className={styles.name}>{name}</span>
        <span className={styles.catalogue}>{catalogue}</span>
      </span>
    </li>
  );
}
