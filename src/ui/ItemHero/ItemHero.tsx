import { Badge } from "../Badge/Badge";
import styles from "./ItemHero.module.css";

export type ItemHeroState =
  { kind: "rank" | "mastered"; label: string } | { kind: "absent" | "prime" | "none" };

export function ItemHero({
  kicker,
  name,
  art,
  state,
}: {
  kicker: string;
  name: string;
  art: string | null;
  state: ItemHeroState;
}) {
  return (
    <header className={styles.hero}>
      <div className={styles.heading}>
        <p className={styles.kicker}>{kicker}</p>
        <h1 className={styles.name}>{name}</h1>
      </div>
      <div className={styles[state.kind]}>
        {art ? <img className={styles.art} src={art} alt="" /> : <span className={styles.art} />}
        {"label" in state && (
          <span className={styles.badge}>
            <Badge kind={state.kind} label={state.label} />
          </span>
        )}
      </div>
    </header>
  );
}
