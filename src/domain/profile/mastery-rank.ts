import { catalogByUniqueName, type CatalogItem } from "@/domain/catalog/items";
import { rankFromXp, type MasteryWeight } from "@/domain/catalog/mastery";
import type { WikiNode } from "@/domain/catalog/wiki";
import type { RawProfile } from "@/domain/types/profile";

const POINTS_PER_RANK_STEP = 2_500;
const LAST_PLAIN_RANK = 30;
const LEGENDARY_STEP = 147_500;
const POINTS_PER_INTRINSIC = 1_500;
const POINTS_PER_AFFINITY_FACTOR = 5;
const INTRINSIC_PREFIX = "LPS_";
const SHOWN = 3;

export const HIGHEST_RANK = 36;

const NEW_WEAPON_POINTS = 3_000;
const NEW_FORTY_POINTS = 4_000;
const NEW_WARFRAME_POINTS = 6_000;
const NEW_NECRAMECH_POINTS = 8_000;
const INTRINSIC_TREES = 9;
const INTRINSIC_MAX_RANK = 10;

type RankWayKind = "yours" | "necramech" | "warframe" | "forty" | "weapon" | "intrinsic" | "node";

export interface RankWay {
  kind: RankWayKind;
  count: number;
  worth: number;
  covers: boolean;
}

export interface RankItem {
  item: CatalogItem;
  rank: number;
  left: number;
}

export type RankProgress =
  | { state: "highest"; rank: number }
  | {
      state: "progress";
      rank: number;
      next: number;
      share: number;
      full: boolean;
      left: number;
      shown: RankItem[];
      more: number;
      covers: boolean;
      newWeapons: number;
      ways: RankWay[];
      unlocks: CatalogItem[];
    };

function partsOf(left: number, worth: number): number {
  return Math.max(1, Math.ceil(left / worth));
}

export function rankThreshold(rank: number): number {
  if (rank <= LAST_PLAIN_RANK) return POINTS_PER_RANK_STEP * rank * rank;
  return POINTS_PER_RANK_STEP * LAST_PLAIN_RANK ** 2 + LEGENDARY_STEP * (rank - LAST_PLAIN_RANK);
}

function points(factor: number, rank: number): number {
  return (rank * factor) / POINTS_PER_AFFINITY_FACTOR;
}

function nodePoints(profile: RawProfile, nodes: readonly WikiNode[]): number {
  const mastery = new Map(nodes.flatMap((node) => (node.tag ? [[node.tag, node.mastery]] : [])));
  let total = 0;
  for (const mission of profile.Missions ?? []) {
    const points = mastery.get(mission?.Tag ?? "") ?? 0;
    if ((mission.Completes ?? 0) > 0) total += points;
    if ((mission.Tier ?? 0) > 0) total += points;
  }
  return total;
}

function nodesLeft(profile: RawProfile, nodes: readonly WikiNode[]): number[] {
  const played = new Map((profile.Missions ?? []).map((mission) => [mission?.Tag ?? "", mission]));
  const left: number[] = [];
  for (const node of nodes) {
    if (!node.tag || node.mastery <= 0) continue;
    const mission = played.get(node.tag);
    if ((mission?.Completes ?? 0) <= 0) left.push(node.mastery);
    if ((mission?.Tier ?? 0) <= 0) left.push(node.mastery);
  }
  return left.sort((a, b) => b - a);
}

function intrinsicRanks(profile: RawProfile): number {
  let ranks = 0;
  for (const [key, value] of Object.entries(profile.PlayerSkills ?? {})) {
    if (key.startsWith(INTRINSIC_PREFIX) && typeof value === "number" && value > 0) ranks += value;
  }
  return ranks;
}

function newItems(kind: RankWayKind, left: number, worth: number): RankWay {
  return { kind, count: partsOf(left, worth), worth, covers: true };
}

function fromPieces(kind: RankWayKind, pieces: readonly number[], left: number): RankWay | null {
  let sum = 0;
  let count = 0;
  for (const piece of pieces) {
    if (sum >= left) break;
    sum += piece;
    count += 1;
  }
  return count === 0 ? null : { kind, count, worth: sum / count, covers: sum >= left };
}

