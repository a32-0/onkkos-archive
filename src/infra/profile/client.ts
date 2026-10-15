import "server-only";

import { profileFromResponse } from "@/domain/profile/payload";
import type { RawProfile, RawProfileResponse } from "@/domain/types/profile";

import { ttlFromCacheControl } from "./cache";

const ENDPOINT = "https://api.warframe.com/cdn/getProfileViewingData.php";
const TIMEOUT_MS = 15_000;

export type Reading =
  | { kind: "profile"; profile: RawProfile }
  | { kind: "not-found"; ttlMs: number }
  | { kind: "refused"; reason: "throttled" | "upstream" }
  | { kind: "malformed" };

export async function requestProfile(accountId: string): Promise<Reading> {
  try {
    const response = await fetch(`${ENDPOINT}?playerId=${encodeURIComponent(accountId)}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Accept: "application/json,text/plain,*/*" },
      cache: "no-store",
    });
    return await classify(response);
  } catch {
    return { kind: "refused", reason: "upstream" };
  }
}

async function classify(response: Response): Promise<Reading> {
  if (response.status === 409 || response.status === 404) {
    const body = (await response.text()).trim();
    if (response.status === 404 || /could not find requested account/i.test(body)) {
      return {
        kind: "not-found",
        ttlMs: ttlFromCacheControl(response.headers.get("cache-control")),
      };
    }
    return { kind: "refused", reason: "throttled" };
  }
  if (response.status === 403 || response.status === 429) {
    return { kind: "refused", reason: "throttled" };
  }
  if (!response.ok) return { kind: "refused", reason: "upstream" };

  let parsed: RawProfileResponse;
  try {
    parsed = JSON.parse(await response.text()) as RawProfileResponse;
  } catch {
    return { kind: "malformed" };
  }
  const profile = profileFromResponse(parsed);
  return profile ? { kind: "profile", profile } : { kind: "malformed" };
}
