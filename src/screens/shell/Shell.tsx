import Link from "next/link";
import type { ReactNode } from "react";

import { APP } from "@/content/app";
import { NAV } from "@/content/nav";
import { Header } from "@/ui/Header/Header";
import { TabBar } from "@/ui/TabBar/TabBar";

import { PlayerMenuButton } from "./PlayerMenuButton";
import { readCycle } from "./read-cycle";
import styles from "./Shell.module.css";
import { tabItems, type ShellTab } from "./tabs";
import type { ShellChrome } from "./voice";

export function Shell({
  chrome,
  tab,
  tabs,
  children,
}: {
  chrome: ShellChrome;
  tab: ShellTab | null;
  tabs: boolean;
  children: ReactNode;
}) {
  const { player, voice, disconnect, setOnkko } = chrome;
  const items = tabItems(tab);
  return (
    <div className={styles.shell}>
      <div className={styles.top}>
        <Header
          variant="chip"
          wordmark={APP.name}
          chip={
            <PlayerMenuButton
              name={player.name}
              avatar={player.avatar}
              masteryRank={player.masteryRank}
              readCycle={readCycle(player)}
              voice={voice}
              disconnect={disconnect}
              setOnkko={setOnkko}
            />
          }
          tabs={
            tabs ? (
              <div className={styles.wide}>
                <TabBar label={NAV.label} items={items} placement="header" link={Link} />
              </div>
            ) : undefined
          }
        />
      </div>
      <main className={styles.main}>{children}</main>
      {tabs && (
        <div className={styles.bottom}>
          <TabBar label={NAV.label} items={items} placement="bottom" link={Link} />
        </div>
      )}
    </div>
  );
}
