import styles from "./OnkkoLine.module.css";

export type OnkkoLinePlace = "top" | "bottom" | "art";

export function OnkkoLine({
  line,
  place,
  accent,
}: {
  line: string;
  place: OnkkoLinePlace;
  accent?: string | null;
}) {
  const at = accent ? line.lastIndexOf(accent) : -1;
  if (!accent || at < 0) return <p className={styles[place]}>{line}</p>;
  return (
    <p className={styles[place]}>
      {line.slice(0, at)}
      <span className={styles.accent}>{accent}</span>
      {line.slice(at + accent.length)}
    </p>
  );
}
