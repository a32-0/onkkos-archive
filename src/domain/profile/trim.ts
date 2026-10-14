import type { RawProfile } from "@/domain/types/profile";

import { INVENTORY_FIELDS, PRESENCE_FIELDS, PROFILE_FIELDS } from "./fields";

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
  return trimmed as RawProfile;
}
