import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Connect } from "@/screens/connect/Connect";
import type { ConnectState } from "@/screens/connect/state";

const REMEMBERED = "000000000000000000000001";
const DEMOS = [
  { key: "ordis", name: "Ordis", masteryRank: 2 },
  { key: "cy", name: "Cy", masteryRank: 27 },
];

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
    expect(html).toContain("Ordis (Mastery Rank 2)");
    expect(html).toContain("Cy (Mastery Rank 27)");
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
    ]);
    expect(links.every((link) => link.includes('target="_blank"'))).toBe(true);
    const html = page({ value: "", reason: null, retryAt: null });
    expect(html).not.toContain("user-data");
    expect(html).toContain(">gid<");
  });

  it("offers Ordis, then Cy, with the rank each fixture holds", () => {
    const html = page({ value: "", reason: null, retryAt: null });
    expect(html.indexOf("Ordis (Mastery Rank 2)")).toBeLessThan(
      html.indexOf("Cy (Mastery Rank 27)"),
    );
    expect(html).toContain("It is time. Utter the name.");
  });
});
