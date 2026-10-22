"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useOptimistic, useState, useTransition } from "react";

import { ADVANCED } from "@/content/search";
import { Button } from "@/ui/Button/Button";
import { Checkbox } from "@/ui/Checkbox/Checkbox";
import { Divider } from "@/ui/Divider/Divider";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { FilterChip } from "@/ui/FilterChip/FilterChip";
import { Icon } from "@/ui/Icon/Icon";
import { ResultList } from "@/ui/ResultList/ResultList";
import { SearchField } from "@/ui/SearchField/SearchField";

import type { Standing } from "../goals/state";
import styles from "./Search.module.css";
import type { SearchFilters, SearchPageView, TypeGroup } from "./state";
import { chosen, cleared, PAGE, searchHref, toggledType, TYPE_GROUPS } from "./view";

const WAIT_MS = 250;
const STATES: readonly (Standing | null)[] = [null, "absent", "ranked", "done"];

export function SearchPanel({
  filters: current,
  page,
}: {
  filters: SearchFilters;
  page: SearchPageView;
}) {
  const router = useRouter();
  const ids = useId();
  const [busy, start] = useTransition();
  const [filters, setFilters] = useOptimistic(current);
  const [term, setTerm] = useState(current.term);
  const on = chosen(filters);
  const [open, setOpen] = useState(on.length === 0);

  const go = (next: SearchFilters) =>
    start(() => {
      setFilters(next);
      router.replace(searchHref(next), { scroll: false });
    });

  useEffect(() => {
    if (term === current.term) return;
    const timer = setTimeout(() => go({ ...filters, term, shown: PAGE }), WAIT_MS);
    return () => clearTimeout(timer);
  });

  const stateLabel = (state: Standing | null) =>
    state === null ? ADVANCED.states.all : ADVANCED.states[state];

  return (
    <div className={styles.panel}>
      <div className={styles.field}>
        <SearchField
          label={ADVANCED.label}
          placeholder={ADVANCED.placeholder}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
      </div>

      <section className={open ? styles.filters : styles.folded} aria-labelledby={`${ids}-title`}>
        <div className={styles.head}>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={`${ids}-body`}
            onClick={() => setOpen(!open)}
          >
            <span className={styles.headline}>
              <span id={`${ids}-title`} className={styles.title}>
                {ADVANCED.filters}
              </span>
              {on.length > 0 && <span className={styles.badge}>{ADVANCED.on(on.length)}</span>}
            </span>
            {!open && on.length > 0 && <span className={styles.supporting}>{on.join(", ")}</span>}
            <span className={open ? styles.up : styles.down}>
              <Icon name="chevron-backward" />
            </span>
          </button>
          {on.length > 0 && (
            <span className={styles.clear}>
              <Button variant="text" onClick={() => go(cleared(filters))}>
                {ADVANCED.clear}
              </Button>
            </span>
          )}
        </div>

        <div id={`${ids}-body`} className={styles.body}>
          <div role="group" aria-labelledby={`${ids}-type`} className={styles.group}>
            <span id={`${ids}-type`} className={styles.label}>
              {ADVANCED.type}
            </span>
            <div className={styles.chips}>
              {(Object.keys(TYPE_GROUPS) as TypeGroup[]).map((group) => (
                <FilterChip
                  key={group}
                  label={ADVANCED.types[group]}
                  pressed={filters.types.includes(group)}
                  onToggle={() => go(toggledType(filters, group))}
                />
              ))}
            </div>
          </div>

          <div role="group" aria-labelledby={`${ids}-state`} className={styles.group}>
            <span id={`${ids}-state`} className={styles.label}>
              {ADVANCED.state}
            </span>
            <div className={styles.chips}>
              {STATES.map((state) => (
                <FilterChip
                  key={state ?? "all"}
                  label={stateLabel(state)}
                  pressed={filters.state === state}
                  onToggle={() => go({ ...filters, state, shown: PAGE })}
                />
              ))}
            </div>
          </div>

          <div className={styles.toggles}>
            <label className={styles.check}>
              <Checkbox
                label={ADVANCED.reach}
                checked={filters.reach}
                onChange={() => go({ ...filters, reach: !filters.reach, shown: PAGE })}
              />
              <span aria-hidden>{ADVANCED.reach}</span>
            </label>
            <label className={styles.check}>
              <Checkbox
                label={ADVANCED.vaulted}
                checked={filters.vaulted}
                onChange={() => go({ ...filters, vaulted: !filters.vaulted, shown: PAGE })}
              />
              <span aria-hidden>{ADVANCED.vaulted}</span>
            </label>
          </div>
        </div>
      </section>

      <div className={styles.results} aria-busy={busy || undefined}>
        {page.total === 0 ? (
          <EmptyState icon="auto-stories" title={ADVANCED.empty.title} line={ADVANCED.empty.line} />
        ) : (
          <>
            <Divider label={ADVANCED.count(page.total)} />
            <ResultList label={ADVANCED.results} items={page.rows} link={Link} />
            {page.more && (
              <Button
                variant="text"
                onClick={() => go({ ...filters, term, shown: filters.shown + PAGE })}
              >
                {ADVANCED.more}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
