import Link from "next/link";
import type { ReactNode } from "react";

import { APP } from "@/content/app";
import { NAV } from "@/content/nav";
import { Header } from "@/ui/Header/Header";
import { TabBar } from "@/ui/TabBar/TabBar";

import { PlayerMenuButton } from "./PlayerMenuButton";
import { readCycle, type ShellPlayer } from "./read-cycle";
import styles from "./Shell.module.css";
import { tabItems, type ShellTab } from "./tabs";

export function Shell({
  player,
  tab,
  tabs,
  disconnect,
  children,
}: {
  player: ShellPlayer;
  tab: ShellTab | null;
  tabs: boolean;
  disconnect: () => Promise<void>;
  children: ReactNode;
}) {
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
              masteryRank={player.masteryRank}
              readCycle={readCycle(player)}
              disconnect={disconnect}
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
