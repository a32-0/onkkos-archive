import type { ReactNode } from "react";

import { Wordmark } from "../Wordmark/Wordmark";
import styles from "./Header.module.css";

export function Header(
  props:
    | { variant: "wordmark"; wordmark: string }
    | { variant: "chip"; wordmark: string; chip: ReactNode; tabs?: ReactNode },
) {
  if (props.variant === "wordmark") {
    return (
      <header className={styles.centred}>
        <Wordmark size="header" label={props.wordmark} />
      </header>
    );
  }
  return (
    <header className={styles.header}>
      <Wordmark size="sheet" label={props.wordmark} />
      {props.tabs && <div className={styles.tabs}>{props.tabs}</div>}
      {props.chip}
    </header>
  );
}
