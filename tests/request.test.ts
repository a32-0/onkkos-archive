import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEMO_ACCOUNT_IDS } from "@/infra/profile/fixture-source";

interface Kept {
  value: string;
  options: Record<string, unknown>;
}

const jar = new Map<string, Kept>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)?.value } : undefined),
    set: (name: string, value: string, options: Record<string, unknown> = {}) =>
      jar.set(name, { value, options }),
    delete: (name: string) => jar.delete(name),
  }),
  headers: async () => new Headers(),
}));

class Redirected extends Error {
  constructor(readonly url: string) {
    super(url);
  }
}

vi.mock("next/cache", () => ({ refresh: () => {} }));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Redirected(url);
  },
  useRouter: () => ({ push: () => {} }),
}));

const ORDIS = DEMO_ACCOUNT_IDS.ordis;

beforeEach(() => jar.clear());

afterEach(() => {
  vi.doUnmock("@/infra/profile/read");
  vi.resetModules();
});

describe("the cookies (BR-46, spec 02, spec 04)", () => {
  it("keeps the account for a year, out of the page's scripts", async () => {
    const { readAccountId, writeAccountId } = await import("@/infra/session");
    await writeAccountId(ORDIS);
    expect(jar.get("wf_account")?.options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    expect(await readAccountId()).toBe(ORDIS);
  });

  it("reads no account from a cookie that is not an id", async () => {
    const { readAccountId } = await import("@/infra/session");
    jar.set("wf_account", { value: "not-an-id", options: {} });
    expect(await readAccountId()).toBeNull();
  });

  it("keeps the month the player last played, and only a month", async () => {
    const { readSince, writeSince } = await import("@/infra/session");
    await writeSince("2025-13");
    expect(jar.has("wf_since")).toBe(false);
    await writeSince("2025-11");
    expect(await readSince()).toBe("2025-11");
    jar.set("wf_since", { value: "last spring", options: {} });
    expect(await readSince()).toBeNull();
  });

  it("forgets the account and the month together", async () => {
    const { forgetAccount, writeAccountId, writeSince } = await import("@/infra/session");
    await writeAccountId(ORDIS);
    await writeSince("2025-11");
    await forgetAccount();
    expect([...jar.keys()]).toEqual([]);
  });

  it("reads the last place as its system and its place", async () => {
    const { readPlace } = await import("@/infra/session");
    jar.set("wf_place", { value: "origin/Kuva Fortress", options: {} });
    expect(await readPlace()).toEqual({ system: "origin", place: "Kuva Fortress" });
    jar.set("wf_place", { value: "Kuva Fortress", options: {} });
    expect(await readPlace()).toBeNull();
    jar.set("wf_place", { value: "Origin System!/Earth", options: {} });
    expect(await readPlace()).toBeNull();
  });
});

describe("the one read a screen makes", () => {
  it("answers no account when the device has none", async () => {
    const { readScreen } = await import("@/infra/screen");
    expect(await readScreen()).toEqual({ state: "no-account" });
  });

  it("reads the profile and the domain's readings of it", async () => {
    const { readScreen } = await import("@/infra/screen");
    jar.set("wf_account", { value: ORDIS, options: {} });
    const read = await readScreen();
    expect(read.state).toBe("ok");
    if (read.state !== "ok") return;
    expect(read.screen.accountId).toBe(ORDIS);
    expect(read.screen.display.displayName).toBe(read.screen.profile.DisplayName);
    expect(read.screen.graph).toBeDefined();
    expect(read.screen.confirmedQuests).toBeInstanceOf(Map);
  });

  it("turns the wait into the time a retry can succeed", async () => {
    vi.doMock("@/infra/profile/read", () => ({
      readProfile: async () => ({ ok: false, reason: "limited", retryAfterSeconds: 600 }),
    }));
    const { readScreen } = await import("@/infra/screen");
    jar.set("wf_account", { value: ORDIS, options: {} });
    const before = Math.floor(Date.now() / 1000);
    const read = await readScreen();
    expect(read.state === "failed" ? read.reason : null).toBe("limited");
    const retryAt = read.state === "failed" ? (read.retryAt ?? 0) : 0;
    expect(retryAt - before).toBeGreaterThanOrEqual(600);
    expect(retryAt - before).toBeLessThanOrEqual(601);
  });
});

describe("a screen that cannot read lands on /connect (BR-38)", () => {
  async function landing(failure: object): Promise<string> {
    vi.doMock("@/infra/profile/read", () => ({ readProfile: async () => failure }));
    const { requireScreen } = await import("@/app/screen");
    jar.set("wf_account", { value: ORDIS, options: {} });
    try {
      await requireScreen();
    } catch (error) {
      if (error instanceof Redirected) return error.url;
      throw error;
    }
    throw new Error("no redirect");
  }

  it("carries the reason and the retry time", async () => {
    const url = await landing({ ok: false, reason: "circuit-open", retryAfterSeconds: 90 });
    const query = new URL(url, "http://localhost").searchParams;
    expect(url.startsWith("/connect?")).toBe(true);
    expect(query.get("reason")).toBe("circuit-open");
    expect(Number(query.get("retry")) - Date.now() / 1000).toBeGreaterThan(80);
  });

  it("carries no retry when none is known", async () => {
    expect(await landing({ ok: false, reason: "upstream" })).toBe("/connect?reason=upstream");
  });

  it("sends a device with no account to /connect", async () => {
    const { requireScreen } = await import("@/app/screen");
    await expect(requireScreen()).rejects.toMatchObject({ url: "/connect" });
  });

  it("hands the screen over when the read succeeds", async () => {
    const { requireScreen } = await import("@/app/screen");
    jar.set("wf_account", { value: ORDIS, options: {} });
    expect((await requireScreen()).accountId).toBe(ORDIS);
  });
});

describe("proxy.ts writes the last place visited (BR-46)", () => {
  const visit = async (query: string) => {
    const { proxy } = await import("@/proxy");
    return proxy(new NextRequest(`http://localhost/system${query}`));
  };

  it("writes the system and the place of the map's URL", async () => {
    const response = await visit("?system=origin&place=Kuva%20Fortress");
    const cookie = response.cookies.get("wf_place");
    expect(cookie?.value).toBe("origin/Kuva Fortress");
    expect(cookie).toMatchObject({ httpOnly: true, maxAge: 60 * 60 * 24 * 365 });
  });

  it("writes every place of every released system, accents and spaces kept", async () => {
    const { loadSystems } = await import("@/infra/place/load");
    for (const system of loadSystems().systems.filter((one) => one.released)) {
      for (const place of system.places) {
        const query = new URLSearchParams({ system: system.id, place }).toString();
        expect((await visit(`?${query}`)).cookies.get("wf_place")?.value).toBe(
          `${system.id}/${place}`,
        );
      }
    }
  });

  it("runs on the map and never on a prefetch of it", async () => {
    const { config } = await import("@/proxy");
    const runs = (url: string, headers: Record<string, string> = {}) =>
      unstable_doesMiddlewareMatch({ config, url, headers });
    expect(runs("/system?system=origin&place=Earth")).toBe(true);
    expect(runs("/system", { rsc: "1", "next-router-prefetch": "1" })).toBe(false);
    expect(runs("/system", { purpose: "prefetch" })).toBe(false);
    expect(runs("/item?name=Ember")).toBe(false);
  });

  it("writes nothing without both parts, or with a malformed system", async () => {
    for (const query of [
      "",
      "?system=origin",
      "?place=Earth",
      "?system=Origin%20System&place=Earth",
    ]) {
      expect((await visit(query)).cookies.get("wf_place")).toBeUndefined();
    }
  });
});

describe("Disconnect (spec 04)", () => {
  it("forgets the account and the month, and lands on /connect", async () => {
    const { writeAccountId, writeSince } = await import("@/infra/session");
    await writeAccountId(ORDIS);
    await writeSince("2025-11");
    jar.set("wf_place", { value: "origin/Earth", options: {} });
    const { disconnect } = await import("@/app/actions");
    await expect(disconnect()).rejects.toMatchObject({ url: "/connect" });
    expect([...jar.keys()]).toEqual(["wf_place"]);
  });
});

describe("the player the shell shows", () => {
  it("carries the name, the rank and the read times", async () => {
    const { playerOf, requireScreen } = await import("@/app/screen");
    jar.set("wf_account", { value: ORDIS, options: {} });
    const screen = await requireScreen();
    const player = playerOf(screen);
    expect(player.name).toBe(screen.display.displayName);
    expect(player.masteryRank).toBe(screen.display.masteryRank);
    expect(player.nextReadAt - screen.fetchedAt).toBe(12 * 60 * 60 * 1000);
    expect(player.fresh).toBe(!screen.cached);
  });

  it("wears each demo's glyph", async () => {
    const { playerOf, requireScreen } = await import("@/app/screen");
    jar.set("wf_account", { value: ORDIS, options: {} });
    expect(playerOf(await requireScreen()).avatar).toMatch(/ConqueraOrdisGlyph.png$/);
    jar.set("wf_account", { value: DEMO_ACCOUNT_IDS.cy, options: {} });
    expect(playerOf(await requireScreen()).avatar).toMatch(/CyGlyph.png$/);
  });

  it("counts whole minutes since the read, never a negative one", async () => {
    const { playerOf, requireScreen } = await import("@/app/screen");
    jar.set("wf_account", { value: ORDIS, options: {} });
    const screen = await requireScreen();
    expect(playerOf(screen, screen.fetchedAt + 12.5 * 60_000).minutesSinceRead).toBe(12);
    expect(playerOf(screen, screen.fetchedAt - 60_000).minutesSinceRead).toBe(0);
  });

  it("falls back to the account id and rank 0 when the profile lacks them", async () => {
    const { playerOf, requireScreen } = await import("@/app/screen");
    jar.set("wf_account", { value: ORDIS, options: {} });
    const screen = await requireScreen();
    const player = playerOf({ ...screen, display: {} });
    expect(player.name).toBe(ORDIS);
    expect(player.masteryRank).toBe(0);
  });
});

describe("Connect and the demos (spec 02, BR-03)", () => {
  const form = (entries: Record<string, string>) => {
    const data = new FormData();
    for (const [name, value] of Object.entries(entries)) data.set(name, value);
    return data;
  };
  const REST = { value: "", reason: null, retryAt: null };

  async function landing(run: () => Promise<unknown>): Promise<string> {
    try {
      await run();
    } catch (error) {
      if (error instanceof Redirected) return error.url;
      throw error;
    }
    throw new Error("no redirect");
  }

  it("refuses a malformed id without reading anything", async () => {
    const read = vi.fn();
    vi.doMock("@/infra/profile/read", () => ({ readProfile: read }));
    const { connect } = await import("@/app/actions");
    expect(await connect(REST, form({ accountId: " not an id " }))).toEqual({
      value: " not an id ",
      reason: "invalid-id",
      retryAt: null,
    });
    expect(read).not.toHaveBeenCalled();
    expect(jar.has("wf_account")).toBe(false);
  });

  it("keeps what was typed and the retry time when a read fails", async () => {
    vi.doMock("@/infra/profile/read", () => ({
      readProfile: async () => ({ ok: false, reason: "limited", retryAfterSeconds: 600 }),
    }));
    const { connect } = await import("@/app/actions");
    const typed = "ABCDEFABCDEFABCDEFABCDEF";
    const state = await connect(REST, form({ accountId: typed }));
    expect(state.value).toBe(typed);
    expect(state.reason).toBe("limited");
    expect((state.retryAt ?? 0) - Date.now() / 1000).toBeGreaterThan(590);
    expect(jar.has("wf_account")).toBe(false);
  });

  it("saves the id, trimmed, and sends a player past Venus to /features", async () => {
    const { connect } = await import("@/app/actions");
    const url = await landing(() => connect(REST, form({ accountId: ` ${DEMO_ACCOUNT_IDS.cy} ` })));
    expect(url).toBe("/features");
    expect(jar.get("wf_account")?.value).toBe(DEMO_ACCOUNT_IDS.cy);
  });

  it("sends a new player to /goals", async () => {
    vi.doMock("@/infra/profile/read", () => ({
      readProfile: async () => ({
        ok: true,
        profile: { Missions: [] },
        cached: false,
        fetchedAt: 0,
      }),
    }));
    const { connect } = await import("@/app/actions");
    expect(await landing(() => connect(REST, form({ accountId: ORDIS })))).toBe("/goals");
    expect(jar.get("wf_account")?.value).toBe(ORDIS);
  });

  it("opens both demos on /features, as their reads would, with no request", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    const { demo } = await import("@/app/actions");
    expect(await landing(() => demo(form({ profile: "ordis" })))).toBe("/features");
    expect(jar.get("wf_account")?.value).toBe(ORDIS);
    expect(await landing(() => demo(form({ profile: "cy" })))).toBe("/features");
    expect(jar.get("wf_account")?.value).toBe(DEMO_ACCOUNT_IDS.cy);
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
  });

  it("counts a profile whose missions cannot be read as past Venus", async () => {
    const { entranceAfter } = await import("@/app/screen");
    expect(entranceAfter({})).toBe("/features");
    expect(entranceAfter({ Missions: [{ Tag: "EarthToVenusJunction" }] })).toBe("/features");
    expect(entranceAfter({ Missions: [] })).toBe("/goals");
  });
});

