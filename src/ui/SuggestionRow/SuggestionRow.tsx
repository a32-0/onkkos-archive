import { Orb } from "../Orb/Orb";
import styles from "./SuggestionRow.module.css";

export function SuggestionRow({
  id,
  name,
  catalogue,
  art,
  round,
  orb,
  active,
  onChoose,
}: {
  id: string;
  name: string;
  catalogue: string;
  art: string | null;
  round?: boolean;
  orb?: string | null;
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
      {orb !== undefined ? (
        <Orb color={orb} size="s" />
      ) : art ? (
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
