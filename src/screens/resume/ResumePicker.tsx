"use client";

import { useState, useTransition } from "react";

import { RESUME } from "@/content/catch-up";
import { DateMenu } from "@/ui/DateMenu/DateMenu";
import { SearchField } from "@/ui/SearchField/SearchField";
import { ShowMore } from "@/ui/ShowMore/ShowMore";
import { UpdateCard } from "@/ui/UpdateCard/UpdateCard";

import styles from "./Resume.module.css";
import type { ResumeAction, ResumeMonth, ResumeUpdate } from "./state";

const SHOWN = 3;

function matches(update: ResumeUpdate, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return true;
  return update.name.toLowerCase().includes(needle) || update.version.startsWith(needle);
}

export function ResumePicker({
  updates,
  months,
  step,
  choose,
}: {
  updates: readonly ResumeUpdate[];
  months: readonly ResumeMonth[];
  step: string | null;
  choose: ResumeAction;
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [dating, setDating] = useState(false);
  const [, start] = useTransition();

  const found = updates.filter((update) => matches(update, query));
  const listed = expanded ? found : found.slice(0, SHOWN);
  const hidden = found.length - listed.length;

  const send = (since: string) => {
    const form = new FormData();
    form.set("since", since);
    if (step) form.set("step", step);
    start(() => choose(form));
  };

  return (
    <>
      <div className={styles.controls}>
        <div className={styles.search}>
          <SearchField
            label={RESUME.search}
            placeholder={RESUME.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <DateMenu
          label={RESUME.date}
          heading={RESUME.monthHeading}
          months={months}
          dayHeading={RESUME.dayHeading}
          dayPlaceholder={RESUME.dayPlaceholder}
          open={dating}
          menuId="resume-date"
          onToggle={() => setDating(!dating)}
          onChoose={send}
          onDay={send}
        />
      </div>
      {found.length === 0 ? (
        <p className={styles.empty}>{RESUME.noMatch}</p>
      ) : (
        <form action={choose} className={styles.cards}>
          {step && <input type="hidden" name="step" value={step} />}
          {listed.map((update) => (
            <UpdateCard
              key={update.version}
              field="since"
              value={update.since}
              name={update.name}
              meta={update.meta}
              art={update.art}
              newest={update.newest ? RESUME.newest : undefined}
            />
          ))}
        </form>
      )}
      {hidden > 0 && <ShowMore label={RESUME.more(hidden)} onClick={() => setExpanded(true)} />}
    </>
  );
}
