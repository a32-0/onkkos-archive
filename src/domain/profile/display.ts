import type { RawProfile } from "@/domain/types/profile";

export interface DisplayProfile {
  displayName?: string;
  masteryRank?: number;
}

const PRIVATE_USE = /[-]/gu;

export function toDisplayProfile(raw: RawProfile): DisplayProfile {
  const display: DisplayProfile = {};
  const name =
    typeof raw.DisplayName === "string" ? raw.DisplayName.replace(PRIVATE_USE, "").trim() : "";
  if (name) display.displayName = name;
  if (typeof raw.PlayerLevel === "number") display.masteryRank = raw.PlayerLevel;
  return display;
}
