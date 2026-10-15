import "server-only";

import { cache } from "react";

import { normalizeAccountId } from "@/domain/profile/account-id";
import { trimProfile } from "@/domain/profile/trim";
import type { FailureReason, RawProfile } from "@/domain/types/profile";
import { store } from "@/infra/store";
import { storeKeys, type Store } from "@/infra/store/store";

import { spendLookup } from "./budget";
import { decodeProfile, keepNotFound, keepProfile, releaseLock, takeLock } from "./cache";
import { circuitState, recordRefusal, recordSuccess } from "./circuit";
import { requestProfile } from "./client";
import { isDemoAccountId, liveSource, loadFixtureProfile } from "./fixture-source";
import { visitorKey } from "./visitor";

const WAIT_MS = 15_000;
const POLL_MS = 500;

export type ProfileResult =
  | { ok: true; profile: RawProfile; cached: boolean; fetchedAt: number }
  | { ok: false; reason: FailureReason; retryAfterSeconds?: number };

interface Snapshot {
  answer: ProfileResult | null;
  locked: boolean;
  refused: boolean;
  circuit: string | null;
}

const inFlight = new Map<string, Promise<ProfileResult>>();

export const readProfile = cache(async (accountId: string): Promise<ProfileResult> =>
  fetchProfile(accountId, await visitorKey()),
);

export async function fetchProfile(rawAccountId: string, visitor: string): Promise<ProfileResult> {
  const accountId = normalizeAccountId(rawAccountId);
  if (!accountId) return failure("invalid-id");

  if (!liveSource() || isDemoAccountId(accountId)) {
    const profile = loadFixtureProfile(accountId);
    if (!profile) return failure("malformed");
    return { ok: true, profile, cached: false, fetchedAt: Date.now() };
  }

  const key = `${accountId}|${visitor}`;
  const existing = inFlight.get(key);
  if (existing) return existing;
  const read = readLive(accountId, visitor)
    .catch(() => failure("upstream"))
    .finally(() => inFlight.delete(key));
  inFlight.set(key, read);
  return read;
}

async function readLive(accountId: string, visitor: string): Promise<ProfileResult> {
  const shared = store();
  const deadline = Date.now() + WAIT_MS;
  let seen = await snapshot(shared, accountId);
  if (seen.answer) return seen.answer;

  for (;;) {
    const circuit = circuitState(seen.circuit);
    if (circuit.open) return failure("circuit-open", circuit.retryAfterSeconds);

    if (await takeLock(shared, accountId)) {
      try {
        return await readUnderLock(shared, accountId, visitor, seen.refused);
      } finally {
        await releaseLock(shared, accountId);
      }
    }

    const waited = await waitForWinner(shared, accountId, deadline);
    if (!waited) return failure("upstream");
    if (waited.answer) return waited.answer;
    seen = waited;
  }
}

async function waitForWinner(
  shared: Store,
  accountId: string,
  deadline: number,
): Promise<Snapshot | null> {
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    const seen = await snapshot(shared, accountId);
    if (seen.answer || !seen.locked) return seen;
  }
  return null;
}

async function readUnderLock(
  shared: Store,
  accountId: string,
  visitor: string,
  refused: boolean,
): Promise<ProfileResult> {
  const grant = await spendLookup(shared, visitor);
  if (!grant.ok) return failure("limited", grant.retryAfterSeconds);

  const reading = await requestProfile(accountId);
  switch (reading.kind) {
    case "profile": {
      const stored = { profile: trimProfile(reading.profile), readAt: Date.now() };
      await keepProfile(shared, accountId, stored);
      if (refused) await recordSuccess(shared);
      return { ok: true, profile: stored.profile, cached: false, fetchedAt: stored.readAt };
    }
    case "not-found":
      await keepNotFound(shared, accountId, reading.ttlMs);
      if (refused) await recordSuccess(shared);
      return failure("not-found");
    case "refused":
      await recordRefusal(shared);
      return failure(reading.reason);
    case "malformed":
      return failure("malformed");
  }
}

async function snapshot(shared: Store, accountId: string): Promise<Snapshot> {
  const [profile, notFound, lock, refusals, circuit] = await shared.getMany([
    storeKeys.profile(accountId),
    storeKeys.notFound(accountId),
    storeKeys.lock(accountId),
    storeKeys.refusals,
    storeKeys.circuit,
  ]);
  const stored = decodeProfile(profile);
  let answer: ProfileResult | null = null;
  if (stored)
    answer = { ok: true, profile: stored.profile, cached: true, fetchedAt: stored.readAt };
  else if (notFound) answer = failure("not-found");
  return {
    answer,
    locked: Boolean(lock),
    refused: Boolean(refusals ?? circuit),
    circuit: circuit ?? null,
  };
}

function failure(reason: FailureReason, retryAfterSeconds?: number): ProfileResult {
  if (retryAfterSeconds === undefined) return { ok: false, reason };
  return { ok: false, reason, retryAfterSeconds };
}
