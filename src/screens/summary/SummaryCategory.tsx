"use client";

import { useState } from "react";

import { SUMMARY } from "@/content/catch-up";
import { VOICE } from "@/content/voice";
import { catchUpCategoryRoute } from "@/routes";
import { ControlRow } from "@/ui/ControlRow/ControlRow";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { List, ListEntry } from "@/ui/List/List";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { Segmented, type SegmentedOption } from "@/ui/Segmented/Segmented";
import { SummaryRow } from "@/ui/SummaryRow/SummaryRow";

import { Link } from "../shell/Link";
import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import type { SummaryGroup, SummaryLens } from "./state";
import styles from "./Summary.module.css";

const LENSES: readonly [SegmentedOption, SegmentedOption] = [
  { value: "left", label: SUMMARY.toGet },
  { value: "mastered", label: SUMMARY.mastered },
];

export function SummaryCategory({
  chrome,
  onboarding,
  group,
  back,
  initial,
}: {
  chrome: ShellChrome;
  onboarding: boolean;
  group: SummaryGroup;
  back: string;
  initial: SummaryLens;
}) {
  const [lens, setLens] = useState<SummaryLens>(group.lenses ? initial : "left");
  const choose = (value: string) => {
    const next: SummaryLens = value === "mastered" ? "mastered" : "left";
    setLens(next);
    const step = onboarding ? "summary" : null;
    window.history.replaceState(null, "", catchUpCategoryRoute(group.key, step, next));
  };
  const tiles = group.lenses
    ? group.tiles.filter((tile) => tile.mastered === (lens === "mastered"))
    : group.tiles;
  const more = lens === "left" ? group.more : null;
  return (
    <Shell chrome={chrome} tab="resume" tabs={!onboarding} bar={{ title: group.name, back }}>
      <div className={styles.page}>
        <div className={styles.intro}>
          {chrome.voice.on && <OnkkoLine place="top" line={VOICE.summary} />}
          <p className={styles.lead}>{SUMMARY.categoryLead}</p>
        </div>
        {group.lenses && (
          <ControlRow label={SUMMARY.view}>
            <Segmented label={SUMMARY.view} options={LENSES} chosen={lens} onChoose={choose} />
          </ControlRow>
        )}
        {tiles.length === 0 && !more && group.lenses ? (
          <EmptyState
            icon="explore"
            title={group.empty[lens].title}
            line={group.empty[lens].line}
          />
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
        {more && (
          <EmptyState
            icon="auto-stories"
            title={tiles.length > 0 ? more.title : more.whole}
            line={more.line}
          />
        )}
      </div>
    </Shell>
  );
}
