import { CompareBars, type CompareBar } from "../CompareBars/CompareBars";
import { ElementCombo } from "../ElementCombo/ElementCombo";
import type { IconName } from "../Icon/glyphs";
import { Icon } from "../Icon/Icon";
import styles from "./ModEffect.module.css";

export interface ModEffectExample {
  label: string;
  before: CompareBar;
  after: CompareBar;
  line: string;
}

export function ModEffect({
  icon,
  outcome,
  amount = null,
  stat = null,
  example = null,
  note = null,
  pairs = null,
}: {
  icon: IconName;
  outcome: string;
  amount?: string | null;
  stat?: string | null;
  example?: ModEffectExample | null;
  note?: string | null;
  pairs?: { label: string; combos: readonly { meets: string; makes: string }[] } | null;
}) {
  return (
    <section className={styles.card}>
      <h3 className={styles.outcome}>
        <span className={styles.icon}>
          <Icon name={icon} />
        </span>
        <span className={styles.text}>{outcome}</span>
      </h3>
      {amount && (
        <p className={styles.value}>
          <span className={styles.amount}>{amount}</span>
          {stat && <span className={styles.stat}>{stat}</span>}
        </p>
      )}
      {example && (
        <div className={styles.example}>
          <p className={styles.label}>{example.label}</p>
          <CompareBars before={example.before} after={example.after} />
          <p className={styles.line}>{example.line}</p>
        </div>
      )}
      {note && (
        <p className={styles.note}>
          <span className={styles.info}>
            <Icon name="info" size={20} />
          </span>
          <span>{note}</span>
        </p>
      )}
      {pairs && pairs.combos.length > 0 && (
        <div className={styles.pairs}>
          <p className={styles.label}>{pairs.label}</p>
          <ul className={styles.combos}>
            {pairs.combos.map((combo) => (
              <li key={combo.meets}>
                <ElementCombo meets={combo.meets} makes={combo.makes} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
