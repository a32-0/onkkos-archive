import "server-only";

import type { Store } from "./store";

export interface Entry {
  value: string;
  expiresAt: number;
}

const shared = globalThis as typeof globalThis & { wfMemoryStore?: Map<string, Entry> };

function entries(): Map<string, Entry> {
  shared.wfMemoryStore ??= new Map();
  return shared.wfMemoryStore;
}

export function mapStore(map: () => Map<string, Entry>, changed: () => void): Store {
  function live(key: string, now: number): Entry | null {
    const entry = map().get(key);
    if (!entry) return null;
    if (entry.expiresAt > now) return entry;
    map().delete(key);
    return null;
  }

  return {
    async getMany(keys) {
      const now = Date.now();
      return keys.map((key) => live(key, now)?.value ?? null);
    },
    async set(key, value, ttlMs) {
      map().set(key, { value, expiresAt: Date.now() + ttlMs });
      changed();
    },
    async setIfAbsent(key, value, ttlMs) {
      const now = Date.now();
      if (live(key, now)) return false;
      map().set(key, { value, expiresAt: now + ttlMs });
      changed();
      return true;
    },
    async increment(key, ttlMs) {
      const now = Date.now();
      const entry = live(key, now) ?? { value: "0", expiresAt: now + ttlMs };
      const count = Number(entry.value) + 1;
      map().set(key, { value: String(count), expiresAt: entry.expiresAt });
      changed();
      return { count, ttlMs: entry.expiresAt - now };
    },
    async remove(...keys) {
      for (const key of keys) map().delete(key);
      changed();
    },
  };
}

export const memoryStore: Store = mapStore(entries, () => undefined);

export function flush(): void {
  entries().clear();
}
