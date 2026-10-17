import { MAP } from "@/content/system";
import { VOICE } from "@/content/voice";
import { MoreLine } from "@/ui/MoreLine/MoreLine";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { SystemRow } from "@/ui/SystemRow/SystemRow";

import styles from "./Map.module.css";
import type { SystemRowView } from "./state";

const SYSTEM_HASH = "#system-";

export function SystemList({
  systems,
  more,
  chosen,
  onChoose,
  voice,
}: {
  systems: readonly SystemRowView[];
  more: string | null;
  chosen: string;
  onChoose: (system: string) => void;
  voice: boolean;
}) {
  return (
    <div
      className={styles.list}
      onClick={(event) => {
        const anchor = (event.target as HTMLElement).closest("a");
        const hash = anchor?.getAttribute("href") ?? "";
        if (!hash.startsWith(SYSTEM_HASH)) return;
        event.preventDefault();
        onChoose(hash.slice(SYSTEM_HASH.length));
      }}
    >
      <div className={styles.intro}>
        <h2 className={styles.title}>{MAP.chooseSystem}</h2>
        <p className={styles.lead}>{MAP.switchAnyTime}</p>
      </div>
      <div className={styles.rows}>
        {systems.map((system) => (
          <SystemRow
            key={system.id}
            href={`${SYSTEM_HASH}${system.id}`}
            name={system.name}
            orb={system.orb}
            satellite={system.satellite}
            count={system.count}
            mastered={system.mastered}
            startHere={system.startHere}
            soon={system.soon}
            onView={system.id === chosen}
          />
        ))}
      </div>
      {more && <MoreLine text={more} />}
      {voice && <OnkkoLine place="bottom" line={VOICE.farewell} />}
    </div>
  );
}
