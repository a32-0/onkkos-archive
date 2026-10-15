import "server-only";

import { cookies } from "next/headers";

import { normalizeAccountId } from "@/domain/profile/account-id";
import { isYearMonth } from "@/domain/since";

const ACCOUNT_COOKIE = "wf_account";
const SINCE_COOKIE = "wf_since";
const PLACE_COOKIE = "wf_place";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const SYSTEM_ID = /^[a-z0-9-]{1,40}$/;
const PLACE_NAME = /^[^/]{1,80}$/;

const KEPT = { httpOnly: true, sameSite: "lax", path: "/", maxAge: ONE_YEAR_SECONDS } as const;

export interface LastPlace {
  system: string;
  place: string;
}

export async function readAccountId(): Promise<string | null> {
  const value = (await cookies()).get(ACCOUNT_COOKIE)?.value;
  return value ? normalizeAccountId(value) : null;
}

export async function writeAccountId(accountId: string): Promise<void> {
  (await cookies()).set(ACCOUNT_COOKIE, accountId, KEPT);
}

export async function forgetAccount(): Promise<void> {
  const store = await cookies();
  store.delete(ACCOUNT_COOKIE);
  store.delete(SINCE_COOKIE);
}

export async function readSince(): Promise<string | null> {
  const value = (await cookies()).get(SINCE_COOKIE)?.value;
  return isYearMonth(value) ? value : null;
}

export async function writeSince(yearMonth: string): Promise<void> {
  if (!isYearMonth(yearMonth)) return;
  (await cookies()).set(SINCE_COOKIE, yearMonth, KEPT);
}

function lastPlace(system: string | null, place: string | null): LastPlace | null {
  if (system === null || place === null) return null;
  return SYSTEM_ID.test(system) && PLACE_NAME.test(place) ? { system, place } : null;
}

export async function readPlace(): Promise<LastPlace | null> {
  const value = (await cookies()).get(PLACE_COOKIE)?.value;
  const slash = value?.indexOf("/") ?? -1;
  if (value === undefined || slash < 0) return null;
  return lastPlace(value.slice(0, slash), value.slice(slash + 1));
}

export function placeCookie(system: string | null, place: string | null) {
  const last = lastPlace(system, place);
  return last && { ...KEPT, name: PLACE_COOKIE, value: `${last.system}/${last.place}` };
}
