const WEAPON_FACTOR = 500;
const SUIT_FACTOR = 1000;
const DEFAULT_MAX_RANK = 30;

export function affinityFactor(productCategory: string | undefined): number {
  switch (productCategory) {
    case "Suits":
    case "MechSuits":
    case "SpaceSuits":
    case "Sentinels":
    case "KubrowPets":
      return SUIT_FACTOR;
    default:
      return WEAPON_FACTOR;
  }
}

export function maxRankOf(maxLevelCap: number | undefined): number {
  return maxLevelCap && maxLevelCap > 0 ? maxLevelCap : DEFAULT_MAX_RANK;
}

export function rankFromXp(xp: number, factor: number, maxRank: number): number {
  if (!Number.isFinite(xp) || xp <= 0) return 0;
  return Math.min(maxRank, Math.floor(Math.sqrt(xp / factor)));
}
