import type { RawProfile } from "@/domain/types/profile";

import {
  INVENTORY_FIELDS,
  PRESENCE_FIELDS,
  PROFILE_FIELDS,
  TITLE_CHALLENGE_SUFFIX,
} from "./fields";

function titleChallenges(challenges: unknown): { Name: string; Progress: number }[] {
  if (!Array.isArray(challenges)) return [];
  return challenges.flatMap((challenge: { Name?: unknown; Progress?: unknown }) =>
    typeof challenge?.Name === "string" &&
    challenge.Name.endsWith(TITLE_CHALLENGE_SUFFIX) &&
    typeof challenge.Progress === "number" &&
    challenge.Progress > 0
      ? [{ Name: challenge.Name, Progress: challenge.Progress }]
      : [],
  );
}

export function trimProfile(profile: RawProfile): RawProfile {
  const trimmed: Record<string, unknown> = {};
  for (const field of PROFILE_FIELDS) {
    if (profile[field] !== undefined) trimmed[field] = profile[field];
  }
  for (const field of PRESENCE_FIELDS) {
    if (trimmed[field] !== undefined) trimmed[field] = true;
  }
  const inventory = profile.LoadOutInventory;
  if (inventory) {
    const kept: Record<string, unknown> = {};
    for (const field of INVENTORY_FIELDS) {
      if (inventory[field] !== undefined) kept[field] = inventory[field];
    }
    trimmed.LoadOutInventory = kept;
  }
  const titles = titleChallenges(profile.ChallengeProgress);
  if (titles.length > 0) trimmed.ChallengeProgress = titles;
  return trimmed as RawProfile;
}
