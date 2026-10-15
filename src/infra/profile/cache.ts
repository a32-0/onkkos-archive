import "server-only";

import { gunzipSync, gzipSync } from "node:zlib";

import type { RawProfile } from "@/domain/types/profile";
import { storeKeys, type Store } from "@/infra/store/store";

export const PROFILE_TTL_MS = 12 * 60 * 60 * 1000;

const MIN_TTL_MS = 60_000;
const DEFAULT_TTL_MS = 600_000;
const MAX_TTL_MS = 24 * 60 * 60 * 1000;
const LOCK_TTL_MS = 20_000;

export interface StoredProfile {
  profile: RawProfile;
  readAt: number;
}

export function ttlFromCacheControl(header: string | null): number {
  if (!header) return DEFAULT_TTL_MS;
  const match = /max-age\s*=\s*(\d+)/i.exec(header);
  if (!match?.[1]) return DEFAULT_TTL_MS;
  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds)) return DEFAULT_TTL_MS;
  return Math.min(Math.max(seconds * 1000, MIN_TTL_MS), MAX_TTL_MS);
}

export function decodeProfile(value: string | null | undefined): StoredProfile | null {
  if (!value) return null;
  try {
    return JSON.parse(gunzipSync(Buffer.from(value, "base64")).toString("utf8")) as StoredProfile;
  } catch {
    return null;
  }
}

export async function keepProfile(store: Store, accountId: string, stored: StoredProfile) {
  const value = gzipSync(JSON.stringify(stored)).toString("base64");
  await store.set(storeKeys.profile(accountId), value, PROFILE_TTL_MS);
}

export async function keepNotFound(store: Store, accountId: string, ttlMs: number) {
  await store.set(storeKeys.notFound(accountId), "1", ttlMs);
}

export async function takeLock(store: Store, accountId: string): Promise<boolean> {
  return store.setIfAbsent(storeKeys.lock(accountId), crypto.randomUUID(), LOCK_TTL_MS);
}

export async function releaseLock(store: Store, accountId: string) {
  await store.remove(storeKeys.lock(accountId));
}
