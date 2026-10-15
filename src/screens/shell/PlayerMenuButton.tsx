"use client";

import { useState } from "react";

import { APP } from "@/content/app";
import { SHELL } from "@/content/nav";
import { Button } from "@/ui/Button/Button";
import { PlayerChip } from "@/ui/PlayerChip/PlayerChip";
import { PlayerMenu, type ReadCyclePart } from "@/ui/PlayerMenu/PlayerMenu";
import { Sheet } from "@/ui/Sheet/Sheet";

export function PlayerMenuButton({
  name,
  masteryRank,
  readCycle,
  disconnect,
}: {
  name: string;
  masteryRank: number;
  readCycle: readonly ReadCyclePart[];
  disconnect: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PlayerChip name={name} open={open} onClick={() => setOpen(!open)} />
      <Sheet
        label={SHELL.playerMenu}
        wordmark={APP.name}
        closeLabel={SHELL.close}
        open={open}
        onClose={() => setOpen(false)}
      >
        <PlayerMenu
          name={name}
          rank={SHELL.masteryRank(masteryRank)}
          rankTitle={SHELL.rankTitle(masteryRank)}
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
