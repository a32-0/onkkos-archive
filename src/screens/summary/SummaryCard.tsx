"use client";

import { useState, useTransition } from "react";

import { RESUME } from "@/content/catch-up";
import { Button } from "@/ui/Button/Button";
import { FeaturedCard } from "@/ui/FeaturedCard/FeaturedCard";
import { UpdateList } from "@/ui/UpdateList/UpdateList";

import { FIRST, useMore } from "../resume/batches";
import type { SummaryAction, SummaryCardView, SummaryUpdate } from "./state";
import styles from "./Summary.module.css";

const LIST = "summary-updates";

export function SummaryCard({
  card,
  updates,
  step,
  choose,
}: {
  card: SummaryCardView;
  updates: readonly SummaryUpdate[];
  step: string | null;
  choose: SummaryAction;
}) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(FIRST);
  const [, start] = useTransition();
  const more = useMore();
  const listed = updates.slice(0, shown);
  const hidden = updates.length - listed.length;

  const close = () => {
    setOpen(false);
    setShown(FIRST);
  };
  const send = (since: string) => {
    const form = new FormData();
    form.set("since", since);
    if (step) form.set("step", step);
    close();
    start(() => choose(form));
  };

  return (
    <div
      className={styles.card}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") close();
      }}
    >
      {open && <div className={styles.scrim} aria-hidden="true" onClick={close} />}
      <div className={open ? styles.raised : styles.flat}>
        <FeaturedCard
          {...card}
          open={open}
          listId={LIST}
          onToggle={() => (open ? close() : setOpen(true))}
        />
        {open && (
          <div className={styles.list}>
            <UpdateList
              id={LIST}
              items={listed}
              onChoose={send}
              more={
                hidden > 0 && (
                  <Button variant="text" onClick={() => setShown(shown + more)}>
                    {RESUME.more}
                  </Button>
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
