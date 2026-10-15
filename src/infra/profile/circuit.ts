import "server-only";

import { storeKeys, type Store } from "@/infra/store/store";

const REFUSALS_TO_OPEN = 3;
const OPEN_MS = 30 * 60 * 1000;

export type CircuitState = { open: false } | { open: true; retryAfterSeconds: number };

export function circuitState(closesAt: string | null | undefined): CircuitState {
  const remaining = Number(closesAt) - Date.now();
  if (!closesAt || !(remaining > 0)) return { open: false };
  return { open: true, retryAfterSeconds: Math.ceil(remaining / 1000) };
}

export async function recordSuccess(store: Store) {
  await store.remove(storeKeys.refusals, storeKeys.circuit);
}

export async function recordRefusal(store: Store) {
  const { count } = await store.increment(storeKeys.refusals, OPEN_MS);
  if (count >= REFUSALS_TO_OPEN) {
    await store.set(storeKeys.circuit, String(Date.now() + OPEN_MS), OPEN_MS);
  }
}
