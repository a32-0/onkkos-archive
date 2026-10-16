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

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Redirected(url);
  },
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
