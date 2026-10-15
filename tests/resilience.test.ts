import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEMO_ACCOUNT_IDS } from "@/infra/profile/fixture-source";
import { fetchProfile } from "@/infra/profile/read";
import { flush, memoryStore } from "@/infra/store/memory";
import { storeKeys } from "@/infra/store/store";

const ACCOUNT_ID = "0f0f0f0f0f0f0f0f0f0f0f0f";
const VISITOR = "test-visitor";
const MINUTE = 60_000;

const network = vi.fn<typeof fetch>();
let unexpected = 0;

function profileResponse() {
  return new Response(JSON.stringify({ Results: [{ DisplayName: "Tester", PlayerLevel: 12 }] }), {
    status: 200,
  });
}

function refusal() {
  return new Response("", { status: 403 });
}

function otherId(i: number) {
  return `${"e".repeat(23)}${i.toString(16)}`;
}

async function otherInstance() {
  vi.resetModules();
  return import("@/infra/profile/read");
}

async function openCircuit() {
  network.mockImplementation(() => Promise.resolve(refusal()));
  for (let i = 0; i < 3; i += 1) await fetchProfile(otherId(i), `visitor-${i}`);
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
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
});

afterEach(() => {
  expect(unexpected).toBe(0);
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("the circuit", () => {
  it("opens after three refusals in a row and stops calling DE", async () => {
    await openCircuit();
    const result = await fetchProfile(otherId(4), "visitor-4");
    expect(network).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ ok: false, reason: "circuit-open", retryAfterSeconds: 30 * 60 });
  });

  it("is open for every instance, and closes after thirty minutes", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    await openCircuit();
    const other = await otherInstance();
    const during = await other.fetchProfile(otherId(4), "visitor-4");
    expect(during.ok ? null : during.reason).toBe("circuit-open");
    vi.setSystemTime(Date.now() + 30 * MINUTE);
    network.mockImplementation(() => Promise.resolve(profileResponse()));
    expect((await other.fetchProfile(otherId(4), "visitor-4")).ok).toBe(true);
    expect(network).toHaveBeenCalledTimes(4);
  });

  it("counts a timeout as a refusal", async () => {
    network.mockImplementation(() =>
      Promise.reject(new DOMException("The operation timed out", "TimeoutError")),
    );
    for (let i = 0; i < 3; i += 1) await fetchProfile(otherId(i), `visitor-${i}`);
    const result = await fetchProfile(otherId(4), "visitor-4");
    expect(result.ok ? null : result.reason).toBe("circuit-open");
  });

  it("never counts a not-found as a refusal", async () => {
    network.mockImplementation(() =>
      Promise.resolve(
        new Response("Could not find requested account", {
          status: 409,
          headers: { "cache-control": "public, max-age=600" },
        }),
      ),
    );
    for (let i = 0; i < 5; i += 1) {
      expect(await fetchProfile(otherId(i), `visitor-${i}`)).toEqual({
        ok: false,
        reason: "not-found",
      });
    }
    expect(network).toHaveBeenCalledTimes(5);
  });

  it("counts refusals with no success between them", async () => {
    network.mockImplementation(() => Promise.resolve(refusal()));
    await fetchProfile(otherId(0), "visitor-0");
    await fetchProfile(otherId(1), "visitor-1");
    network.mockImplementation(() => Promise.resolve(profileResponse()));
    await fetchProfile(otherId(2), "visitor-2");
    expect(await memoryStore.getMany([storeKeys.refusals])).toEqual([null]);
    network.mockImplementation(() => Promise.resolve(refusal()));
    await fetchProfile(otherId(3), "visitor-3");
    await fetchProfile(otherId(4), "visitor-4");
    expect(await memoryStore.getMany([storeKeys.refusals, storeKeys.circuit])).toEqual(["2", null]);
    expect(network).toHaveBeenCalledTimes(5);
  });

  it("lets a profile stored before it opened answer while it is open", async () => {
    network.mockImplementation(() => Promise.resolve(profileResponse()));
    await fetchProfile(ACCOUNT_ID, VISITOR);
    await openCircuit();
    const result = await fetchProfile(ACCOUNT_ID, "a-new-visitor");
    expect(result.ok && result.cached).toBe(true);
    expect(network).toHaveBeenCalledTimes(4);
  });
});

