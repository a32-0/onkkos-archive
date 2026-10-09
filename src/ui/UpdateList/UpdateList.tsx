import type { ReactNode } from "react";

import styles from "./UpdateList.module.css";

export type UpdateListItem = { value: string; name: string; meta: string; art: string | null };

export function UpdateList({
  id,
  items,
  onChoose,
  more,
}: {
  id: string;
  items: readonly UpdateListItem[];
  onChoose: (value: string) => void;
  more?: ReactNode;
}) {
  return (
    <div id={id} className={styles.list}>
      <ul className={styles.items}>
        {items.map((item) => (
          <li key={item.value}>
            <button type="button" className={styles.item} onClick={() => onChoose(item.value)}>
              {item.art ? (
                <img className={styles.art} src={item.art} alt="" />
              ) : (
                <span className={styles.blank} />
              )}
              <span className={styles.text}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.meta}>{item.meta}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {more}
    </div>
  );
}
