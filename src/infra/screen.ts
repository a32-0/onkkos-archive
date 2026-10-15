import "server-only";

import { cache } from "react";

import type { Graph } from "@/domain/graph/schema";
import { confirmedQuests, type ConfirmedQuests } from "@/domain/narrative/evidence";
import { toDisplayProfile, type DisplayProfile } from "@/domain/profile/display";
import type { FailureReason, RawProfile } from "@/domain/types/profile";
import { loadGraph } from "@/infra/graph/load";
import { loadEvidenceRules } from "@/infra/narrative/evidence-load";
import { PROFILE_TTL_MS } from "@/infra/profile/cache";
import { readProfile } from "@/infra/profile/read";
import { readAccountId } from "@/infra/session";

export interface Screen {
  accountId: string;
  profile: RawProfile;
  display: DisplayProfile;
  graph: Graph;
  confirmedQuests: ConfirmedQuests;
  cached: boolean;
  fetchedAt: number;
}

export type ScreenRead =
  | { state: "no-account" }
  | { state: "failed"; reason: FailureReason; retryAt: number | null }
  | { state: "ok"; screen: Screen };

export const readScreen = cache(async (): Promise<ScreenRead> => {
  const accountId = await readAccountId();
  if (!accountId) return { state: "no-account" };

  const result = await readProfile(accountId);
  if (!result.ok) {
    const retryAt =
      result.retryAfterSeconds === undefined
        ? null
        : Math.floor(Date.now() / 1000) + result.retryAfterSeconds;
    return { state: "failed", reason: result.reason, retryAt };
  }

  return {
    state: "ok",
    screen: {
      accountId,
      profile: result.profile,
      display: toDisplayProfile(result.profile),
      graph: loadGraph(),
      confirmedQuests: confirmedQuests(loadEvidenceRules(), result.profile),
      cached: result.cached,
      fetchedAt: result.fetchedAt,
    },
  };
});

export function nextReadAt(fetchedAt: number): number {
  return fetchedAt + PROFILE_TTL_MS;
}
