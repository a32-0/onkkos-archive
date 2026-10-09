import { Icon } from "../Icon/Icon";
import styles from "./DateMenu.module.css";

export type DateMenuMonth = { value: string; label: string };

export function DateMenu({
  label,
  heading,
  months,
  open,
  menuId,
  onToggle,
  onChoose,
}: {
  label: string;
  heading: string;
  months: readonly DateMenuMonth[];
  open: boolean;
  menuId: string;
  onToggle: () => void;
  onChoose: (value: string) => void;
}) {
  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={onToggle}
      >
        {label}
        <span className={styles.chevron}>
          <Icon name="chevron-backward" />
        </span>
      </button>
      {open && (
        <div id={menuId} className={styles.menu}>
          <p className={styles.heading}>{heading}</p>
          <ul className={styles.months}>
            {months.map((month) => (
              <li key={month.value}>
                <button
                  type="button"
                  className={styles.month}
                  onClick={() => onChoose(month.value)}
                >
                  {month.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
