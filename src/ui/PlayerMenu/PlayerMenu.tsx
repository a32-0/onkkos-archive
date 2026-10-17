import type { ReactNode } from "react";

import { Divider } from "../Divider/Divider";
import styles from "./PlayerMenu.module.css";

export type ReadCyclePart = { text: string; strong?: boolean };

export type PlayerSetting = { label: string; control: ReactNode; fill?: boolean };

export function PlayerMenu({
  name,
  avatar = null,
  rank,
  rankTitle,
  settingsLabel,
  settings = [],
  disconnect,
  readCycle,
}: {
  name: string;
  avatar?: string | null;
  rank: string;
  rankTitle: string;
  settingsLabel?: string;
  settings?: readonly PlayerSetting[];
  disconnect: ReactNode;
  readCycle: readonly ReadCyclePart[];
}) {
  return (
    <div className={styles.menu}>
      <div className={styles.player}>
        {avatar ? (
          <img className={styles.glyph} src={avatar} alt="" />
        ) : (
          <span className={styles.avatar} aria-hidden />
        )}
        <p className={styles.name}>{name}</p>
        <p className={styles.rank}>{rank}</p>
        <p className={styles.title}>{rankTitle}</p>
      </div>
      <div className={styles.foot}>
        {settingsLabel && settings.length > 0 && (
          <>
            <Divider label={settingsLabel} flush />
            {settings.map((setting) => (
              <div key={setting.label} className={styles.setting}>
                <span className={styles.label}>{setting.label}</span>
                <span className={setting.fill ? styles.fill : styles.control}>
                  {setting.control}
                </span>
              </div>
            ))}
          </>
        )}
        {disconnect}
        <p className={styles.cycle}>
          {readCycle.map((part, index) => (
            <span key={index} className={part.strong ? styles.strong : undefined}>
              {part.text}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
