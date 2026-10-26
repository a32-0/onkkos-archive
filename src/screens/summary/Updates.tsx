"use client";

import { useState } from "react";

import { RESUME, SUMMARY } from "@/content/catch-up";
import { VOICE } from "@/content/voice";
import { Button } from "@/ui/Button/Button";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { SearchField } from "@/ui/SearchField/SearchField";
import { UpdateCard } from "@/ui/UpdateCard/UpdateCard";

import { FIRST, MORE } from "../resume/batches";
import { matchesUpdate } from "../resume/state";
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
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(FIRST);
  const found = updates.filter((update) => matchesUpdate(update, query));
  const listed = found.slice(0, shown);

  return (
    <Shell chrome={chrome} tab={tab} tabs={!onboarding} bar={{ title: SUMMARY.updates, back }}>
      <div className={styles.page}>
        <div className={styles.intro}>
          {chrome.voice.on && <OnkkoLine place="top" line={VOICE.summary} />}
          <p className={styles.lead}>{SUMMARY.updatesLead}</p>
        </div>
        <SearchField
          label={RESUME.search}
          placeholder={RESUME.search}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setShown(FIRST);
          }}
        />
        {found.length === 0 ? (
          <EmptyState icon="hourglass" title={RESUME.noMatch} line={RESUME.noMatchLine} />
        ) : (
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
        )}
        {found.length > listed.length && (
          <Button variant="text" onClick={() => setShown(shown + MORE)}>
            {RESUME.more}
          </Button>
        )}
      </div>
    </Shell>
  );
}
