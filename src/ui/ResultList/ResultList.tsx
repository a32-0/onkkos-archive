import type { LinkComponent } from "../link";
import { Orb } from "../Orb/Orb";
import type { Suggestion } from "../SuggestionList/SuggestionList";
import styles from "./ResultList.module.css";

export type Result = Suggestion & { href: string };

export function ResultList({
  label,
  items,
  link,
}: {
  label: string;
  items: readonly Result[];
  link?: LinkComponent;
}) {
  const Link = link ?? "a";
  return (
    <ul aria-label={label} className={styles.list}>
      {items.map((item) => (
        <li key={item.value}>
          <Link href={item.href} className={styles.row}>
            {item.orb !== undefined ? (
              <Orb color={item.orb} size="s" />
            ) : item.art ? (
              <img className={item.round ? styles.round : styles.art} src={item.art} alt="" />
            ) : (
              <span className={item.round ? styles["blank-round"] : styles.blank} />
            )}
            <span className={styles.text}>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.catalogue}>{item.catalogue}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
