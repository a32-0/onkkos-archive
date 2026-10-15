import styles from "./OnkkoLine.module.css";

export type OnkkoLinePlace = "top" | "bottom" | "art";

export function OnkkoLine({ line, place }: { line: string; place: OnkkoLinePlace }) {
  return <p className={styles[place]}>{line}</p>;
}
