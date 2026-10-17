import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { profileFromResponse } from "@/domain/profile/payload";
import { trimProfile } from "@/domain/profile/trim";
import type { RawProfile, RawProfileResponse } from "@/domain/types/profile";

export const DEMO_ACCOUNT_IDS = {
  cy: "000000000000000000000001",
  ordis: "000000000000000000000002",
} as const;

const FIXTURE_BY_ACCOUNT_ID: Record<string, string> = {
  [DEMO_ACCOUNT_IDS.cy]: "profile-cy",
  [DEMO_ACCOUNT_IDS.ordis]: "profile-ordis",
};

const DEFAULT_FIXTURE = "profile-cy";

const DEMO_GLYPHS: Record<string, string> = {
  "profile-cy": "/Lotus/Types/StoreItems/AvatarImages/ImageCephalonCy",
  "profile-ordis": "/Lotus/Types/StoreItems/AvatarImages/AvatarImageConqueraOrdis",
};

export function liveSource(): boolean {
  return process.env.WF_PROFILE_SOURCE === "live";
}

export function isDemoAccountId(accountId: string): boolean {
  return accountId in FIXTURE_BY_ACCOUNT_ID;
}

export function loadFixtureProfile(accountId: string): RawProfile | null {
  const name = FIXTURE_BY_ACCOUNT_ID[accountId] ?? DEFAULT_FIXTURE;
  try {
    const file = path.join(process.cwd(), "fixtures", `${name}.json`);
    const raw = JSON.parse(readFileSync(file, "utf8")) as RawProfileResponse;
    const profile = profileFromResponse(raw);
    if (!profile) return null;
    const glyph = DEMO_GLYPHS[name];
    return trimProfile(glyph ? { ...profile, ActiveAvatarImageType: glyph } : profile);
  } catch {
    return null;
  }
}
