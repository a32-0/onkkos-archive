const WEAPON_FACTOR = 500;
const SUIT_FACTOR = 1000;
const DEFAULT_MAX_RANK = 30;
const NECRAMECH_MAX_RANK = 40;

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

export function maxRankOf(maxLevelCap: number | undefined, productCategory?: string): number {
  if (maxLevelCap && maxLevelCap > 0) return maxLevelCap;
  return productCategory === "MechSuits" ? NECRAMECH_MAX_RANK : DEFAULT_MAX_RANK;
}

export function rankFromXp(xp: number, factor: number, maxRank: number): number {
  if (!Number.isFinite(xp) || xp <= 0) return 0;
  return Math.min(maxRank, Math.floor(Math.sqrt(xp / factor)));
}

export interface MasteryWeight {
  factor: number;
  maxRank: number;
}

export function masteryWeights(
  raw: readonly {
    uniqueName: string;
    masterable?: boolean;
    productCategory?: string;
    maxLevelCap?: number;
  }[],
): Map<string, MasteryWeight> {
  const weights = new Map<string, MasteryWeight>();
  for (const item of raw) {
    if (item.masterable !== true || weights.has(item.uniqueName)) continue;
    weights.set(item.uniqueName, {
      factor: affinityFactor(item.productCategory),
      maxRank: maxRankOf(item.maxLevelCap, item.productCategory),
    });
  }
  return weights;
}
