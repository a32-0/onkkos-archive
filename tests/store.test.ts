import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { store } from "@/infra/store";
import { flush, memoryStore } from "@/infra/store/memory";
import { storeKeys } from "@/infra/store/store";

const minute = 60_000;

beforeEach(() => {
  flush();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("the store's contract, on the memory backend", () => {
  it("reads several keys at once, null where nothing is stored", async () => {
    await memoryStore.set("wf:a", "one", minute);
    expect(await memoryStore.getMany(["wf:a", "wf:b"])).toEqual(["one", null]);
    expect(await memoryStore.getMany([])).toEqual([]);
  });

  it("lets a key expire after its time", async () => {
    await memoryStore.set("wf:a", "one", minute);
    vi.advanceTimersByTime(minute - 1);
    expect(await memoryStore.getMany(["wf:a"])).toEqual(["one"]);
    vi.advanceTimersByTime(1);
    expect(await memoryStore.getMany(["wf:a"])).toEqual([null]);
  });

  it("sets a key only when it is absent or expired", async () => {
    expect(await memoryStore.setIfAbsent("wf:lock", "first", minute)).toBe(true);
    expect(await memoryStore.setIfAbsent("wf:lock", "second", minute)).toBe(false);
    expect(await memoryStore.getMany(["wf:lock"])).toEqual(["first"]);
    vi.advanceTimersByTime(minute);
    expect(await memoryStore.setIfAbsent("wf:lock", "second", minute)).toBe(true);
    expect(await memoryStore.getMany(["wf:lock"])).toEqual(["second"]);
  });

  it("counts within a window a later spend never extends", async () => {
    expect(await memoryStore.increment("wf:budget", minute)).toEqual({ count: 1, ttlMs: minute });
    vi.advanceTimersByTime(20_000);
    expect(await memoryStore.increment("wf:budget", minute)).toEqual({
      count: 2,
      ttlMs: minute - 20_000,
    });
    vi.advanceTimersByTime(minute - 20_000);
    expect(await memoryStore.increment("wf:budget", minute)).toEqual({ count: 1, ttlMs: minute });
  });

  it("removes several keys at once", async () => {
    await memoryStore.set("wf:a", "one", minute);
    await memoryStore.set("wf:b", "two", minute);
    await memoryStore.remove("wf:a", "wf:b");
    expect(await memoryStore.getMany(["wf:a", "wf:b"])).toEqual([null, null]);
  });

  it("empties on flush", async () => {
    await memoryStore.set("wf:a", "one", minute);
    flush();
    expect(await memoryStore.getMany(["wf:a"])).toEqual([null]);
  });

  it("survives the modules being evaluated again, as a hot reload does", async () => {
    await memoryStore.set("wf:a", "one", minute);
    vi.resetModules();
    const reloaded = await import("@/infra/store/memory");
    expect(reloaded.memoryStore).not.toBe(memoryStore);
    expect(await reloaded.memoryStore.getMany(["wf:a"])).toEqual(["one"]);
  });
});

describe("the keys", () => {
  it("all start with wf:", () => {
    const keys = [
      storeKeys.profile("id"),
      storeKeys.notFound("id"),
      storeKeys.lock("id"),
      storeKeys.budget("visitor"),
      storeKeys.refusals,
      storeKeys.circuit,
    ];
    for (const key of keys) expect(key.startsWith("wf:")).toBe(true);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("choosing the backend", () => {
  it("uses memory when no store file is named", () => {
    vi.stubEnv("WF_STORE_FILE", "");
    expect(store()).toBe(memoryStore);
  });

  it("refuses the memory backend in production reading live", () => {
    vi.stubEnv("WF_STORE_FILE", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("WF_PROFILE_SOURCE", "live");
    expect(() => store()).toThrow();
    vi.stubEnv("WF_PROFILE_SOURCE", "fixture");
    expect(store()).toBe(memoryStore);
  });
});
