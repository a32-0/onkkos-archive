"use client";

import { useState, useTransition } from "react";

import { SHELL } from "@/content/nav";
import { Button } from "@/ui/Button/Button";
import { ControlRow } from "@/ui/ControlRow/ControlRow";
import { Divider } from "@/ui/Divider/Divider";
import { List, ListEntry } from "@/ui/List/List";
import { Segmented } from "@/ui/Segmented/Segmented";

import styles from "./Profile.module.css";
import { readCycle } from "./read-cycle";
import { Shell } from "./Shell";
import type { ShellTab } from "./tabs";
import type { ShellChrome } from "./voice";

export function Profile({
  chrome,
  tab,
  back,
}: {
  chrome: ShellChrome;
  tab: ShellTab | null;
  back: string;
}) {
  const { player, voice, disconnect, setOnkko } = chrome;
  const [onkko, setChoice] = useState(voice.on ? "on" : "off");
  const [, start] = useTransition();
  const choose = (value: string) => {
    setChoice(value);
    const form = new FormData();
    form.set("onkko", value);
    start(() => setOnkko(form));
  };

  return (
    <Shell chrome={chrome} tab={tab} tabs bar={{ title: SHELL.profile, back }}>
      <div className={styles.page}>
        <div className={styles.player}>
          {player.avatar ? (
            <img className={styles.glyph} src={player.avatar} alt="" />
          ) : (
            <span className={styles.avatar} aria-hidden />
          )}
          <p className={styles.name}>{player.name}</p>
          <div className={styles.rank}>
            <p className={styles.figure}>{SHELL.masteryRank(player.masteryRank)}</p>
            <p className={styles.caption}>{SHELL.rankTitle(player.masteryRank)}</p>
          </div>
        </div>
        <section className={styles.settings}>
          <Divider label={SHELL.settings} flush />
          <List label={SHELL.settings}>
            <ListEntry>
              <ControlRow label={SHELL.language}>
                <Segmented
                  label={SHELL.language}
                  options={[
                    { value: "en", label: SHELL.english },
                    { value: "es", label: SHELL.spanish },
                  ]}
                  chosen="en"
                  onChoose={() => {}}
                  disabled
                />
              </ControlRow>
            </ListEntry>
            {voice.met && (
              <ListEntry>
                <ControlRow label={SHELL.onkko}>
                  <Segmented
                    label={SHELL.onkko}
                    options={[
                      { value: "on", label: SHELL.on },
                      { value: "off", label: SHELL.off },
                    ]}
                    chosen={onkko}
                    onChoose={choose}
                  />
                </ControlRow>
              </ListEntry>
            )}
            <ListEntry>
              <ControlRow label={SHELL.tutorial} fill>
                <Button variant="secondary" disabled>
                  {SHELL.reset}
                </Button>
              </ControlRow>
            </ListEntry>
          </List>
        </section>
        <div className={styles.foot}>
          <form action={disconnect}>
            <Button variant="danger" type="submit">
              {SHELL.disconnect}
            </Button>
          </form>
          <p className={styles.cycle}>
            {readCycle(player).map((part, index) => (
              <span key={index} className={part.strong ? styles.strong : undefined}>
                {part.text}
              </span>
            ))}
          </p>
        </div>
      </div>
    </Shell>
  );
}
