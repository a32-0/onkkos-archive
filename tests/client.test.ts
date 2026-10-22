import { gunzipSync } from "node:zlib";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PROFILE_FIELDS } from "@/domain/profile/fields";
import { ttlFromCacheControl } from "@/infra/profile/cache";
import { fetchProfile } from "@/infra/profile/read";
import { flush, memoryStore } from "@/infra/store/memory";
import { storeKeys } from "@/infra/store/store";

const ACCOUNT_ID = "0f0f0f0f0f0f0f0f0f0f0f0f";
const VISITOR = "test-visitor";
const HOUR = 60 * 60 * 1000;

const network = vi.fn<typeof fetch>();
let unexpected = 0;

function profileResponse(cacheControl = "public, max-age=595") {
  return new Response(
    JSON.stringify({
      Results: [
        {
          AccountId: { $oid: ACCOUNT_ID },
          DisplayName: "Tester",
          PlatformNames: ["Tester"],
          PlayerLevel: 12,
          Missions: [],
          LoadOutInventory: { XPInfo: [], Suits: [{ ItemType: "/Lotus/Example" }] },
        },
      ],
      Stats: { MissionsCompleted: 4 },
    }),
    {
      status: 200,
      headers: { "content-type": "text/html; charset=UTF-8", "cache-control": cacheControl },
    },
  );
}

function notFoundResponse(maxAge = 600) {
  return new Response("Could not find requested account", {
    status: 409,
    headers: { "cache-control": `public, max-age=${maxAge}` },
  });
}

beforeEach(() => {
  flush();
  unexpected = 0;
  network.mockReset();
  network.mockImplementation(() => {
    unexpected += 1;
    return Promise.reject(new Error("A test reached the network"));
  });
  vi.stubGlobal("fetch", network);
  vi.stubEnv("WF_PROFILE_SOURCE", "live");
});

afterEach(() => {
  expect(unexpected).toBe(0);
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("ttlFromCacheControl", () => {
  it("uses the header's max-age", () => {
    expect(ttlFromCacheControl("public, max-age=600")).toBe(600_000);
  });

  it("clamps a tiny max-age from below", () => {
    expect(ttlFromCacheControl("public, max-age=10")).toBe(60_000);
  });

  it("clamps from above and has a default without a header", () => {
    expect(ttlFromCacheControl("max-age=999999")).toBe(86_400_000);
    expect(ttlFromCacheControl(null)).toBe(600_000);
  });
});

describe("fetchProfile", () => {
  it("never builds a request from a malformed id", async () => {
    const result = await fetchProfile("not-an-id", VISITOR);
    expect(result).toEqual({ ok: false, reason: "invalid-id" });
    expect(network).not.toHaveBeenCalled();
  });

  it("parses JSON even when the content-type says text/html", async () => {
    network.mockResolvedValue(profileResponse());
    const result = await fetchProfile(ACCOUNT_ID, VISITOR);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.profile.PlayerLevel).toBe(12);
  });

  it("serves the second call from the store without going back to DE", async () => {
    network.mockResolvedValue(profileResponse());
    const first = await fetchProfile(ACCOUNT_ID, VISITOR);
    const second = await fetchProfile(ACCOUNT_ID, VISITOR);
    expect(network).toHaveBeenCalledTimes(1);
    expect(first.ok && first.cached).toBe(false);
    expect(second.ok && second.cached).toBe(true);
    if (first.ok && second.ok) expect(second.profile).toEqual(first.profile);
  });

  it("dedupes concurrent calls for the same id", async () => {
    network.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(profileResponse()), 10)),
    );
    const results = await Promise.all([
      fetchProfile(ACCOUNT_ID, VISITOR),
      fetchProfile(ACCOUNT_ID, VISITOR),
      fetchProfile(ACCOUNT_ID, VISITOR),
    ]);
    expect(results.every((result) => result.ok)).toBe(true);
    expect(network).toHaveBeenCalledTimes(1);
  });

  it("treats DE's 409 with its sentence as not-found, and keeps it", async () => {
    network.mockResolvedValue(notFoundResponse());
    const first = await fetchProfile(ACCOUNT_ID, VISITOR);
    const second = await fetchProfile(ACCOUNT_ID, VISITOR);
    expect(first).toEqual({ ok: false, reason: "not-found" });
    expect(second).toEqual({ ok: false, reason: "not-found" });
    expect(network).toHaveBeenCalledTimes(1);
  });

  it("keeps a not-found for DE's max-age, clamped", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    network.mockResolvedValue(notFoundResponse(10));
    await fetchProfile(ACCOUNT_ID, VISITOR);
    vi.setSystemTime(Date.now() + 59_000);
    await fetchProfile(ACCOUNT_ID, VISITOR);
    expect(network).toHaveBeenCalledTimes(1);
    vi.setSystemTime(Date.now() + 1_000);
    await fetchProfile(ACCOUNT_ID, VISITOR);
    expect(network).toHaveBeenCalledTimes(2);
  });

  it("still accepts 404 as not-found in case the endpoint changes", async () => {
    network.mockResolvedValue(new Response("", { status: 404 }));
    expect(await fetchProfile(ACCOUNT_ID, VISITOR)).toEqual({ ok: false, reason: "not-found" });
  });

  it("never keeps the empty-body 409 as a not-found", async () => {
    network.mockImplementation(() => Promise.resolve(new Response("", { status: 409 })));
    const first = await fetchProfile(ACCOUNT_ID, VISITOR);
    expect(first).toEqual({ ok: false, reason: "throttled" });
    expect(await memoryStore.getMany([storeKeys.notFound(ACCOUNT_ID)])).toEqual([null]);
    await fetchProfile(ACCOUNT_ID, VISITOR);
    expect(network).toHaveBeenCalledTimes(2);
  });

  it("reports an unparseable body as malformed, and keeps nothing", async () => {
    network.mockImplementation(() =>
      Promise.resolve(new Response("<html>upstream error</html>", { status: 200 })),
    );
    expect(await fetchProfile(ACCOUNT_ID, VISITOR)).toEqual({ ok: false, reason: "malformed" });
    await fetchProfile(ACCOUNT_ID, VISITOR);
    expect(network).toHaveBeenCalledTimes(2);
  });

  it("does not keep a passing upstream failure", async () => {
    network.mockImplementation(() => Promise.resolve(new Response("", { status: 503 })));
    expect(await fetchProfile(ACCOUNT_ID, VISITOR)).toEqual({ ok: false, reason: "upstream" });
    await fetchProfile(ACCOUNT_ID, VISITOR);
    expect(network).toHaveBeenCalledTimes(2);
  });

  it("answers upstream when DE does not answer in time", async () => {
    network.mockRejectedValue(new DOMException("The operation timed out", "TimeoutError"));
    expect(await fetchProfile(ACCOUNT_ID, VISITOR)).toEqual({ ok: false, reason: "upstream" });
  });

  it("logs why DE refused, and never the id", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    network.mockResolvedValue(
      new Response("<html>blocked</html>", {
        status: 403,
        headers: { server: "cloudflare", "cf-mitigated": "challenge", "content-type": "text/html" },
      }),
    );
    expect(await fetchProfile(ACCOUNT_ID, VISITOR)).toEqual({ ok: false, reason: "throttled" });
    const line = String(warn.mock.calls[0]?.[0]);
    expect(line).toContain("status 403");
    expect(line).toContain("server cloudflare");
    expect(line).toContain("cf-mitigated challenge");
    expect(line).not.toContain(ACCOUNT_ID);
    expect(line).not.toContain(VISITOR);
    warn.mockRestore();
  });
});

