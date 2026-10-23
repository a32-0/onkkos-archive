"use client";

import { useState, useTransition } from "react";

import { SHELL } from "@/content/nav";
import type { UpdateState } from "@/domain/types/update-state";
import { Button } from "@/ui/Button/Button";
import { ControlRow } from "@/ui/ControlRow/ControlRow";
import { Divider } from "@/ui/Divider/Divider";
import { List, ListEntry } from "@/ui/List/List";
import { Segmented } from "@/ui/Segmented/Segmented";

import styles from "./Profile.module.css";
import { readCycle, useLocalTime } from "./read-cycle";
import { Shell } from "./Shell";
import type { ShellTab } from "./tabs";
import type { ShellChrome } from "./voice";

function updateLine(update: UpdateState): string {
  if (update.state === "current") return SHELL.upToDate;
  if (update.state === "downloading") return SHELL.downloading(update.version);
  if (update.state === "ready") return SHELL.installsOnClose(update.version);
  return SHELL.unreachable;
}

export function Profile({
  chrome,
  tab,
  back,
  version = null,
  check,
}: {
  chrome: ShellChrome;
  tab: ShellTab | null;
  back: string;
  version?: string | null;
  check?: () => Promise<UpdateState>;
}) {
  const { player, voice, disconnect, setOnkko } = chrome;
  const [onkko, setChoice] = useState(voice.on ? "on" : "off");
  const local = useLocalTime(player.nextReadAt);
  const [, start] = useTransition();
  const [update, setUpdate] = useState<UpdateState | null>(null);
  const [checking, startCheck] = useTransition();
  const ask = () => {
    if (!check) return;
    startCheck(async () => {
      const answer = await check();
      startCheck(() => setUpdate(answer));
    });
  };
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
          <Divider label={SHELL.settings} />
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
              <ControlRow label={SHELL.tutorial} action>
                <Button variant="secondary" disabled>
                  {SHELL.reset}
                </Button>
              </ControlRow>
            </ListEntry>
          </List>
        </section>
        {version && (
          <section className={styles.settings}>
            <Divider label={SHELL.about} />
            <List label={SHELL.about}>
              <ListEntry>
                <ControlRow label={SHELL.version}>
                  <span className={styles.version}>{version}</span>
                </ControlRow>
              </ListEntry>
              <ListEntry>
                {update ? (
                  <ControlRow label={SHELL.updates}>
                    <span className={styles.version} role="status">
                      {updateLine(update)}
                    </span>
                  </ControlRow>
                ) : (
                  <ControlRow label={SHELL.updates} action>
                    <Button variant="secondary" loading={checking} disabled={!check} onClick={ask}>
                      {checking ? SHELL.checking : SHELL.check}
                    </Button>
                  </ControlRow>
                )}
              </ListEntry>
            </List>
          </section>
        )}
        <div className={styles.foot}>
          <form action={disconnect}>
            <Button variant="danger" type="submit">
              {SHELL.disconnect}
            </Button>
          </form>
          <p className={styles.cycle}>
            {readCycle(player, local).map((part, index) => (
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