describe("Two ways in (spec 03, BR-03, BR-40)", () => {
  async function page(): Promise<string> {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: FeaturesPage } = await import("@/app/features/page");
    return renderToStaticMarkup(await FeaturesPage());
  }

  async function landing(): Promise<string> {
    try {
      await page();
    } catch (error) {
      if (error instanceof Redirected) return error.url;
      throw error;
    }
    throw new Error("no redirect");
  }

  it("sends a visitor with no account to /connect", async () => {
    expect(await landing()).toBe("/connect");
  });

  it("sends a failed read back to /connect with its band (BR-38)", async () => {
    vi.doMock("@/infra/profile/read", () => ({
      readProfile: async () => ({ ok: false, reason: "not-found" }),
    }));
    jar.set("wf_account", { value: ORDIS, options: {} });
    expect(await landing()).toBe("/connect?reason=not-found");
  });

  it("sends a new player who opens /features by its address to /goals", async () => {
    vi.doMock("@/infra/profile/read", () => ({
      readProfile: async () => ({
        ok: true,
        profile: { Missions: [] },
        cached: false,
        fetchedAt: 0,
      }),
    }));
    jar.set("wf_account", { value: ORDIS, options: {} });
    expect(await landing()).toBe("/goals");
  });

  it("greets Ordis by name and opens Skip on the frontier, Back on the id form", async () => {
    jar.set("wf_account", { value: ORDIS, options: {} });
    const html = await page();
    expect(html).toMatch(/association, <span[^>]*>Ordis<\/span>\./);
    expect(html).toContain('href="/catch-up?step=resume"');
    expect(html).toContain('href="/goals"');
    expect(html).toMatch(
      /<a [^>]*href="\/system\?system=origin&amp;place=[A-Z][a-z]+"[^>]*>Skip<\/a>/,
    );
    expect(html).toMatch(/<a [^>]*href="\/connect"[^>]*>Back<\/a>/);
    expect(html).not.toMatch(/<nav|aria-haspopup/);
  });

  it("ends the line at association when the profile has no name", async () => {
    vi.doMock("@/infra/profile/read", () => ({
      readProfile: async () => ({ ok: true, profile: {}, cached: false, fetchedAt: 0 }),
    }));
    jar.set("wf_account", { value: ORDIS, options: {} });
    expect(await page()).toContain("We have, and shall have a long association.</p>");
  });
});

