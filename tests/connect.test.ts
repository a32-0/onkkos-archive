import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Connect } from "@/screens/connect/Connect";
import type { ConnectState } from "@/screens/connect/state";

const REMEMBERED = "000000000000000000000001";
const DEMOS = [
  { key: "ordis", name: "Ordis", masteryRank: 2 },
  { key: "cy", name: "Cy", masteryRank: 27 },
];

function page(initial: ConnectState): string {
  return renderToStaticMarkup(
    Connect({
      initial,
      demos: DEMOS,
      connect: async (state) => state,
      demo: async () => {},
    }),
  );
}

describe("the id form (spec 02)", () => {
  it("holds the remembered id, or nothing, under the frame's placeholder", () => {
    const empty = page({ value: "", reason: null, retryAt: null });
    expect(empty).toContain('placeholder="000000000000000000000001"');
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
