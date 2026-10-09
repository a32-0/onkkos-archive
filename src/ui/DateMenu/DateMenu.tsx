import { Field } from "../Field/Field";
import { Icon } from "../Icon/Icon";
import styles from "./DateMenu.module.css";

export type DateMenuMonth = { value: string; label: string };

export function DateMenu({
  label,
  heading,
  months,
  dayHeading,
  dayPlaceholder,
  open,
  menuId,
  onToggle,
  onChoose,
  onDay,
}: {
  label: string;
  heading: string;
  months: readonly DateMenuMonth[];
  dayHeading: string;
  dayPlaceholder: string;
  open: boolean;
  menuId: string;
  onToggle: () => void;
  onChoose: (value: string) => void;
  onDay: (value: string) => void;
}) {
  const dayId = `${menuId}-day`;
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
          <form
            className={styles.day}
            onSubmit={(event) => {
              event.preventDefault();
              const value = new FormData(event.currentTarget).get("day");
              if (typeof value === "string") onDay(value);
            }}
          >
            <label htmlFor={dayId} className={styles.heading}>
              {dayHeading}
            </label>
            <Field id={dayId} name="day" inputMode="numeric" placeholder={dayPlaceholder} />
          </form>
        </div>
      )}
    </>
  );
}