describe("Resume and its Summary (spec 05, spec 06, BR-41)", () => {
  const CY = DEMO_ACCOUNT_IDS.cy;

  async function page(step?: string): Promise<string> {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: CatchUpPage } = await import("@/app/catch-up/page");
    const query = step ? { step } : {};
    return renderToStaticMarkup(await CatchUpPage({ searchParams: Promise.resolve(query) }));
  }

  const choose = (entries: Record<string, string>) => {
    const data = new FormData();
    for (const [name, value] of Object.entries(entries)) data.set(name, value);
    return data;
  };

  async function landing(run: () => Promise<unknown>): Promise<string> {
    try {
      await run();
    } catch (error) {
      if (error instanceof Redirected) return error.url;
      throw error;
    }
    throw new Error("no redirect");
  }

  it("from the tab: the tab bar, five cards newest first, Show more and Skip", async () => {
    jar.set("wf_account", { value: CY, options: {} });
    const html = await page();
    expect(html).toContain("RESUME");
    expect(html).toContain("Once, long ago, I would look backwards");
    expect(html).toMatch(/<nav[^>]*>/);
    expect(html.match(/<button [^>]*name="since"/g)).toHaveLength(5);
    expect(html.match(/>Newest</g)).toHaveLength(1);
    expect(html).toMatch(/Update [\d.]+ · [A-Z][a-z]{2}, \d{4}/);
    expect(html).toContain(">Show more<");
    expect(html).toMatch(/<a [^>]*href="\/system\?system=[^"]+"[^>]*>Skip<\/a>/);
    expect(html).not.toContain('name="step"');
  });

  it("from Two ways in: Skip to Start here, no Go back and no tab bar", async () => {
    jar.set("wf_account", { value: CY, options: {} });
    const html = await page("resume");
    expect(html).not.toMatch(/<nav/);
    expect(html).toMatch(/<a [^>]*href="\/system\?system=[^"]+"[^>]*>Skip<\/a>/);
    expect(html).not.toContain("Go back");
    expect(html).toContain('<input type="hidden" name="step" value="resume"/>');
  });

  it("from Two ways in, shows Resume even when a month is already chosen", async () => {
    jar.set("wf_account", { value: CY, options: {} });
    jar.set("wf_since", { value: "2026-03", options: {} });
    expect(await page("resume")).toContain("RESUME");
  });

  describe("the Summary", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", async () => Response.json({}));
      jar.set("wf_account", { value: CY, options: {} });
    });
    afterEach(() => vi.unstubAllGlobals());

    it("from the tab: the title, the lead, the card, the categories, Skip and the tab bar", async () => {
      jar.set("wf_since", { value: "2026-03", options: {} });
      const html = await page();
      expect(html).toContain("SUMMARY");
      expect(html).toContain("This is what shipped since you left off.");
      expect(html).toContain("You last played");
      expect(html).toContain("The Shadowgrapher");
      expect(html).toMatch(/Update 42 · Mar, 2026/);
      expect(html).toContain('href="/catch-up/updates?from=resume"');
      expect(html).toContain(">Arsenal<");
      expect(html).toMatch(/href="\/catch-up\/warframes"/);
      expect(html).toMatch(/\d+ New/);
      expect(html).not.toContain("aria-expanded");
      expect(html).toContain("We are prepared to provide.");
      expect(html).toMatch(/<a [^>]*href="\/system\?system=[^"]+"[^>]*>Skip<\/a>/);
      expect(html).toMatch(/<nav[^>]*>/);
      expect(html).not.toMatch(/Nightwave|Running now|Pick up/);
    });

    it("from Two ways in: the same Summary with no tab bar", async () => {
      jar.set("wf_since", { value: "2026-03", options: {} });
      const html = await page("summary");
      expect(html).toContain("SUMMARY");
      expect(html).not.toMatch(/<nav/);
      expect(html).toMatch(/href="\/catch-up\/warframes\?step=summary"/);
    });

    async function category(name: string, step?: string): Promise<string> {
      const { renderToStaticMarkup } = await import("react-dom/server");
      const { default: CategoryPage } = await import("@/app/catch-up/[category]/page");
      const query = step ? { step } : {};
      return renderToStaticMarkup(
        await CategoryPage({
          params: Promise.resolve({ category: name }),
          searchParams: Promise.resolve(query),
        }),
      );
    }

    it("opens a category under the top bar, its things as rows, with the tab bar", async () => {
      jar.set("wf_since", { value: "2026-03", options: {} });
      const html = await category("warframes");
      expect(html).toContain("Warframes");
      expect(html).toContain('aria-label="Back"');
      expect(html).toContain("New since you left off. Pick one to see how to get it.");
      expect(html).toMatch(/href="\/item\?name=[^"]+&amp;from=resume"/);
      expect(html).toMatch(/<nav/);
    });

    it("sends a category with nothing new back to the Summary", async () => {
      jar.set("wf_since", { value: "2026-10", options: {} });
      await expect(category("warframes", "summary")).rejects.toThrow("/catch-up?step=summary");
    });

    it("lists the other updates on their own page, choosing one keeps the entrance", async () => {
      jar.set("wf_since", { value: "2026-03", options: {} });
      const { renderToStaticMarkup } = await import("react-dom/server");
      const { default: UpdatesPage } = await import("@/app/catch-up/updates/page");
      const html = renderToStaticMarkup(
        await UpdatesPage({ searchParams: Promise.resolve({ from: "resume", step: "summary" }) }),
      );
      expect(html).toContain("Updates");
      expect(html).toContain('name="step" value="resume"');
      expect(html).not.toContain(">The Shadowgrapher<");
      expect(html).not.toMatch(/<nav/);
    });

    it("keeps apart two updates of the same month", async () => {
      const { requireScreen } = await import("@/app/screen");
      const { otherUpdates } = await import("@/app/catch-up/summary");
      const updates = otherUpdates(await requireScreen(), null);
      const months = updates.map((one) => one.value);
      const versions = updates.map((one) => one.version);
      expect(new Set(months).size).toBeLessThan(months.length);
      expect(new Set(versions).size).toBe(versions.length);
    });

    it("names the update a folded month belongs to", async () => {
      jar.set("wf_since", { value: "2024-02", options: {} });
      expect(await page()).toContain("Whispers in the Walls");
    });

    it("says up to date, and shows the empty state, when nothing shipped since", async () => {
      jar.set("wf_since", { value: "2026-10", options: {} });
      const html = await page();
      expect(html).toContain("You&#x27;re up to date");
      expect(html).toContain("Nothing new since Oct, 2026");
      expect(html).toContain("The arsenal and the collection are as you left them.");
      expect(html).not.toContain(">Arsenal<");
      expect(html).not.toContain("This is what shipped since you left off.");
      expect(html).toContain(">Skip<");
    });
  });

  it("keeps the month of a card or of Date, and opens the Summary", async () => {
    const { resume } = await import("@/app/actions");
    expect(await landing(() => resume(choose({ since: "2025-06" })))).toBe("/catch-up");
    expect(jar.get("wf_since")?.value).toBe("2025-06");
    expect(await landing(() => resume(choose({ since: "2024-02", step: "resume" })))).toBe(
      "/catch-up?step=summary",
    );
    expect(jar.get("wf_since")?.value).toBe("2024-02");
  });

  it("keeps nothing from a month it cannot read, and stays on Resume", async () => {
    const { resume } = await import("@/app/actions");
    expect(await landing(() => resume(choose({ since: "2024-02-29", step: "resume" })))).toBe(
      "/catch-up?step=resume",
    );
    expect(jar.has("wf_since")).toBe(false);
  });
});

