import type { InputHTMLAttributes, ReactNode } from "react";

import styles from "./SearchField.module.css";

export function SearchField({
  label,
  listId,
  suggestions,
  ...rest
}: Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "style" | "type" | "role" | "aria-label"
> & {
  label: string;
  listId?: string;
  suggestions?: ReactNode;
}) {
  const expanded = suggestions !== undefined;
  return (
    <div className={styles.search}>
      <input
        {...rest}
        type="search"
        role={listId ? "combobox" : undefined}
        aria-label={label}
        aria-controls={listId}
        aria-expanded={listId ? expanded : undefined}
        aria-autocomplete={listId ? "list" : undefined}
        autoComplete="off"
        className={styles.input}
      />
      {suggestions}
    </div>
  );
}
