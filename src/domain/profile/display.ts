import type { RawProfile } from "@/domain/types/profile";

export interface DisplayProfile {
  displayName?: string;
  masteryRank?: number;
}

export function toDisplayProfile(raw: RawProfile): DisplayProfile {
  const display: DisplayProfile = {};
  if (typeof raw.DisplayName === "string") display.displayName = raw.DisplayName;
  if (typeof raw.PlayerLevel === "number") display.masteryRank = raw.PlayerLevel;
  return display;
}
