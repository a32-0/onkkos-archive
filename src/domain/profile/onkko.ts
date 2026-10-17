import type { RawProfile } from "@/domain/types/profile";

export type OnkkoChoice = "on" | "off";

const CETUS = new Set(["CetusHub4", "SolNode228"]);

export function metOnkko(profile: RawProfile): boolean {
  if (!Array.isArray(profile.Missions)) return true;
  return profile.Missions.some((mission) => CETUS.has(mission.Tag));
}

export function isOnkkoChoice(value: unknown): value is OnkkoChoice {
  return value === "on" || value === "off";
}

export function onkkoSpeaks(profile: RawProfile, choice: OnkkoChoice | null): boolean {
  return metOnkko(profile) && choice !== "off";
}