function waysOf(
  profile: RawProfile,
  nodes: readonly WikiNode[],
  shown: readonly RankItem[],
  left: number,
  necramechs: number,
): RankWay[] {
  const intrinsics = Math.max(0, INTRINSIC_TREES * INTRINSIC_MAX_RANK - intrinsicRanks(profile));
  const ways = [
    fromPieces("necramech", Array<number>(necramechs).fill(NEW_NECRAMECH_POINTS), left),
    newItems("warframe", left, NEW_WARFRAME_POINTS),
    newItems("forty", left, NEW_FORTY_POINTS),
    newItems("weapon", left, NEW_WEAPON_POINTS),
    fromPieces(
      "yours",
      shown.map((one) => one.left),
      left,
    ),
    fromPieces("intrinsic", Array<number>(intrinsics).fill(POINTS_PER_INTRINSIC), left),
    fromPieces("node", nodesLeft(profile, nodes), left),
  ];
  return ways.filter((way): way is RankWay => way !== null).sort((a, b) => b.worth - a.worth);
}

interface Ranked {
  owned: number;
  items: RankItem[];
}

function ranked(
  profile: RawProfile,
  catalog: CatalogItem[],
  weights: ReadonlyMap<string, MasteryWeight>,
): Ranked | null {
  const xpInfo = profile.LoadOutInventory?.XPInfo;
  if (!Array.isArray(xpInfo) || xpInfo.length === 0) return null;
  const byUniqueName = catalogByUniqueName(catalog);
  const items: RankItem[] = [];
  let owned = 0;
  for (const entry of xpInfo) {
    const item = byUniqueName.get(entry.ItemType);
    const weight =
      weights.get(entry.ItemType) ??
      (item ? { factor: item.affinityFactor, maxRank: item.maxRank } : null);
    if (!weight) continue;
    const rank = rankFromXp(entry.XP ?? 0, weight.factor, weight.maxRank);
    owned += points(weight.factor, rank);
    if (item) {
      items.push({
        item,
        rank,
        left: points(weight.factor, weight.maxRank) - points(weight.factor, rank),
      });
    }
  }
  return { owned, items };
}

function shortestWay(below: readonly RankItem[], left: number): RankItem[] {
  const way: RankItem[] = [];
  let sum = 0;
  for (const one of below) {
    if (sum >= left || way.length === SHOWN) break;
    way.push(one);
    sum += one.left;
  }
  return way;
}

export interface MasterySources {
  catalog: CatalogItem[];
  weights: ReadonlyMap<string, MasteryWeight>;
  nodes: readonly WikiNode[];
}

export function rankProgress(
  profile: RawProfile,
  { catalog, weights, nodes }: MasterySources,
): RankProgress | null {
  const rank = profile.PlayerLevel;
  if (typeof rank !== "number") return null;
  const read = ranked(profile, catalog, weights);
  if (read === null) return null;
  if (rank >= HIGHEST_RANK) return { state: "highest", rank };

  const { owned, items } = read;
  const total = Math.max(
    owned + nodePoints(profile, nodes) + intrinsicRanks(profile) * POINTS_PER_INTRINSIC,
    rankThreshold(rank),
  );
  const next = rank + 1;
  const from = rankThreshold(rank);
  const to = rankThreshold(next);
  const left = Math.max(0, to - total);
  const below = items
    .filter((one) => one.left > 0 && one.rank > 0)
    .sort((a, b) => b.left - a.left || a.item.name.localeCompare(b.item.name));
  const shown = left > 0 ? shortestWay(below, left) : [];
  const known = new Set(items.map((one) => one.item.uniqueName));
  return {
    state: "progress",
    rank,
    next,
    share: Math.min(1, (total - from) / (to - from)),
    full: left === 0,
    left,
    shown,
    more: shown.length > 0 ? below.length - shown.length : 0,
    covers: shown.reduce((sum, one) => sum + one.left, 0) >= left,
    newWeapons: partsOf(left, NEW_WEAPON_POINTS),
    ways:
      left > 0
        ? waysOf(
            profile,
            nodes,
            shown,
            left,
            catalog.filter((item) => item.kind === "Necramech" && !known.has(item.uniqueName))
              .length,
          )
        : [],
    unlocks: catalog.filter((item) => item.masteryReq === next && !known.has(item.uniqueName)),
  };
}
