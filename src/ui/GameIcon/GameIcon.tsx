import styles from "./GameIcon.module.css";

export function GameIcon({ url }: { url: string | null }) {
  if (!url) return null;
  return (
    <span
      className={styles.icon}
      style={{ maskImage: `url("${url}")`, WebkitMaskImage: `url("${url}")` }}
      aria-hidden
    />
  );
}
