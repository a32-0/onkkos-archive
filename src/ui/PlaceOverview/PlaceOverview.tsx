import { GameIcon } from "../GameIcon/GameIcon";
import type { IconName } from "../Icon/glyphs";
import { Icon } from "../Icon/Icon";
import { Orb } from "../Orb/Orb";
import styles from "./PlaceOverview.module.css";

export type PlaceOverviewKind = {
  name: string;
  icon: string | null;
  symbol?: IconName;
  count: number;
};

const RING = 152;
const STROKE = 5;
const RADIUS = (RING - STROKE) / 2;

export function PlaceOverview({
  orb,
  done,
  readable,
  count,
  label,
  progressLabel,
  left,
}: {
  orb: string | null;
  done: number;
  readable: number;
  count: string;
  label: string;
  progressLabel: string;
  left?: { caption: string; kinds: readonly PlaceOverviewKind[] };
}) {
  const share = readable > 0 ? Math.min(100, (done / readable) * 100) : 0;
  const mastered = readable > 0 && done >= readable;
  return (
    <div className={styles.overview}>
      <div
        className={styles.ring}
        role="progressbar"
        aria-label={progressLabel}
        aria-valuemin={0}
        aria-valuemax={readable}
        aria-valuenow={done}
      >
        <svg className={styles.arcs} viewBox={`0 0 ${RING} ${RING}`} aria-hidden focusable="false">
          <circle className={styles.track} cx={RING / 2} cy={RING / 2} r={RADIUS} />
          {share > 0 && (
            <circle
              className={mastered ? styles.full : styles.arc}
              cx={RING / 2}
              cy={RING / 2}
              r={RADIUS}
              pathLength={100}
              strokeDasharray={`${share} 100`}
            />
          )}
        </svg>
        <span className={styles.orb}>
          <Orb color={orb} size="l" />
        </span>
      </div>
      <p className={styles.count}>
        <span className={styles.figure}>{count}</span>
        <span className={styles.label}>{label}</span>
      </p>
      {left && left.kinds.length > 0 && (
        <div className={styles.left}>
          <ul className={styles.chips}>
            {left.kinds.map((kind) => (
              <li key={kind.name} className={styles.chip} title={kind.name}>
                {kind.icon ? (
                  <GameIcon url={kind.icon} />
                ) : (
                  kind.symbol && <Icon name={kind.symbol} size={20} />
                )}
                <span className={styles.number} aria-label={`${kind.name} ${kind.count}`}>
                  {kind.count}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.caption}>{left.caption}</p>
        </div>
      )}
    </div>
  );
}
