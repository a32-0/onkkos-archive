import { NAV } from "@/content/nav";
import type { IconName } from "@/ui/Icon/glyphs";
import type { TabBarItem } from "@/ui/TabBar/TabBar";
import { ROUTES } from "@/routes";

export type ShellTab = "navigation" | "resume" | "goal";

const TABS: readonly { tab: ShellTab; href: string; icon: IconName }[] = [
  { tab: "navigation", href: ROUTES.system, icon: "explore" },
  { tab: "resume", href: ROUTES.catchUp, icon: "hourglass" },
  { tab: "goal", href: ROUTES.goals, icon: "flag" },
];

export function tabItems(active: ShellTab | null): TabBarItem[] {
  return TABS.map(({ tab, href, icon }) => ({
    href,
    icon,
    label: NAV[tab],
    active: tab === active,
  }));
}

export function openedFrom(from: string | null | undefined): ShellTab | null {
  return TABS.find(({ tab }) => tab === from)?.tab ?? null;
}
