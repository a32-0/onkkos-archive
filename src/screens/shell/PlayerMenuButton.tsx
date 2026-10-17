"use client";

import { useState, useTransition } from "react";

import { APP } from "@/content/app";
import { SHELL } from "@/content/nav";
import { Button } from "@/ui/Button/Button";
import { PlayerChip } from "@/ui/PlayerChip/PlayerChip";
import { PlayerMenu, type ReadCyclePart } from "@/ui/PlayerMenu/PlayerMenu";
import { Segmented } from "@/ui/Segmented/Segmented";
import { Sheet } from "@/ui/Sheet/Sheet";

import type { OnkkoVoice } from "./voice";

export function PlayerMenuButton({
  name,
  avatar,
  masteryRank,
  readCycle,
  voice,
  disconnect,
  setOnkko,
}: {
  name: string;
  avatar: string | null;
  masteryRank: number;
  readCycle: readonly ReadCyclePart[];
  voice: OnkkoVoice;
  disconnect: () => Promise<void>;
  setOnkko: (form: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [onkko, setChoice] = useState(voice.on ? "on" : "off");
  const [, start] = useTransition();
  const choose = (value: string) => {
    setChoice(value);
    const form = new FormData();
    form.set("onkko", value);
    start(() => setOnkko(form));
  };
  return (
    <>
      <PlayerChip name={name} avatar={avatar} open={open} onClick={() => setOpen(!open)} />
      <Sheet
        label={SHELL.playerMenu}
        wordmark={APP.name}
        closeLabel={SHELL.close}
        open={open}
        onClose={() => setOpen(false)}
      >
        <PlayerMenu
          name={name}
          avatar={avatar}
          rank={SHELL.masteryRank(masteryRank)}
          rankTitle={SHELL.rankTitle(masteryRank)}
          settingsLabel={SHELL.settings}
          settings={[
            {
              label: SHELL.language,
              control: (
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
              ),
            },
            ...(voice.met
              ? [
                  {
                    label: SHELL.onkko,
                    control: (
                      <Segmented
                        label={SHELL.onkko}
                        options={[
                          { value: "on", label: SHELL.on },
                          { value: "off", label: SHELL.off },
                        ]}
                        chosen={onkko}
                        onChoose={choose}
                      />
                    ),
                  },
                ]
              : []),
            {
              label: SHELL.tutorial,
              fill: true,
              control: (
                <Button variant="secondary" disabled>
                  {SHELL.reset}
                </Button>
              ),
            },
          ]}
          disconnect={
            <form action={disconnect}>
              <Button variant="danger" type="submit">
                {SHELL.disconnect}
              </Button>
            </form>
          }
          readCycle={readCycle}
        />
      </Sheet>
    </>
  );
}
