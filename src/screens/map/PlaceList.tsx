import Link from "next/link";

import { MAP } from "@/content/system";
import { VOICE } from "@/content/voice";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { Icon } from "@/ui/Icon/Icon";
import { MoreLine } from "@/ui/MoreLine/MoreLine";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { PlaceRow } from "@/ui/PlaceRow/PlaceRow";
import { SearchField } from "@/ui/SearchField/SearchField";

import styles from "./Map.module.css";
import type { PlaceListSystem } from "./state";

export function PlaceList({
  system,
  query,
  onQuery,
  onSystems,
  voice,
}: {
  system: PlaceListSystem;
  query: string;
  onQuery: (query: string) => void;
  onSystems: () => void;
  voice: boolean;
}) {
  const typed = query.trim().toLowerCase();
  const rows = typed
    ? system.rows.filter((row) => row.name.toLowerCase().includes(typed))
    : system.rows.filter((row) => row.listed);

  return (
    <div className={styles.list}>
      <button type="button" className={styles.system} aria-haspopup="dialog" onClick={onSystems}>
        {system.art ? (
          <img className={styles.orb} src={system.art} alt="" />
        ) : (
          <span className={styles.orb} />
        )}
        <span className={styles["system-text"]}>
          <span className={styles["system-kicker"]}>{MAP.system}</span>
          <span className={styles["system-name"]}>{system.name}</span>
        </span>
        <span className={styles.chevron}>
          <Icon name="chevron-backward" />
        </span>
      </button>
      <SearchField
        label={MAP.searchLabel}
        placeholder={MAP.search}
        value={query}
        onChange={(event) => onQuery(event.target.value)}
      />
      {rows.length === 0 ? (
        <EmptyState
          icon="explore"
          title={MAP.noPlace}
          line={MAP.noPlaceLine(system.name, query.trim())}
        />
      ) : (
        <div className={styles.rows}>
          {rows.map((row) => (
            <PlaceRow
              key={row.name}
              href={row.href}
              name={row.name}
              art={row.art}
              count={row.count}
              mastered={row.mastered}
              startHere={row.startHere}
              isNew={row.isNew}
              gap={row.gap}
              onView={row.onView}
              link={Link}
            />
          ))}
        </div>
      )}
      {!typed && system.more.map((line) => <MoreLine key={line} text={line} />)}
      {voice && <OnkkoLine place="bottom" line={VOICE.farewell} />}
    </div>
  );
}
