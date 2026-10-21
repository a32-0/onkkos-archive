"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { MAP } from "@/content/system";
import { VOICE } from "@/content/voice";
import { mapCategoryRoute, placeRoute } from "@/routes";
import { ControlRow } from "@/ui/ControlRow/ControlRow";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { List, ListEntry } from "@/ui/List/List";
import { MoreLine } from "@/ui/MoreLine/MoreLine";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { PlaceCrumb } from "@/ui/PlaceCrumb/PlaceCrumb";
import { Segmented, type SegmentedOption } from "@/ui/Segmented/Segmented";
import { SummaryRow } from "@/ui/SummaryRow/SummaryRow";

import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import { nextLens, shownIn } from "./lens";
import styles from "./Map.module.css";
import type { Lens, MapGroupView } from "./state";

const TO_GET: SegmentedOption = { value: "left", label: MAP.toGet };
const MASTERED: SegmentedOption = { value: "mastered", label: MAP.mastered };
const NEW: SegmentedOption = { value: "new", label: MAP.new };

export function MapCategory({
  chrome,
  group,
  system,
  systemName,
  place,
  orb,
  newLens,
  empty,
  initial,
}: {
  chrome: ShellChrome;
  group: MapGroupView;
  system: string;
  systemName: string;
  place: string;
  orb: string | null;
  newLens: boolean;
  empty: Record<Lens, { title: string; line: string }>;
  initial: Lens;
}) {
  const kept = useSearchParams().get("view");
  const [lens, setLens] = useState<Lens>(() =>
    group.lenses && kept && (kept !== "new" || newLens) ? nextLens(initial, kept) : initial,
  );
  const choose = (value: string) => {
    const next = nextLens(lens, value);
    setLens(next);
    window.history.replaceState(null, "", mapCategoryRoute(group.key, system, place, next));
  };
  const { tiles, more } = shownIn(group, lens);
  const back = placeRoute(system, place);
  return (
    <Shell chrome={chrome} tab="navigation" tabs bar={{ title: group.name, back }}>
      <div className={styles.category}>
        {chrome.voice.on && <OnkkoLine place="top" line={VOICE.summary} />}
        <PlaceCrumb
          href={back}
          label={MAP.youreOn}
          place={MAP.crumb(systemName, place)}
          art={null}
          orb={orb}
          link={Link}
        />
        {group.lenses && (
          <ControlRow label={MAP.view}>
            <Segmented
              label={MAP.view}
              options={newLens ? [TO_GET, MASTERED, NEW] : [TO_GET, MASTERED]}
              chosen={lens}
              onChoose={choose}
            />
          </ControlRow>
        )}
        {tiles.length === 0 && !more ? (
          <EmptyState icon="explore" title={empty[lens].title} line={empty[lens].line} />
        ) : (
          tiles.length > 0 && (
            <List label={group.name}>
              {tiles.map((tile) => (
                <ListEntry key={tile.name}>
                  <SummaryRow
                    href={tile.href}
                    name={tile.name}
                    reading={tile.reading || undefined}
                    place={tile.place || undefined}
                    art={tile.art}
                    compact
                    link={Link}
                  />
                </ListEntry>
              ))}
            </List>
          )
        )}
        {more && <MoreLine text={more} />}
      </div>
    </Shell>
  );
}
