import Link from "next/link";

import { MAP } from "@/content/system";
import { VOICE } from "@/content/voice";
import { placesRoute } from "@/routes";
import { List, ListEntry } from "@/ui/List/List";
import { MoreLine } from "@/ui/MoreLine/MoreLine";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { SystemRow } from "@/ui/SystemRow/SystemRow";

import styles from "./Map.module.css";
import type { SystemRowView } from "./state";

export function SystemList({
  systems,
  more,
  chosen,
  system,
  place,
  voice,
}: {
  systems: readonly SystemRowView[];
  more: string | null;
  chosen: string;
  system: string;
  place: string;
  voice: boolean;
}) {
  return (
    <div className={styles.list}>
      <div className={styles.intro}>
        {voice && <OnkkoLine place="top" line={VOICE.farewell} />}
        <h2 className={styles.title}>{MAP.chooseSystem}</h2>
        <p className={styles.lead}>{MAP.switchAnyTime}</p>
      </div>
      <List label={MAP.systems}>
        {systems.map((row) => (
          <ListEntry key={row.id}>
            <SystemRow
              href={placesRoute(system, place, row.id)}
              name={row.name}
              orb={row.orb}
              satellite={row.satellite}
              count={row.count}
              mastered={row.mastered}
              startHere={row.startHere}
              soon={row.soon}
              onView={row.id === chosen}
              link={Link}
            />
          </ListEntry>
        ))}
      </List>
      {more && <MoreLine text={more} />}
    </div>
  );
}
