import styles from "./ModOverview.module.css";

export type ModRarity = "common" | "uncommon" | "rare" | "legendary";

export function ModOverview({
  art,
  name,
  rarity,
}: {
  art: string | null;
  name: string;
  rarity: ModRarity | null;
}) {
  return (
    <div className={styles.overview}>
      <div className={`${styles.card} ${rarity ? styles[rarity] : ""}`}>
        {art && <img className={styles.art} src={art} alt={name} />}
      </div>
    </div>
  );
}
