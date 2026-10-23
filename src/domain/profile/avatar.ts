import type { RawProfile } from "@/domain/types/profile";

const GLYPH_ART = "https://cdn.warframestat.us/img";

export interface RawGlyph {
  uniqueName?: string;
  imageName?: string;
}

export const GLYPH_SOURCES = ["Glyphs"] as const;

export const DEFAULT_GLYPH = "/Lotus/Types/StoreItems/AvatarImages/AvatarImageDefault";

export function glyphArt(raw: readonly RawGlyph[]): Map<string, string> {
  const art = new Map<string, string>();
  for (const glyph of raw) {
    if (glyph.uniqueName && glyph.imageName) {
      art.set(glyph.uniqueName, `${GLYPH_ART}/${glyph.imageName}`);
    }
  }
  return art;
}

export function avatarOf(profile: RawProfile, art: ReadonlyMap<string, string>): string | null {
  const glyph = profile.ActiveAvatarImageType;
  const own = typeof glyph === "string" ? art.get(glyph) : undefined;
  return own ?? art.get(DEFAULT_GLYPH) ?? null;
}
