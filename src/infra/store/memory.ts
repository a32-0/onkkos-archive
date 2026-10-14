import "server-only";

import type { Store } from "./store";

interface Entry {
  value: string;
  expiresAt: number;
}

const shared = globalThis as typeof globalThis & { wfMemoryStore?: Map<string, Entry> };

function entries(): Map<string, Entry> {
  shared.wfMemoryStore ??= new Map();
  return shared.wfMemoryStore;
}

function live(key: string, now: number): Entry | null {
  const entry = entries().get(key);
  if (!entry) return null;
  if (entry.expiresAt > now) return entry;
  entries().delete(key);
  return null;
}

export const memoryStore: Store = {
  async getMany(keys) {
    const now = Date.now();
    return keys.map((key) => live(key, now)?.value ?? null);
  },
  async set(key, value, ttlMs) {
    entries().set(key, { value, expiresAt: Date.now() + ttlMs });
  },
  async setIfAbsent(key, value, ttlMs) {
    const now = Date.now();
    if (live(key, now)) return false;
    entries().set(key, { value, expiresAt: now + ttlMs });
    return true;
  },
  async increment(key, ttlMs) {
    const now = Date.now();
    const entry = live(key, now) ?? { value: "0", expiresAt: now + ttlMs };
    const count = Number(entry.value) + 1;
    entries().set(key, { value: String(count), expiresAt: entry.expiresAt });
    return { count, ttlMs: entry.expiresAt - now };
  },
  async remove(...keys) {
    for (const key of keys) entries().delete(key);
  },
};

export function flush(): void {
  entries().clear();
}
