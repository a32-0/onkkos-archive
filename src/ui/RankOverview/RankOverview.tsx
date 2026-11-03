import { EmptyState } from "../EmptyState/EmptyState";
import type { IconName } from "../Icon/glyphs";
import { ItemChip, type ItemChipState } from "../ItemChip/ItemChip";
import type { LinkComponent } from "../link";
import styles from "./RankOverview.module.css";

export interface RankOverviewChip {
  key: string;
  label: string;
  icon: string | null;
  state: ItemChipState;
  name?: string;
  href?: string;
}

const FRAME = 152;
const STROKE = 5;
const EDGE = STROKE / 2;
const FAR = FRAME - EDGE;
const TOP = FRAME / 2;
const SQUARE = `M ${TOP} ${EDGE} H ${EDGE} V ${FAR} H ${FAR} V ${EDGE} Z`;

export function RankOverview({
  art,
  share,
  highest = false,
  figure,
  label,
  progressLabel,
  left,
  empty,
  href,
  link,
}: {
  art: string | null;
  share: number;
  highest?: boolean;
  figure: string;
  label: string;
  progressLabel: string;
  left?: { caption: string; chips: readonly RankOverviewChip[] };
  empty?: { icon: IconName; title: string; line: string };
  href?: string;
  link?: LinkComponent;
}) {
  const filled = Math.max(0, Math.min(100, share * 100));
  const Link = link ?? "a";
  const progress = (
    <>
      <div
        className={styles.frame}
        role="progressbar"
        aria-label={progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.floor(filled)}
      >
        <svg
          className={styles.edges}
          viewBox={`0 0 ${FRAME} ${FRAME}`}
          aria-hidden
          focusable="false"
        >
          <path className={styles.track} d={SQUARE} />
          {filled > 0 && (
            <path
              className={highest ? styles.full : styles.arc}
              d={SQUARE}
              pathLength={100}
              strokeDasharray={`${filled} 100`}
            />
          )}
        </svg>
        <span className={styles.art}>
          {art && <img className={styles.image} src={art} alt="" />}
        </span>
      </div>
      <p className={styles.count}>
        <span className={styles.figure}>{figure}</span>
        <span className={styles.label}>{label}</span>
      </p>
    </>
  );
  return (
    <div className={styles.overview}>
      {href === undefined ? (
        progress
      ) : (
        <Link href={href} className={styles.link}>
          {progress}
        </Link>
      )}
      {left && left.chips.length > 0 && (
        <div className={styles.left}>
          <ul className={styles.chips}>
            {left.chips.map((chip) => (
              <ItemChip
                key={chip.key}
                label={chip.label}
                icon={chip.icon}
                state={chip.state}
                name={chip.name}
                href={chip.href}
                link={link}
              />
            ))}
          </ul>
          <p className={styles.caption}>{left.caption}</p>
        </div>
      )}
      {empty && (
        <div className={styles.empty}>
          <EmptyState icon={empty.icon} title={empty.title} line={empty.line} />
        </div>
      )}
    </div>
  );
}
