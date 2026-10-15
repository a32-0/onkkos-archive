import styles from "./MoreLine.module.css";

export function MoreLine({ text }: { text: string }) {
  return <p className={styles.line}>{text}</p>;
}
