"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { GOALS } from "@/content/goals";
import { ADVANCED } from "@/content/search";
import { advancedRoute, searchRoute } from "@/routes";
import { Button } from "@/ui/Button/Button";
import { SearchField } from "@/ui/SearchField/SearchField";
import { nextActive, optionId, SuggestionList } from "@/ui/SuggestionList/SuggestionList";

import styles from "./Goals.module.css";
import type { SearchRow } from "./state";

const LIST = "goal-targets";
const MIN_TERM = 2;
const WAIT_MS = 150;

export function GoalSearch() {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<{ term: string; rows: SearchRow[] } | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const term = query.trim();
  const searching = term.length >= MIN_TERM;

  useEffect(() => {
    if (!searching) return;
    const abort = new AbortController();
    const timer = setTimeout(() => {
      fetch(searchRoute(term), { signal: abort.signal })
        .then((response) => (response.ok ? response.json() : { results: [] }))
        .then((body: { results: SearchRow[] }) => {
          setFound({ term, rows: body.results });
          setActive(0);
          const first = body.results[0];
          if (pending.current === term && first) router.push(first.href);
          pending.current = null;
        })
        .catch(() => undefined);
    }, WAIT_MS);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [term, searching, router]);

  useEffect(() => {
    const away = (event: PointerEvent) => {
      if (event.target instanceof Node && !box.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, []);

  const rows = searching && found ? found.rows : null;
  const current = found?.term === term ? rows : null;
  const shown = open && rows !== null;
  const go = (row: SearchRow | undefined) => {
    if (row) router.push(row.href);
    else if (searching && current === null) pending.current = term;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      go(current?.[active] ?? current?.[0]);
      return;
    }
    const next = nextActive(event.key, active, rows?.length ?? 0);
    if (next === null) return;
    event.preventDefault();
    setOpen(true);
    setActive(next);
  };

  return (
    <div ref={box} className={styles.search}>
      <SearchField
        label={GOALS.search.label}
        placeholder={GOALS.search.placeholder}
        value={query}
        listId={LIST}
        aria-activedescendant={shown && rows.length > 0 ? optionId(LIST, active) : undefined}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!(event.relatedTarget && box.current?.contains(event.relatedTarget))) setOpen(false);
        }}
        onKeyDown={onKeyDown}
        suggestions={
          shown ? (
            <SuggestionList
              id={LIST}
              label={GOALS.search.list}
              items={rows}
              active={active}
              empty={GOALS.search.noMatch}
              onChoose={(value) => go(rows.find((row) => row.value === value))}
            />
          ) : undefined
        }
      />
      <Button onClick={() => go(current?.[0])}>{GOALS.search.continue}</Button>
      <Button variant="text" href={advancedRoute({ q: term || null })} link={Link}>
        {ADVANCED.open}
      </Button>
    </div>
  );
}
