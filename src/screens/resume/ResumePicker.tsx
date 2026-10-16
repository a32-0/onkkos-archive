"use client";

import { useState, useSyncExternalStore, useTransition } from "react";

import { RESUME } from "@/content/catch-up";
import { DateMenu } from "@/ui/DateMenu/DateMenu";
import { SearchField } from "@/ui/SearchField/SearchField";
import { ShowMore } from "@/ui/ShowMore/ShowMore";
import { UpdateCard } from "@/ui/UpdateCard/UpdateCard";

import styles from "./Resume.module.css";
import type { ResumeAction, ResumeMonth, ResumeUpdate } from "./state";

const FIRST = 5;
const MORE = 5;
const MORE_WIDE = 10;
const WIDE = "(min-width: 840px)";

function matches(update: ResumeUpdate, query: string): boolean {
  const name = update.name.toLowerCase();
  const dates = update.dates.map((date) => date.toLowerCase());
  const rest = query
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((word) => word.length > 0)
    .filter(
      (word) =>
        !name.includes(word) && !update.versions.some((version) => version.startsWith(word)),
    );
  return rest.length === 0 || dates.some((date) => rest.every((word) => date.includes(word)));
}

function watchWide(change: () => void): () => void {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}

function useWide(): boolean {
  return useSyncExternalStore(
    watchWide,
    () => window.matchMedia(WIDE).matches,
    () => false,
  );
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
  const [shown, setShown] = useState(FIRST);
  const [dating, setDating] = useState(false);
  const [, start] = useTransition();
  const more = useWide() ? MORE_WIDE : MORE;

  const found = updates.filter((update) => matches(update, query));
  const listed = found.slice(0, shown);
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
            onChange={(event) => {
              setQuery(event.target.value);
              setShown(FIRST);
            }}
          />
        </div>
        <DateMenu
          label={RESUME.date}
          heading={RESUME.monthHeading}
          months={months}
          open={dating}
          menuId="resume-date"
          onToggle={() => setDating(!dating)}
          onChoose={send}
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
      {hidden > 0 && (
        <ShowMore
          label={RESUME.more(Math.min(more, hidden))}
          onClick={() => setShown(shown + more)}
        />
      )}
    </>
  );
}
