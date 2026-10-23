import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fileStore } from "@/infra/store/file";

const MINUTE = 60_000;
const ACCOUNT_ID = "0f0f0f0f0f0f0f0f0f0f0f0f";

let folder = "";
let file = "";

const network = vi.fn<typeof fetch>();

function profileResponse() {
  return new Response(JSON.stringify({ Results: [{ DisplayName: "Tester", PlayerLevel: 12 }] }), {
    status: 200,
  });
}

function otherId(i: number) {
  return `${"e".repeat(23)}${i.toString(16)}`;
}

async function restartedApp() {
  vi.resetModules();
  return import("@/infra/profile/read");
}

beforeEach(() => {
  folder = mkdtempSync(path.join(tmpdir(), "wf-store-"));
  file = path.join(folder, "store.json");
  network.mockReset();
  network.mockImplementation(() => Promise.reject(new Error("A test reached the network")));
  vi.stubGlobal("fetch", network);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  rmSync(folder, { recursive: true, force: true });
});

describe("the store file", () => {
  it("keeps what was set after the app closes and opens again", async () => {
    await fileStore(file).set("wf:a", "one", MINUTE);
    expect(await fileStore(file).getMany(["wf:a", "wf:b"])).toEqual(["one", null]);
  });

  it("drops what expired while the app was closed", async () => {
    vi.useFakeTimers();
    await fileStore(file).set("wf:a", "one", MINUTE);
    vi.advanceTimersByTime(MINUTE);
    expect(await fileStore(file).getMany(["wf:a"])).toEqual([null]);
  });

  it("keeps a budget's window across a restart, never extending it", async () => {
    vi.useFakeTimers();
    await fileStore(file).increment("wf:budget", MINUTE);
    vi.advanceTimersByTime(20_000);
    expect(await fileStore(file).increment("wf:budget", MINUTE)).toEqual({
      count: 2,
      ttlMs: MINUTE - 20_000,
    });
  });

  it("removes keys for good", async () => {
    const opened = fileStore(file);
    await opened.set("wf:a", "one", MINUTE);
    await opened.remove("wf:a");
    expect(await fileStore(file).getMany(["wf:a"])).toEqual([null]);
  });

  it("reads the last complete file when a write was cut short", async () => {
    await fileStore(file).set("wf:a", "one", MINUTE);
    writeFileSync(`${file}.tmp`, '{"wf:a":{"val');
    expect(await fileStore(file).getMany(["wf:a"])).toEqual(["one"]);
  });

  it("starts empty from a missing or unreadable file", async () => {
    expect(await fileStore(file).getMany(["wf:a"])).toEqual([null]);
    writeFileSync(file, "not json");
    expect(await fileStore(file).getMany(["wf:a"])).toEqual([null]);
  });
});

describe("spec 11's locks on the store file", () => {
  beforeEach(() => {
    vi.stubEnv("WF_PROFILE_SOURCE", "live");
    vi.stubEnv("WF_STORE_FILE", file);
  });

  it("reads a profile once, and from the store after a restart", async () => {
    network.mockImplementation(() => Promise.resolve(profileResponse()));
    const first = await restartedApp();
    expect((await first.fetchProfile(ACCOUNT_ID, "local")).ok).toBe(true);
    const second = await restartedApp();
    const again = await second.fetchProfile(ACCOUNT_ID, "local");
    expect(again.ok && again.cached).toBe(true);
    expect(network).toHaveBeenCalledTimes(1);
  });

  it("keeps a spent budget after a restart", async () => {
    network.mockImplementation(() => Promise.resolve(profileResponse()));
    const first = await restartedApp();
    await first.fetchProfile(otherId(0), "local");
    await first.fetchProfile(otherId(1), "local");
    const second = await restartedApp();
    const third = await second.fetchProfile(otherId(2), "local");
    expect(third.ok ? null : third.reason).toBe("limited");
    expect(network).toHaveBeenCalledTimes(2);
  });

  it("keeps an open circuit open after a restart", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    network.mockImplementation(() => Promise.resolve(new Response("", { status: 403 })));
    const first = await restartedApp();
    for (let i = 0; i < 3; i += 1) await first.fetchProfile(otherId(i), `visitor-${i}`);
    const second = await restartedApp();
    const after = await second.fetchProfile(otherId(4), "visitor-4");
    expect(after.ok ? null : after.reason).toBe("circuit-open");
    expect(network).toHaveBeenCalledTimes(3);
  });
});
