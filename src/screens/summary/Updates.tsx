"use client";

import { useState } from "react";

import { RESUME, SUMMARY } from "@/content/catch-up";
import { VOICE } from "@/content/voice";
import { Button } from "@/ui/Button/Button";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { UpdateCard } from "@/ui/UpdateCard/UpdateCard";

import { FIRST, useMore } from "../resume/batches";
import { Shell } from "../shell/Shell";
import type { ShellTab } from "../shell/tabs";
import type { ShellChrome } from "../shell/voice";
import type { SummaryAction, SummaryUpdate } from "./state";
import styles from "./Summary.module.css";

export function Updates({
  chrome,
  tab,
  onboarding,
  updates,
  choose,
  back,
}: {
  chrome: ShellChrome;
  tab: ShellTab;
  onboarding: boolean;
  updates: readonly SummaryUpdate[];
  choose: SummaryAction;
  back: string;
}) {
  const [shown, setShown] = useState(FIRST);
  const more = useMore();
  const listed = updates.slice(0, shown);

  return (
    <Shell chrome={chrome} tab={tab} tabs={!onboarding} bar={{ title: SUMMARY.updates, back }}>
      <div className={styles.page}>
        <div className={styles.intro}>
          {chrome.voice.on && <OnkkoLine place="top" line={VOICE.summary} />}
          <p className={styles.lead}>{SUMMARY.updatesLead}</p>
        </div>
        <form action={choose} className={styles.cards}>
          {onboarding && <input type="hidden" name="step" value="resume" />}
          {listed.map((update) => (
            <UpdateCard
              key={update.version}
              field="since"
              value={update.value}
              name={update.name}
              meta={update.meta}
              art={update.art}
              {...(update.newest && { newest: RESUME.newest })}
            />
          ))}
        </form>
        {updates.length > listed.length && (
          <Button variant="text" onClick={() => setShown(shown + more)}>
            {RESUME.more}
          </Button>
        )}
      </div>
    </Shell>
  );
}