describe("Onkko's phrases (BR-64)", () => {
  const CY = DEMO_ACCOUNT_IDS.cy;

  async function resume(): Promise<string> {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: CatchUpPage } = await import("@/app/catch-up/page");
    return renderToStaticMarkup(await CatchUpPage({ searchParams: Promise.resolve({}) }));
  }

  it("speaks to a player who has been to Cetus", async () => {
    jar.set("wf_account", { value: CY, options: {} });
    expect(await resume()).toContain("Once, long ago, I would look backwards");
  });

  it("stays silent once turned off, speaks again once turned on, and ignores anything else", async () => {
    jar.set("wf_account", { value: CY, options: {} });
    const { setOnkko } = await import("@/app/actions");
    const choose = (value: string) => {
      const form = new FormData();
      form.set("onkko", value);
      return setOnkko(form);
    };
    await choose("off");
    expect(jar.get("wf_onkko")?.value).toBe("off");
    expect(await resume()).not.toContain("Once, long ago");
    await choose("on");
    expect(await resume()).toContain("Once, long ago");
    await choose("loud");
    expect(jar.get("wf_onkko")?.value).toBe("on");
  });

  it("keeps silent for a player who has not reached Cetus, whatever the cookie says", async () => {
    vi.doMock("@/infra/profile/read", () => ({
      readProfile: async () => ({
        ok: true,
        profile: { Missions: [{ Tag: "SolNode27", Completes: 1 }] },
        cached: false,
        fetchedAt: 0,
      }),
    }));
    jar.set("wf_account", { value: CY, options: {} });
    jar.set("wf_onkko", { value: "on", options: {} });
    expect(await resume()).not.toContain("Once, long ago");
  });
});

