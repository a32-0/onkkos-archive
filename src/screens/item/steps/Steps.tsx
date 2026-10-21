"use client";

import { Fragment, useId, useState } from "react";

import { STATES } from "@/content/states";
import { ComponentRow } from "@/ui/ComponentRow/ComponentRow";
import { Divider } from "@/ui/Divider/Divider";
import { RowDetail } from "@/ui/RowDetail/RowDetail";
import { RowProse } from "@/ui/RowProse/RowProse";
import { SectionHeader } from "@/ui/SectionHeader/SectionHeader";
import { StepRow } from "@/ui/StepRow/StepRow";
import { Timeline } from "@/ui/Timeline/Timeline";
import { WikiLink } from "@/ui/WikiLink/WikiLink";

import type { StepRowView, StepsView } from "./state";
import styles from "./Steps.module.css";

export interface Ticks {
  ticked: ReadonlySet<string>;
  tick: (id: string, on: boolean) => void;
}

export function tickableIds(view: StepsView): string[] {
  return view.blocks.flatMap((block) =>
    block.cards
      .filter((card) => card.checkable)
      .flatMap((card) => card.groups.flatMap((group) => group.rows.map((row) => row.id))),
  );
}

function RowBody({ row }: { row: StepRowView }) {
  const link = row.link && (
    <WikiLink href={row.link.href} label={row.link.label} target={row.link.target} />
  );
  const prose = row.prose !== null && row.prose.length > 0;
  return (
    <>
      {(row.detail !== null || (!prose && link)) && (
        <RowDetail text={row.detail ?? ""} link={prose ? undefined : link} />
      )}
      {prose && <RowProse paragraphs={row.prose ?? []} link={link} />}
    </>
  );
}

export function Steps({ view, ticks }: { view: StepsView; ticks: Ticks }) {
  const prefix = useId();
  const [flipped, setFlipped] = useState<ReadonlySet<string>>(new Set());
  const flip = (id: string) =>
    setFlipped((now) => {
      const next = new Set(now);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const open = (id: string) => !flipped.has(id);
  const bodyId = (id: string) => `${prefix}-${id.replace(/[^A-Za-z0-9]+/g, "-")}`;

  return (
    <div className={styles.steps}>
      {view.blocks.map((block) => (
        <section key={block.key} className={styles.block}>
          <Divider label={block.title} />
          {block.cards.map((card) => (
            <div key={card.key} id={card.anchor ?? undefined} className={styles.card}>
              {card.header && <SectionHeader title={card.header.title} art={card.header.art} />}
              {card.groups.map((group, index) => (
                <Fragment key={group.key}>
                  {index > 0 && <Divider />}
                  {card.checkable ? (
                    <div className={styles.components}>
                      {group.rows.map((row) => {
                        const ticked = ticks.ticked.has(row.id);
                        return (
                          <div key={row.id} id={row.anchor ?? undefined}>
                            <ComponentRow
                              title={row.title}
                              art={row.art ?? null}
                              ticked={ticked}
                              locked={row.locked}
                              status={row.locked ? STATES.locked : undefined}
                              open={ticked ? flipped.has(row.id) : open(row.id)}
                              bodyId={bodyId(row.id)}
                              onTick={(on) => {
                                ticks.tick(row.id, on);
                                setFlipped((now) => {
                                  const next = new Set(now);
                                  next.delete(row.id);
                                  return next;
                                });
                              }}
                              onToggle={() => flip(row.id)}
                            >
                              <RowBody row={row} />
                            </ComponentRow>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Timeline
                      steps={group.rows.map((row) => ({
                        id: row.id,
                        alternative: row.alternative,
                        content: (
                          <div id={row.anchor ?? undefined}>
                            <StepRow
                              title={row.title}
                              {...(row.art !== undefined && { art: row.art })}
                              best={row.best}
                              locked={row.locked}
                              status={row.locked ? STATES.locked : undefined}
                              open={open(row.id)}
                              bodyId={bodyId(row.id)}
                              onToggle={() => flip(row.id)}
                            >
                              <RowBody row={row} />
                            </StepRow>
                          </div>
                        ),
                      }))}
                    />
                  )}
                </Fragment>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