describe("what the store keeps", () => {
  it("only the trimmed profile, compressed, never the raw payload", async () => {
    network.mockResolvedValue(profileResponse());
    const result = await fetchProfile(ACCOUNT_ID, VISITOR);
    const [value] = await memoryStore.getMany([storeKeys.profile(ACCOUNT_ID)]);
    expect(value).toMatch(/^[A-Za-z0-9+/]+=*$/);
    const stored = JSON.parse(gunzipSync(Buffer.from(value ?? "", "base64")).toString("utf8")) as {
      profile: Record<string, unknown>;
    };
    const allowed = new Set<string>(PROFILE_FIELDS);
    for (const key of Object.keys(stored.profile)) expect(allowed.has(key)).toBe(true);
    expect(stored.profile.LoadOutInventory).toEqual({ XPInfo: [] });
    expect(JSON.stringify(stored)).not.toContain(ACCOUNT_ID);
    if (result.ok) expect(result.profile).toEqual(stored.profile);
  });
});

describe("the lookup budget", () => {
  it("lets one visitor reach DE twice per window, then stops without calling", async () => {
    network.mockImplementation(() => Promise.resolve(notFoundResponse(86_400)));
    await fetchProfile("aaaaaaaaaaaaaaaaaaaaaaaa", VISITOR);
    await fetchProfile("bbbbbbbbbbbbbbbbbbbbbbbb", VISITOR);
    const third = await fetchProfile("cccccccccccccccccccccccc", VISITOR);
    expect(network).toHaveBeenCalledTimes(2);
    expect(third).toEqual({ ok: false, reason: "limited", retryAfterSeconds: 12 * 60 * 60 });
  });

  it("never extends the window with a later spend", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    network.mockImplementation(() => Promise.resolve(notFoundResponse(86_400)));
    await fetchProfile("aaaaaaaaaaaaaaaaaaaaaaaa", VISITOR);
    vi.setSystemTime(Date.now() + 2 * HOUR);
    await fetchProfile("bbbbbbbbbbbbbbbbbbbbbbbb", VISITOR);
    const third = await fetchProfile("cccccccccccccccccccccccc", VISITOR);
    expect(third).toEqual({ ok: false, reason: "limited", retryAfterSeconds: 10 * 60 * 60 });
    vi.setSystemTime(Date.now() + 10 * HOUR);
    await fetchProfile("cccccccccccccccccccccccc", VISITOR);
    expect(network).toHaveBeenCalledTimes(3);
  });

  it("does not charge a stored profile", async () => {
    network.mockResolvedValue(profileResponse());
    for (let i = 0; i < 5; i += 1) {
      expect((await fetchProfile(ACCOUNT_ID, VISITOR)).ok).toBe(true);
    }
    expect(network).toHaveBeenCalledTimes(1);
    const [spent] = await memoryStore.getMany([storeKeys.budget(VISITOR)]);
    expect(spent).toBe("1");
  });

  it("keeps a profile for twelve hours whatever max-age DE sends", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    network.mockImplementation(() => Promise.resolve(profileResponse("max-age=5")));
    await fetchProfile(ACCOUNT_ID, VISITOR);
    vi.setSystemTime(Date.now() + 12 * HOUR - 1);
    await fetchProfile(ACCOUNT_ID, "another-visitor");
    expect(network).toHaveBeenCalledTimes(1);
    vi.setSystemTime(Date.now() + 1);
    await fetchProfile(ACCOUNT_ID, "another-visitor");
    expect(network).toHaveBeenCalledTimes(2);
  });
});
