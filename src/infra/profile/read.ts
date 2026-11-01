import "server-only";

import { cache } from "react";

import { normalizeAccountId } from "@/domain/profile/account-id";
import { trimProfile } from "@/domain/profile/trim";
import type { FailureReason, RawProfile } from "@/domain/types/profile";
import { isDemoSite } from "@/infra/edition";
import { store } from "@/infra/store";
import { storeKeys, type Store } from "@/infra/store/store";

import { spendLookup } from "./budget";
import {
  decodeProfile,
  forgetProfile,
  keepNotFound,
  keepProfile,
  nextTryAt,
  releaseLock,
  takeLock,
  type StoredProfile,
} from "./cache";
import { circuitState, recordRefusal, recordSuccess } from "./circuit";
import { requestProfile } from "./client";
import { isDemoAccountId, liveSource, loadFixtureProfile } from "./fixture-source";
import { visitorKey } from "./visitor";

const WAIT_MS = 15_000;
const POLL_MS = 500;

export type ProfileResult =
  | {
      ok: true;
      profile: RawProfile;
      cached: boolean;
      fetchedAt: number;
      failedAt?: number;
      fixture?: true;
    }
  | { ok: false; reason: FailureReason; retryAfterSeconds?: number };

interface Snapshot {
  answer: ProfileResult | null;
  stored: StoredProfile | null;
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
  if (isDemoSite() && !isDemoAccountId(accountId)) return failure("not-found");

  if (!liveSource() || isDemoAccountId(accountId)) {
    const profile = loadFixtureProfile(accountId);
    if (!profile) return failure("malformed");
    return { ok: true, profile, cached: false, fetchedAt: Date.now(), fixture: true };
  }

  const key = `${accountId}|${visitor}`;
  const existing = inFlight.get(key);
  if (existing) return existing;
  const read = readLive(accountId, visitor)
    .catch((error: unknown) => {
      console.warn(
        `The store failed a read: ${error instanceof Error ? error.message : "unknown"}`,
      );
      return failure("upstream");
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, read);
  return read;
}

export async function forgetStoredProfile(accountId: string): Promise<void> {
  if (!liveSource() || isDemoAccountId(accountId)) return;
  try {
    await forgetProfile(store(), accountId);
  } catch (error: unknown) {
    console.warn(
      `The store failed to forget a profile: ${error instanceof Error ? error.message : "unknown"}`,
    );
  }
}

async function readLive(accountId: string, visitor: string): Promise<ProfileResult> {
  const shared = store();
  const seen = await snapshot(shared, accountId);
  const result = seen.answer ?? (await readDue(shared, accountId, visitor, seen));
  if (result.ok || !seen.stored) return result;
  return keepStale(shared, accountId, seen.stored);
}

async function keepStale(
  shared: Store,
  accountId: string,
  stored: StoredProfile,
): Promise<ProfileResult> {
  const triedAt = Date.now();
  await keepProfile(shared, accountId, { ...stored, triedAt });
  return {
    ok: true,
    profile: stored.profile,
    cached: true,
    fetchedAt: stored.readAt,
    failedAt: triedAt,
  };
}

async function readDue(
  shared: Store,
  accountId: string,
  visitor: string,
  first: Snapshot,
): Promise<ProfileResult> {
  const deadline = Date.now() + WAIT_MS;
  let seen = first;
  for (;;) {
    const circuit = circuitState(seen.circuit);
    if (circuit.open) return failure("circuit-open", circuit.retryAfterSeconds);

    if (await takeLock(shared, accountId)) {
      try {
        const read = await readUnderLock(shared, accountId, visitor, seen.refused);
        if (read.ok || !first.stored) return read;
        return await keepStale(shared, accountId, first.stored);
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
  if (stored && Date.now() < nextTryAt(stored)) answer = storedAnswer(stored);
  else if (notFound) answer = failure("not-found");
  return {
    answer,
    stored,
    locked: Boolean(lock),
    refused: Boolean(refusals ?? circuit),
    circuit: circuit ?? null,
  };
}

function storedAnswer(stored: StoredProfile): ProfileResult {
  const answer = {
    ok: true,
    profile: stored.profile,
    cached: true,
    fetchedAt: stored.readAt,
  } as const;
  return stored.triedAt === undefined ? answer : { ...answer, failedAt: stored.triedAt };
}

function failure(reason: FailureReason, retryAfterSeconds?: number): ProfileResult {
  if (retryAfterSeconds === undefined) return { ok: false, reason };
  return { ok: false, reason, retryAfterSeconds };
}