describe("the map (spec 07, BR-46)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", async () => Response.json({}));
    jar.set("wf_account", { value: ORDIS, options: {} });
  });
  afterEach(() => vi.unstubAllGlobals());

  async function page(query: Record<string, string>): Promise<string> {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: SystemPage } = await import("@/app/system/page");
    return renderToStaticMarkup(await SystemPage({ searchParams: Promise.resolve(query) }));
  }

  async function landing(query: Record<string, string>): Promise<string> {
    try {
      await page(query);
    } catch (error) {
      if (error instanceof Redirected) return error.url;
      throw error;
    }
    throw new Error("no redirect");
  }

  it("opens Start here the first time, the same place Skip opens", async () => {
    const { requireScreen, startHereOf } = await import("@/app/screen");
    const skip = startHereOf(await requireScreen());
    expect(await landing({})).toBe(skip);
  });

  it("reopens the last place viewed", async () => {
    jar.set("wf_place", { value: "origin/Mars", options: {} });
    expect(await landing({})).toBe("/system?system=origin&place=Mars");
  });

  it("never opens Tau, a place of another system, or a place it does not know", async () => {
    const { requireScreen, startHereOf } = await import("@/app/screen");
    const skip = startHereOf(await requireScreen());
    expect(await landing({ system: "tau", place: "Earth" })).toBe(skip);
    expect(await landing({ system: "duviri", place: "Earth" })).toBe(skip);
    expect(await landing({ system: "origin", place: "Atlantis" })).toBe(skip);
  });

  it("draws the card, Change location, the place, the categories and the Navigation tab", async () => {
    jar.set("wf_since", { value: "2025-08", options: {} });
    const html = await page({ system: "origin", place: "Earth" });
    expect(html).toContain("You last played");
    expect(html).toContain('href="/catch-up/updates?from=navigation"');
    expect(html).toContain(">Earth<");
    expect(html).toContain('href="/system/places?system=origin&amp;place=Earth"');
    expect(html).toContain('role="progressbar"');
    expect(html).not.toContain(">Nodes<");
    expect(html).toContain(">Arsenal<");
    expect(html).toContain('href="/system/warframes?system=origin&amp;place=Earth"');
    expect(html).toMatch(
      /<a [^>]*aria-current="page"[^>]*href="\/system"|href="\/system"[^>]*aria-current="page"/,
    );
  });

  it("takes a player who skipped the month as up to date, with no date on the card", async () => {
    const html = await page({ system: "origin", place: "Earth" });
    expect(html).toContain("You&#x27;re up to date");
    expect(html).not.toMatch(/Update [\d.]+ · /);
  });

  async function category(name: string, query: Record<string, string>): Promise<string> {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: CategoryPage } = await import("@/app/system/[category]/page");
    return renderToStaticMarkup(
      await CategoryPage({
        params: Promise.resolve({ category: name }),
        searchParams: Promise.resolve(query),
      }),
    );
  }

  it("opens a category on To get, under the top bar, with the place and View", async () => {
    jar.set("wf_since", { value: "2025-08", options: {} });
    const html = await category("warframes", { system: "origin", place: "Earth" });
    expect(html).toContain('aria-label="Back"');
    expect(html).toContain("Origin &gt; Earth");
    expect(html).toMatch(/>View<[\s\S]*>To get<[\s\S]*>Mastered<[\s\S]*>New</);
    expect(html).toMatch(/aria-pressed="true"[^>]*>To get</);
  });

  it("offers no New on a category without a month", async () => {
    const html = await category("warframes", { system: "origin", place: "Earth" });
    expect(html).toMatch(/>To get<[\s\S]*>Mastered</);
    expect(html).not.toMatch(/>New</);
  });

  it("lists the places and the systems on their own pages", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: PlacesPage } = await import("@/app/system/places/page");
    const { default: SystemsPage } = await import("@/app/system/systems/page");
    const query = { system: "origin", place: "Earth" };
    const places = renderToStaticMarkup(await PlacesPage({ searchParams: Promise.resolve(query) }));
    expect(places).toContain("Locations");
    expect(places).toContain(
      'href="/system/systems?system=origin&amp;place=Earth&amp;list=origin"',
    );
    expect(places).toContain('href="/system?system=origin&amp;place=Mars"');
    const systems = renderToStaticMarkup(
      await SystemsPage({ searchParams: Promise.resolve(query) }),
    );
    expect(systems).toContain("Choose a system");
    expect(systems).toContain(
      'href="/system/places?system=origin&amp;place=Earth&amp;list=origin"',
    );
  });

  it("keeps the month chosen in Updates and returns to the map", async () => {
    const { remeasure } = await import("@/app/actions");
    const form = new FormData();
    form.set("since", "2025-06");
    await expect(remeasure(form)).rejects.toThrow("/system");
    expect(jar.get("wf_since")?.value).toBe("2025-06");
    form.set("since", "June");
    await expect(remeasure(form)).rejects.toThrow("/system");
    expect(jar.get("wf_since")?.value).toBe("2025-06");
  });
});

