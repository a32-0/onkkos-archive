import Link from "next/link";

import { SUMMARY } from "@/content/catch-up";
import { VOICE } from "@/content/voice";
import { Button } from "@/ui/Button/Button";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";

import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import type { SummaryAction, SummaryCardView, SummarySection, SummaryUpdate } from "./state";
import styles from "./Summary.module.css";
import { SummaryCard } from "./SummaryCard";
import { SummaryGroups } from "./SummaryGroups";

export function Summary({
  chrome,
  onboarding,
  card,
  updates,
  sections,
  month,
  choose,
  skip,
}: {
  chrome: ShellChrome;
  onboarding: boolean;
  card: SummaryCardView;
  updates: readonly SummaryUpdate[];
  sections: readonly SummarySection[];
  month: string;
  choose: SummaryAction;
  skip: string;
}) {
  const empty = sections.length === 0;
  return (
    <Shell chrome={chrome} tab="resume" tabs={!onboarding}>
      <div className={styles.page}>
        <div className={styles.column}>
          <div className={styles.intro}>
            <h1 className={styles.title}>{SUMMARY.title}</h1>
            {!empty && <p className={styles.lead}>{SUMMARY.lead}</p>}
          </div>
          <SummaryCard
            card={card}
            updates={updates}
            step={onboarding ? "resume" : null}
            choose={choose}
          />
          {empty && (
            <EmptyState
              icon="hourglass"
              title={SUMMARY.nothingNew(month)}
              line={SUMMARY.nothingNewLine}
            />
          )}
        </div>

        {!empty && (
          <div className={styles.area}>
            <SummaryGroups sections={sections} />
          </div>
        )}

        <div className={styles.foot}>
          {chrome.voice.on && <OnkkoLine place="bottom" line={VOICE.summary} />}
          <Button variant="secondary" href={skip} link={Link}>
            {SUMMARY.skip}
          </Button>
        </div>
      </div>
    </Shell>
  );
}
