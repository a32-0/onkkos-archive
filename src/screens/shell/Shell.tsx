import Link from "next/link";
import type { ReactNode } from "react";

import { APP } from "@/content/app";
import { NAV, SHELL } from "@/content/nav";
import { profileRoute } from "@/routes";
import { Header } from "@/ui/Header/Header";
import { PlayerChip } from "@/ui/PlayerChip/PlayerChip";
import { TabBar } from "@/ui/TabBar/TabBar";
import { TopBar } from "@/ui/TopBar/TopBar";

import styles from "./Shell.module.css";
import { tabItems, type ShellTab } from "./tabs";
import type { ShellChrome } from "./voice";

export interface ShellBar {
  title: string;
  back: string;
}

export function Shell({
  chrome,
  tab,
  tabs,
  bar,
  children,
}: {
  chrome: ShellChrome;
  tab: ShellTab | null;
  tabs: boolean;
  bar?: ShellBar;
  children: ReactNode;
}) {
  const { player } = chrome;
  const items = tabItems(tab);
  const wide = tabs ? (
    <div className={styles.wide}>
      <TabBar label={NAV.label} items={items} placement="header" link={Link} />
    </div>
  ) : undefined;
  return (
    <div className={styles.shell}>
      <div className={styles.top}>
        <div className={bar ? styles.desktop : undefined}>
          <Header
            variant="chip"
            wordmark={APP.name}
            chip={
              <PlayerChip
                href={profileRoute(tab)}
                name={player.name}
                avatar={player.avatar}
                link={Link}
              />
            }
            tabs={wide}
          />
        </div>
        {bar && <TopBar title={bar.title} back={bar.back} backLabel={SHELL.back} link={Link} />}
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
