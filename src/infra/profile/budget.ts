import "server-only";

import { storeKeys, type Store } from "@/infra/store/store";

import { PROFILE_TTL_MS } from "./cache";

const LOOKUPS_PER_VISITOR = 2;

export type LookupGrant = { ok: true } | { ok: false; retryAfterSeconds: number };

export async function spendLookup(store: Store, visitor: string): Promise<LookupGrant> {
  const { count, ttlMs } = await store.increment(storeKeys.budget(visitor), PROFILE_TTL_MS);
  if (count <= LOOKUPS_PER_VISITOR) return { ok: true };
  return { ok: false, retryAfterSeconds: Math.ceil(ttlMs / 1000) };
}
