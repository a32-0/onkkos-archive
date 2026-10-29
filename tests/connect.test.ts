import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Connect } from "@/screens/connect/Connect";
import { FindId } from "@/screens/connect/FindId";
import type { ConnectState } from "@/screens/connect/state";

const REMEMBERED = "000000000000000000000001";
const DEMOS = [
  { key: "ordis", name: "Ordis", masteryRank: 2, icon: "rocket-launch" },
  { key: "cy", name: "Cy", masteryRank: 27, icon: "military-tech" },
] as const;

const ORDIS = "Mastery Rank 2. A player starting out, with most of the archive still ahead.";
const CY = "Mastery Rank 27. A player far along";

function page(initial: ConnectState, demoSite = false): string {
  return renderToStaticMarkup(
    Connect({
      initial,
      demos: DEMOS,
      connect: async (state) => state,
      demo: async () => {},
      demoSite,
    }),
  );
}

describe("on the demo (spec 02)", () => {
  const html = page({ value: "", reason: null, retryAt: null }, true);

  it("asks for no account: no field, no Connect, no steps", () => {
    expect(html).not.toContain("<input");
    expect(html).not.toContain("Where do I find this?");
    expect(html).not.toContain(">gid<");
  });

  it("says it is a demo and offers both demos", () => {
    expect(html).toContain("This is a demo: two players");
    expect(html).toContain(ORDIS);
    expect(html).toContain(CY);
  });

  it("sends a player to the app's latest release, in a new tab", () => {
    expect(html).toContain("Your own account");
    const link = html.match(/<a [^>]*>Download the app<\/a>/)?.[0] ?? "";
    expect(link).toContain('href="https://github.com/a32-0/onkkos-archive/releases/latest"');
    expect(link).toContain('target="_blank"');
    expect(link).toContain('rel="noreferrer"');
  });

  it("offers no download in the app or in development", () => {
    const own = page({ value: "", reason: null, retryAt: null });
    expect(own).not.toContain("Your own account");
    expect(own).not.toContain("Download the app");
  });
});

describe("the id form (spec 02)", () => {
  it("says what a wrong id costs before it is sent, and again under a band", () => {
    const note = "This device can read 2 profiles from Warframe every 12 hours";
    expect(page({ value: "", reason: null, retryAt: null })).toContain(note);
    expect(page({ value: REMEMBERED, reason: "not-found", retryAt: null })).toContain(note);
    expect(page({ value: "", reason: null, retryAt: null }, true)).not.toContain(note);
  });

  it("holds the remembered id, or nothing, under the frame's placeholder", () => {
    const empty = page({ value: "", reason: null, retryAt: null });
    expect(empty).toContain('placeholder="4b2e9f17c3a85d06e1f74a9c"');
    expect(empty).toMatch(/<input[^>]*value=""/);
    expect(page({ value: REMEMBERED, reason: null, retryAt: null })).toMatch(
      new RegExp(`<input[^>]*value="${REMEMBERED}"`),
    );
  });

  it("shows the band a failed read elsewhere sent, with the id still there (BR-38)", () => {
    const html = page({ value: REMEMBERED, reason: "upstream", retryAt: null });
    expect(html).toContain('role="alert"');
    expect(html).toContain("try again in a few minutes.");
    expect(html).toMatch(/<input[^>]*aria-invalid="true"/);
    expect(page({ value: "", reason: null, retryAt: null })).not.toContain('role="alert"');
  });

  it("opens the official site in a new tab, and asks for the gid cookie", () => {
    const links = page({ value: "", reason: null, retryAt: null }).match(/<a [^>]*>/g) ?? [];
    expect(links.map((link) => /href="([^"]+)"/.exec(link)?.[1])).toEqual([
      "https://www.warframe.com",
      "/connect/find-your-id",
    ]);
    expect(links[0]).toContain('target="_blank"');
    expect(links[1]).not.toContain("target=");
    const html = page({ value: "", reason: null, retryAt: null });
    expect(html).not.toContain("user-data");
    expect(html).toContain(">gid<");
  });

  it("offers Ordis, then Cy, as cards that send the form, with the rank each fixture holds", () => {
    const html = page({ value: "", reason: null, retryAt: null });
    expect(html.indexOf(ORDIS)).toBeLessThan(html.indexOf(CY));
    const cards =
      html
        .match(/<button type="submit" value="[a-z]+"[^>]*name="profile"/g)
        ?.map((card) => /value="([a-z]+)"/.exec(card)?.[1]) ?? [];
    expect(cards).toEqual(["ordis", "cy"]);
    expect(html).toContain("It is time. Utter the name.");
  });
});

describe("More help (spec 02)", () => {
  it("sits under the steps and opens Find your ID", () => {
    const html = page({ value: "", reason: null, retryAt: null });
    const button =
      /<a [^>]*href="\/connect\/find-your-id"[^>]*>[\s\S]*?<\/a>/.exec(html)?.[0] ?? "";
    expect(button).toContain("More help");
    expect(html.indexOf("Copy the 24-character value")).toBeLessThan(html.indexOf("More help"));
    expect(html.indexOf("More help")).toBeLessThan(html.indexOf("It will look something like"));
  });

  it("is not on the demo, which asks for no id", () => {
    expect(page({ value: "", reason: null, retryAt: null }, true)).not.toContain("More help");
  });
});

describe("Find your ID (spec 02)", () => {
  const html = renderToStaticMarkup(FindId());

  it("goes back to Connect from its top bar", () => {
    expect(html).toContain("Find your ID");
    expect(html).toMatch(/<a [^>]*aria-label="Back" href="\/connect"/);
  });

  it("shows Firefox, then Edge or Chrome, each with its steps and a described screenshot", () => {
    expect(html.indexOf(">Firefox<")).toBeLessThan(html.indexOf(">Edge or Chrome<"));
    expect(html).toContain("Go to Storage › Cookies › https://www.warframe.com.");
    expect(html).toContain("Go to Application › Cookies › https://www.warframe.com.");
    const shots = html.match(/<img [^>]*>/g) ?? [];
    expect(shots).toHaveLength(2);
    expect(shots.every((shot) => /alt="[^"]{20,}"/.test(shot))).toBe(true);
  });
});
