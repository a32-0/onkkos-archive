import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SHELL } from "@/content/nav";
import { Profile } from "@/screens/shell/Profile";
import { readCycle, type ShellPlayer } from "@/screens/shell/read-cycle";
import { Shell, type ShellBar } from "@/screens/shell/Shell";
import { openedFrom, tabItems, type ShellTab } from "@/screens/shell/tabs";

const READ_AT = Date.UTC(2026, 9, 14, 3, 30);
const MINUTE = 60_000;

const PLAYER: ShellPlayer = {
  name: "Cy",
  avatar: null,
  masteryRank: 27,
  minutesSinceRead: 12,
  nextReadAt: READ_AT + 12 * 60 * MINUTE,
  fresh: false,
};

const text = (parts: readonly { text: string }[]) => parts.map((part) => part.text).join("");

const CHROME = {
  player: PLAYER,
  voice: { met: true, on: true },
  disconnect: async () => {},
  setOnkko: async () => {},
};

function shell(tab: ShellTab | null, tabs: boolean, bar?: ShellBar): string {
  return renderToStaticMarkup(
    Shell({ chrome: CHROME, tab, tabs, bar, children: createElement("p", null, "body") }),
  );
}

describe("the tab bar (spec 04)", () => {
  it("holds Navigation, Resume and Goal, in that order, on their routes", () => {
    expect(tabItems(null).map(({ label, icon, href }) => [label, icon, href])).toEqual([
      ["Navigation", "explore", "/system"],
      ["Resume", "hourglass", "/catch-up"],
      ["Goal", "flag", "/goals"],
    ]);
  });

  it("lights only the screen's tab", () => {
    expect(tabItems("resume").map((item) => item.active)).toEqual([false, true, false]);
    expect(tabItems(null).some((item) => item.active)).toBe(false);
  });

  it("lights on an item the tab its link came from, and none for anything else", () => {
    expect(openedFrom("goal")).toBe("goal");
    expect(openedFrom("navigation")).toBe("navigation");
    expect(openedFrom("map")).toBeNull();
    expect(openedFrom(null)).toBeNull();
    expect(openedFrom(undefined)).toBeNull();
  });
});

describe("the read cycle (BR-07)", () => {
  it("reads as the frame draws it, with the next read in UTC", () => {
    expect(text(readCycle(PLAYER))).toBe(
      "Data is read every 12 hours. The last read was 12 minutes ago, and the next one will be at 15:30 hours UTC.",
    );
  });

  it("bolds the period, the age and the next read", () => {
    const strong = readCycle({ ...PLAYER, minutesSinceRead: 0 }).filter((part) => part.strong);
    expect(strong.map((part) => part.text)).toEqual([
      "12 hours",
      "less than a minute ago,",
      "15:30 hours UTC.",
    ]);
  });

  it("says how long ago in whole words", () => {
    expect(SHELL.age(0, true)).toBe("just now");
    expect(SHELL.age(0, false)).toBe("less than a minute ago");
    expect(SHELL.age(1, false)).toBe("1 minute ago");
    expect(SHELL.age(59, false)).toBe("59 minutes ago");
    expect(SHELL.age(60, false)).toBe("1 hour ago");
    expect(SHELL.age(11 * 60 + 59, false)).toBe("11 hours ago");
  });
});

describe("the shell around a screen (spec 04)", () => {
  it("shows the chip and the tab bar, with the screen's tab lit", () => {
    const html = shell("navigation", true);
    expect(html).toContain('href="/profile?from=navigation"');
    expect(html.match(/<nav /g)).toHaveLength(2);
    const lit = html.match(/<a [^>]*aria-current="page"[^>]*>/g) ?? [];
    expect(lit).toHaveLength(2);
    expect(lit.every((link) => link.includes('href="/system"'))).toBe(true);
    expect(html).toContain("<main");
  });

  it("shows the chip without the tab bar for Resume's onboarding entrance (BR-41)", () => {
    const html = shell("resume", false);
    expect(html).toContain('href="/profile?from=resume"');
    expect(html).not.toContain("<nav");
  });

  it("never makes the wordmark a link", () => {
    const html = shell(null, true);
    const header = /<header[\s\S]*?<\/header>/.exec(html)?.[0] ?? "";
    const links = header.match(/<a [^>]*>/g) ?? [];
    expect(links.every((link) => /href="\/(system|catch-up|goals|profile)[?"]/.test(link))).toBe(
      true,
    );
  });

  it("opens a page under a tab with the top bar, its back link and its title", () => {
    const html = shell("resume", true, { title: "Warframes", back: "/catch-up" });
    expect(html).toContain('aria-label="Back"');
    expect(html).toContain('href="/catch-up"');
    expect(html).toContain("Warframes");
    expect(html.match(/<nav /g)).toHaveLength(2);
  });

  it("holds Profile with Disconnect and the read cycle", () => {
    const html = renderToStaticMarkup(
      createElement(Profile, { chrome: CHROME, tab: "goal", back: "/goals" }),
    );
    expect(html).toContain("Profile");
    expect(html).toContain("Mastery Rank 27");
    expect(html).toContain("Gold Sage");
    expect(html).toContain("Disconnect");
    expect(html).toContain("15:30 hours UTC.");
  });
});
