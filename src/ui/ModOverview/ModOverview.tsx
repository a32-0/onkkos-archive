import { GameIcon } from "../GameIcon/GameIcon";
import styles from "./ModOverview.module.css";

export function ModOverview({
  art,
  name,
  capacity,
  polarity,
  ranks,
  rank,
  cost,
}: {
  art: string | null;
  name: string;
  capacity: number;
  polarity: string | null;
  ranks: number;
  rank: string;
  cost: string;
}) {
  return (
    <div className={styles.overview}>
      <div className={styles.card}>
        {art && <img className={styles.art} src={art} alt={name} />}
        <span className={styles.capacity}>
          <span>{capacity}</span>
          {polarity && <GameIcon url={polarity} />}
        </span>
      </div>
      <span className={styles.ranks} aria-hidden>
        {Array.from({ length: ranks }, (_, at) => (
          <span key={at} className={styles.rank} />
        ))}
      </span>
      <p className={styles.caption}>
        <span className={styles.max}>{rank}</span>
        <span>{cost}</span>
      </p>
    </div>
  );
}
