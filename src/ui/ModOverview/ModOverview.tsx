import { GameIcon } from "../GameIcon/GameIcon";
import styles from "./ModOverview.module.css";

export type ModRarity = "common" | "uncommon" | "rare" | "legendary";

export function ModOverview({
  art,
  name,
  capacity,
  polarity,
  ranks,
  rank,
  rarity,
}: {
  art: string | null;
  name: string;
  capacity: string | null;
  polarity: string | null;
  ranks: number;
  rank: string;
  rarity: ModRarity | null;
}) {
  return (
    <div className={styles.overview}>
      <div className={`${styles.card} ${rarity ? styles[rarity] : ""}`}>
        {art && <img className={styles.art} src={art} alt={name} />}
        {capacity !== null && (
          <span className={styles.capacity}>
            <span>{capacity}</span>
            {polarity && <GameIcon url={polarity} />}
          </span>
        )}
      </div>
      <p className={styles.caption}>
        <span className={styles.ranks} aria-hidden>
          {Array.from({ length: ranks }, (_, at) => (
            <span key={at} className={styles.rank} />
          ))}
        </span>
        <span className={styles.max}>{rank}</span>
      </p>
    </div>
  );
}
