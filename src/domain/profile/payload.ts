import type { RawProfile, RawProfileResponse } from "@/domain/types/profile";

export function profileFromResponse(response: RawProfileResponse): RawProfile | null {
  const profile = response.Results?.[0];
  if (!profile) return null;
  return response.Stats ? { ...profile, Stats: response.Stats } : profile;
}

export function accountCreatedAt(profile: RawProfile): Date | null {
  const created = profile.Created as { $date?: { $numberLong?: string } } | undefined;
  const millis = Number(created?.$date?.$numberLong);
  return Number.isFinite(millis) && millis > 0 ? new Date(millis) : null;
}
