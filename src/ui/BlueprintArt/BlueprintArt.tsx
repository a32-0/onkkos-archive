import styles from "./BlueprintArt.module.css";

export function BlueprintArt({
  part,
  blueprint,
}: {
  part: string | null;
  blueprint: string | null;
}) {
  return (
    <span className={styles.art}>
      {blueprint && <img className={styles.layer} src={blueprint} alt="" loading="lazy" />}
      {part && <img className={styles.layer} src={part} alt="" loading="lazy" />}
    </span>
  );
}
