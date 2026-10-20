"use client";

import Link from "next/link";
import { useState } from "react";

import { ITEM } from "@/content/item";
import { MAP } from "@/content/system";
import { VOICE } from "@/content/voice";
import type { ItemView } from "@/routes";
import { ControlRow } from "@/ui/ControlRow/ControlRow";
import { Divider } from "@/ui/Divider/Divider";
import { ItemHero } from "@/ui/ItemHero/ItemHero";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { PlaceCrumb } from "@/ui/PlaceCrumb/PlaceCrumb";
import { Segmented, type SegmentedOption } from "@/ui/Segmented/Segmented";
import { SummaryRow } from "@/ui/SummaryRow/SummaryRow";

import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import { Steps, type Ticks } from "./steps/Steps";
import styles from "./Item.module.css";
import type { ItemPageView } from "./state";

const VIEWS: readonly [SegmentedOption, SegmentedOption] = [
  { value: "summary", label: ITEM.summary },
  { value: "steps", label: ITEM.steps },
];

function isView(value: string): value is ItemView {
  return VIEWS.some((option) => option.value === value);
}

export function ItemScreen({
  chrome,
  page,
  ticks,
}: {
  chrome: ShellChrome;
  page: ItemPageView;
  ticks: Ticks;
}) {
  const [view, setView] = useState<ItemView>(page.view);
  const choose = (value: string) => {
    if (!isView(value)) return;
    setView(value);
    window.history.replaceState(null, "", page.hrefs[value]);
  };
  return (
    <Shell chrome={chrome} tab={page.tab} tabs bar={{ title: page.title, back: page.back }}>
      <div className={styles.page}>
        <div className={styles.head}>
          {chrome.voice.on && (
            <OnkkoLine place="top" line={page.owned ? VOICE.itemOwned : VOICE.item} />
          )}
          {page.crumb && (
            <PlaceCrumb
              href={page.crumb.href}
              label={MAP.youreOn}
              place={page.crumb.place}
              art={null}
              orb={page.crumb.orb}
              link={Link}
            />
          )}
          <ItemHero kicker={page.kicker} name={page.name} art={page.art} state={page.hero} />
        </div>
        <div className={styles.body}>
          <ControlRow label={ITEM.view}>
            <Segmented label={ITEM.view} options={VIEWS} chosen={view} onChoose={choose} />
          </ControlRow>
          {view === "summary" && (
            <div className={styles.sections}>
              {page.sections.map((section) => (
                <section key={section.id} className={styles.section}>
                  <Divider label={section.title} />
                  <div className={styles.card}>
                    {section.rows.map((row) => (
                      <SummaryRow
                        key={row.key}
                        href={row.href}
                        name={row.name}
                        reading={row.reading || undefined}
                        place={row.place || undefined}
                        art={row.art}
                        compact
                        {...(row.blueprint !== undefined && { blueprint: row.blueprint })}
                        link={Link}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          {view === "steps" && <Steps view={page.steps} ticks={ticks} />}
        </div>
      </div>
    </Shell>
  );
}