describe("the goals (spec 08, BR-54, BR-62)", () => {
  beforeEach(() => vi.stubGlobal("fetch", async () => Response.json({})));
  afterEach(() => vi.unstubAllGlobals());

  async function page(account: string): Promise<string> {
    jar.set("wf_account", { value: account, options: {} });
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: GoalsPage } = await import("@/app/goals/page");
    return renderToStaticMarkup(await GoalsPage());
  }

  async function search(account: string, term: string) {
    jar.set("wf_account", { value: account, options: {} });
    const { GET } = await import("@/app/api/search/route");
    const response = await GET(new NextRequest(`http://localhost/api/search?q=${term}`));
    const body = (await response.json()) as {
      results: { name: string; catalogue: string; href: string }[];
    };
    return { response, results: body.results };
  }

  it("offers Ordis the next planet first, then by band, Deimos being in reach", async () => {
    const html = await page(ORDIS);
    expect(html).toContain("Clear the Mars Junction, on Earth, to open the next planet.");
    const order = ["Unlock the next planet", "Build a Necramech", "Play the Hex Quest"];
    const at = order.map((title) => html.indexOf(title));
    expect(at.every((index) => index >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    expect(html).toContain("/item?name=Voidrig&amp;from=goal&amp;view=steps");
    expect(html).toContain("Skip");
  });

  it("offers no Necramech to a player who has not reached Deimos", async () => {
    const { fixture, NEW_PLAYER } = await import("./helpers");
    const profile = fixture(NEW_PLAYER);
    vi.doMock("@/infra/profile/read", () => ({
      readProfile: async () => ({ ok: true, profile, cached: true, fetchedAt: Date.now() }),
    }));
    const html = await page(ORDIS);
    expect(html).toContain("Unlock the next planet");
    expect(html).not.toContain("Build a Necramech");
  });

  it("hides from Cy what the profile proves done", async () => {
    const html = await page(DEMO_ACCOUNT_IDS.cy);
    expect(html).not.toContain("Unlock the next planet");
    expect(html).not.toContain("Play the Hex Quest");
    expect(html).not.toContain("Build a Necramech");
    expect(html).toContain("Nothing left to suggest");
  });

  it("orders a search by reach, says the gap, and keeps it private", async () => {
    const { response, results } = await search(ORDIS, "jup");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const jupiter = results.find((row) => row.name === "Jupiter");
    expect(jupiter?.catalogue).toBe("Place · Clear the Mars Junction, on Earth");
    const beyond = results.map((row) => row.catalogue.includes(" · "));
    expect(beyond).toEqual([...beyond].sort((a, b) => Number(a) - Number(b)));
  });

  it("opens an item beyond Ordis's rank on Step by step", async () => {
    const { results } = await search(ORDIS, "rubico");
    const rubico = results.find((row) => row.name === "Rubico");
    expect(rubico?.catalogue).toMatch(/· Needs Mastery Rank \d+, you are 2$/);
    expect(rubico?.href).toBe("/item?name=Rubico&from=goal&view=steps");
  });

  it("answers no account with an empty list", async () => {
    const { GET } = await import("@/app/api/search/route");
    const response = await GET(new NextRequest("http://localhost/api/search?q=ember"));
    expect(response.status).toBe(401);
  });
});

describe("the item (spec 09, BR-51, BR-62)", () => {
  beforeEach(() => vi.stubGlobal("fetch", async () => Response.json({})));
  afterEach(() => vi.unstubAllGlobals());

  async function page(account: string, query: Record<string, string>): Promise<string> {
    jar.set("wf_account", { value: account, options: {} });
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: ItemPage } = await import("@/app/item/page");
    return renderToStaticMarkup(await ItemPage({ searchParams: Promise.resolve(query) }));
  }

  it("draws the top bar, You're on, the hero, View and the Summary's sections", async () => {
    const html = await page(DEMO_ACCOUNT_IDS.cy, { name: "Dante", from: "navigation" });
    expect(html).toContain('aria-label="Back"');
    expect(html).toContain(">Warframes<");
    expect(html).toContain("Origin &gt; Deimos");
    expect(html).toContain('href="/system?system=origin&amp;place=Deimos"');
    expect(html).toMatch(/>Warframe<[\s\S]*>Dante</);
    expect(html).toMatch(/aria-pressed="true"[^>]*>Summary</);
    expect(html).toMatch(/>Blueprints<[\s\S]*>Components</);
    expect(html).toContain("/item?name=Dante&amp;from=navigation&amp;view=steps#part%3ANeuroptics");
    expect(html).toContain("Armatus · Disruption");
    expect(html).toContain(">70,000 Credits<");
    expect(html).toMatch(
      /<a [^>]*aria-current="page"[^>]*href="\/system"|href="\/system"[^>]*aria-current="page"/,
    );
  });

  it("opens an item beyond reach on Step by step, unless the link says Summary", async () => {
    const beyond = await page(ORDIS, { name: "Kuva Bramma", from: "goal" });
    expect(beyond).toMatch(/aria-pressed="true"[^>]*>Step by step</);
    expect(beyond).not.toContain(">Components<");
    const asked = await page(ORDIS, { name: "Kuva Bramma", from: "goal", view: "summary" });
    expect(asked).toMatch(/aria-pressed="true"[^>]*>Summary</);
    expect(asked).toContain(">Components<");
  });

  it("draws the player's state on the hero, and Onkko's line for an item they have", async () => {
    const mastered = await page(DEMO_ACCOUNT_IDS.cy, { name: "Ash", from: "navigation" });
    expect(mastered).toContain(">Mastered<");
    expect(mastered).toContain("Well chosen.");
    const ranked = await page(ORDIS, { name: "Excalibur", from: "navigation" });
    expect(ranked).toContain(">Rank 17/30<");
    const absent = await page(DEMO_ACCOUNT_IDS.cy, { name: "Dante", from: "navigation" });
    expect(absent).not.toContain("Well chosen.");
  });

  it("names the place the Summary's first line names (BR-51)", async () => {
    const serration = await page(DEMO_ACCOUNT_IDS.cy, { name: "Serration", from: "navigation" });
    expect(serration).toMatch(/Origin &gt; Mercury[\s\S]*Hapke · Spy/);
    const spores = await page(DEMO_ACCOUNT_IDS.cy, { name: "Nano Spores", from: "resume" });
    expect(spores).toContain("Origin &gt; Deimos");
  });

  it("gives a relic-built Prime no You're on", async () => {
    const html = await page(DEMO_ACCOUNT_IDS.cy, { name: "Gyre Prime", from: "resume" });
    expect(html).not.toContain("You&#x27;re on");
    expect(html).toContain(">Blueprints<");
  });

  it("draws a resource with no state and How to get", async () => {
    const html = await page(DEMO_ACCOUNT_IDS.cy, { name: "Nano Spores", from: "resume" });
    expect(html).toContain(">Resources<");
    expect(html).toMatch(/>Resource<[\s\S]*>Nano Spores</);
    expect(html).toContain(">How to get<");
    expect(html).not.toMatch(/Rank \d+\/\d+|>Mastered</);
  });

  it("returns to the tab's screen when the item is not in the catalog", async () => {
    await expect(page(ORDIS, { name: "Not a thing", from: "resume" })).rejects.toThrow("/catch-up");
  });
});
