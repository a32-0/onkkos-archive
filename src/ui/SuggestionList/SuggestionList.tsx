import { SuggestionRow } from "../SuggestionRow/SuggestionRow";
import styles from "./SuggestionList.module.css";

export type Suggestion = {
  value: string;
  name: string;
  catalogue: string;
  art: string | null;
  round?: boolean;
};

export const optionId = (listId: string, index: number) => `${listId}-${index}`;

export function nextActive(key: string, active: number, count: number): number | null {
  if (count === 0) return null;
  if (key === "ArrowDown") return active < count - 1 ? active + 1 : 0;
  if (key === "ArrowUp") return active > 0 ? active - 1 : count - 1;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}

export function SuggestionList({
  id,
  label,
  items,
  active,
  empty,
  onChoose,
}: {
  id: string;
  label: string;
  items: readonly Suggestion[];
  active: number;
  empty: string;
  onChoose: (value: string) => void;
}) {
  if (items.length === 0) {
    return (
      <p id={id} role="status" className={styles.empty}>
        {empty}
      </p>
    );
  }
  return (
    <ul id={id} role="listbox" aria-label={label} className={styles.list}>
      {items.map((item, index) => (
        <SuggestionRow
          key={item.value}
          id={optionId(id, index)}
          name={item.name}
          catalogue={item.catalogue}
          art={item.art}
          round={item.round}
          active={index === active}
          onChoose={() => onChoose(item.value)}
        />
      ))}
    </ul>
  );
}