describe("two instances, one id", () => {
  it("call DE once, and the one that waits spends no lookup", async () => {
    vi.useFakeTimers();
    network.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(profileResponse()), 1_000)),
    );
    const other = await otherInstance();
    const first = fetchProfile(ACCOUNT_ID, "visitor-a");
    const second = other.fetchProfile(ACCOUNT_ID, "visitor-b");
    await vi.advanceTimersByTimeAsync(2_000);
    const [a, b] = await Promise.all([first, second]);
    expect(a.ok && !a.cached).toBe(true);
    expect(b.ok && b.cached).toBe(true);
    expect(network).toHaveBeenCalledTimes(1);
    expect(await memoryStore.getMany([storeKeys.budget("visitor-b")])).toEqual([null]);
  });

  it("the one that waits reads for itself when the winner keeps nothing", async () => {
    vi.useFakeTimers();
    network.mockImplementation(() => Promise.resolve(profileResponse()));
    await memoryStore.increment(storeKeys.budget("spent"), 12 * 60 * MINUTE);
    await memoryStore.increment(storeKeys.budget("spent"), 12 * 60 * MINUTE);
    const other = await otherInstance();
    const first = fetchProfile(ACCOUNT_ID, "spent");
    const second = other.fetchProfile(ACCOUNT_ID, "fresh");
    await vi.advanceTimersByTimeAsync(1_000);
    const [a, b] = await Promise.all([first, second]);
    expect(a.ok ? null : a.reason).toBe("limited");
    expect(b.ok && !b.cached).toBe(true);
    expect(network).toHaveBeenCalledTimes(1);
  });

  it("answers upstream after fifteen seconds still locked, and never calls DE", async () => {
    vi.useFakeTimers();
    await memoryStore.setIfAbsent(storeKeys.lock(ACCOUNT_ID), "another-instance", 20_000);
    const result = fetchProfile(ACCOUNT_ID, VISITOR);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(await result).toEqual({ ok: false, reason: "upstream" });
    expect(await memoryStore.getMany([storeKeys.budget(VISITOR)])).toEqual([null]);
  });

  it("is never blocked by a crashed winner past twenty seconds", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    await memoryStore.setIfAbsent(storeKeys.lock(ACCOUNT_ID), "crashed", 20_000);
    vi.setSystemTime(Date.now() + 20_000);
    network.mockImplementation(() => Promise.resolve(profileResponse()));
    expect((await fetchProfile(ACCOUNT_ID, VISITOR)).ok).toBe(true);
  });
});

describe("the store", () => {
  it("fails closed when production reads live without it", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(await fetchProfile(ACCOUNT_ID, VISITOR)).toEqual({ ok: false, reason: "upstream" });
    expect(network).not.toHaveBeenCalled();
  });

  it("fails closed when it stops answering, and DE is never read", async () => {
    vi.spyOn(memoryStore, "getMany").mockRejectedValueOnce(new Error("over the allowance"));
    expect(await fetchProfile(ACCOUNT_ID, VISITOR)).toEqual({ ok: false, reason: "upstream" });
    expect(network).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});

describe("the source", () => {
  it("reads a fixture for every id unless it is set to live", async () => {
    vi.stubEnv("WF_PROFILE_SOURCE", "");
    const result = await fetchProfile(ACCOUNT_ID, VISITOR);
    expect(result.ok && result.profile.DisplayName).toBe("Cy");
    vi.stubEnv("WF_PROFILE_SOURCE", "fixture");
    expect((await fetchProfile(ACCOUNT_ID, VISITOR)).ok).toBe(true);
    expect(network).not.toHaveBeenCalled();
  });

  it("serves the two demos from their fixtures even when live", async () => {
    const cy = await fetchProfile(DEMO_ACCOUNT_IDS.cy, VISITOR);
    const ordis = await fetchProfile(DEMO_ACCOUNT_IDS.ordis, VISITOR);
    expect(cy.ok && cy.profile.PlayerLevel).toBe(27);
    expect(ordis.ok && ordis.profile.PlayerLevel).toBe(2);
    expect(network).not.toHaveBeenCalled();
    expect(await memoryStore.getMany([storeKeys.budget(VISITOR)])).toEqual([null]);
  });

  it("still checks the id's shape", async () => {
    vi.stubEnv("WF_PROFILE_SOURCE", "fixture");
    expect(await fetchProfile("not-an-id", VISITOR)).toEqual({ ok: false, reason: "invalid-id" });
  });
});
