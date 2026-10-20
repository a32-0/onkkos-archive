"use client";

import Link from "next/link";
import { useState } from "react";

import { MAP } from "@/content/system";
import { VOICE } from "@/content/voice";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { fit } from "@/ui/fit";
import { Icon } from "@/ui/Icon/Icon";
import { List, ListEntry } from "@/ui/List/List";
import { MoreLine } from "@/ui/MoreLine/MoreLine";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { Orb } from "@/ui/Orb/Orb";
import { PlaceRow } from "@/ui/PlaceRow/PlaceRow";
import { SearchField } from "@/ui/SearchField/SearchField";

import styles from "./Map.module.css";
import type { PlaceListSystem } from "./state";

export function PlaceList({
  system,
  systemsHref,
  voice,
}: {
  system: PlaceListSystem;
  systemsHref: string;
  voice: boolean;
}) {
  const [query, setQuery] = useState("");
  const typed = query.trim().toLowerCase();
  const rows = typed
    ? system.rows.filter((row) => row.name.toLowerCase().includes(typed))
    : system.rows.filter((row) => row.listed);

  return (
    <div className={styles.list}>
      <div className={styles.intro}>
        {voice && <OnkkoLine place="top" line={VOICE.farewell} />}
        <h2 className={styles["place-title"]}>{MAP.chooseLocation}</h2>
        <p className={styles.lead}>{MAP.switchAnyTime}</p>
      </div>
      <Link href={systemsHref} className={styles.system}>
        <Orb color={system.orb} size="s" />
        <span className={styles["system-text"]}>
          <span className={styles["system-kicker"]}>{MAP.changeSystem}</span>
          <span className={styles["system-name"]} style={fit(system.name)}>
            {system.name}
          </span>
        </span>
        <span className={styles.chevron}>
          <Icon name="chevron-backward" />
        </span>
      </Link>
      <SearchField
        label={MAP.searchLabel}
        placeholder={MAP.search}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {rows.length === 0 ? (
        <EmptyState
          icon="explore"
          title={MAP.noPlace}
          line={MAP.noPlaceLine(system.name, query.trim())}
        />
      ) : (
        <List label={system.name}>
          {rows.map((row) => (
            <ListEntry key={row.name}>
              <PlaceRow
                href={row.href}
                name={row.name}
                orb={row.orb}
                count={row.count}
                mastered={row.mastered}
                startHere={row.startHere}
                isNew={row.isNew}
                gap={row.gap}
                onView={row.onView}
                link={Link}
              />
            </ListEntry>
          ))}
        </List>
      )}
      {!typed && system.more && <MoreLine text={system.more} />}
    </div>
  );
}
