import Link from "next/link";
import type { ReactNode } from "react";

import { APP } from "@/content/app";
import { NAV, SHELL } from "@/content/nav";
import { TOUR } from "@/content/tour";
import { profileRoute } from "@/routes";
import { Header } from "@/ui/Header/Header";
import { PlayerChip } from "@/ui/PlayerChip/PlayerChip";
import { TabBar } from "@/ui/TabBar/TabBar";
import { TopBar } from "@/ui/TopBar/TopBar";

import { BackLink, Visit } from "./history";
import styles from "./Shell.module.css";
import { tabItems, type ShellTab } from "./tabs";
import { Tour, type TourStep } from "./Tour";
import type { ShellChrome } from "./voice";

export interface ShellBar {
  title: string;
  back: string;
}

function tourSteps(tab: ShellTab | null): TourStep[] {
  const tabs = tabItems(tab).map((item) => `nav[aria-label="${NAV.label}"] a[href="${item.href}"]`);
  const [navigation = "", resume = "", goal = ""] = tabs;
  return [
    { key: "navigation", anchor: navigation, ...TOUR.steps.navigation },
    { key: "resume", anchor: resume, ...TOUR.steps.resume },
    { key: "goal", anchor: goal, ...TOUR.steps.goal },
    { key: "profile", anchor: `header a[href="${profileRoute(tab)}"]`, ...TOUR.steps.profile },
  ];
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
  return (
    <div className={styles.shell}>
      <Visit />
      <div className={styles.top}>
        {!bar && (
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
          />
        )}
        {bar && <TopBar title={bar.title} back={bar.back} backLabel={SHELL.back} link={BackLink} />}
      </div>
      <main className={styles.main}>{children}</main>
      {tabs && !bar && (
        <div className={styles.bottom}>
          <TabBar label={NAV.label} items={items} placement="bottom" link={Link} />
        </div>
      )}
      {chrome.tour && tabs && !bar && <Tour steps={tourSteps(tab)} end={chrome.endTour} />}
    </div>
  );
}
