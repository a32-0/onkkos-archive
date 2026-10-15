import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Onboarding } from "@/screens/onboarding/Onboarding";

const html = renderToStaticMarkup(Onboarding());

describe("the splash (spec 01)", () => {
  it("holds the wordmark, Begin and Onkko's line, and nothing else", () => {
    expect(html).toContain(`aria-label="Onkko&#x27;s Archive"`);
    expect(html).toContain("You were anticipated. Our interaction begins.");
    expect(html).not.toMatch(/<header|<nav|aria-haspopup/);
    expect(html.match(/<a [^>]*>/g)).toHaveLength(1);
  });

  it("makes Begin a link to /connect, looking like the primary button", () => {
    const begin = /<a [^>]*>Begin<\/a>/.exec(html)?.[0] ?? "";
    expect(begin).toContain('href="/connect"');
    expect(begin).toContain('data-variant="primary"');
  });

  it("draws the art as decoration", () => {
    expect(html).toMatch(/<img [^>]*alt=""/);
  });
});

describe("the splash reads nothing (spec 01)", () => {
  it("imports only its screen, so / never reaches the profile", async () => {
    const { readFileSync } = await import("node:fs");
    const page = readFileSync("src/app/page.tsx", "utf8");
    expect(page.match(/from "([^"]+)"/g)).toEqual([`from "@/screens/onboarding/Onboarding"`]);
  });
});
