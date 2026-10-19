"use client";

import { useState } from "react";

import { RESUME } from "@/content/catch-up";
import { Button } from "@/ui/Button/Button";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { SearchField } from "@/ui/SearchField/SearchField";
import { UpdateCard } from "@/ui/UpdateCard/UpdateCard";

import { FIRST, useMore } from "./batches";
import styles from "./Resume.module.css";
import type { ResumeAction, ResumeUpdate } from "./state";

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

export function ResumePicker({
  updates,
  step,
  choose,
}: {
  updates: readonly ResumeUpdate[];
  step: string | null;
  choose: ResumeAction;
}) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(FIRST);
  const more = useMore();

  const found = updates.filter((update) => matches(update, query));
  const listed = found.slice(0, shown);
  const hidden = found.length - listed.length;

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
      </div>
      {found.length === 0 ? (
        <EmptyState icon="hourglass" title={RESUME.noMatch} line={RESUME.noMatchLine} />
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
        <Button variant="text" onClick={() => setShown(shown + more)}>
          {RESUME.more}
        </Button>
      )}
    </>
  );
}
