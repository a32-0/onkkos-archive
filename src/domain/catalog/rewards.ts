import { proximaPlace } from "@/domain/place/proxima";
import type { PlaceRewards } from "@/domain/place/schema";

export interface RewardRoute {
  place: string;
  node: string;
  mission: string | null;
  rotation: string | null;
  stage: string | null;
  chance: number | null;
  item: string;
}

function namesItem(rewardName: string, itemName: string): boolean {
  const reward = rewardName.toLowerCase();
  const item = itemName.toLowerCase();
  return reward === item || reward.startsWith(`${item} `);
}

export function rewardRoutes(rewards: PlaceRewards, itemName: string): RewardRoute[] {
  const out: RewardRoute[] = [];

  for (const [place, nodes] of Object.entries(rewards)) {
    for (const node of nodes) {
      for (const reward of node.rewards) {
        if (!namesItem(reward.item, itemName)) continue;
        out.push({
          place: proximaPlace(rewards, place, [node.node], node.mission),
          node: node.node,
          mission: node.mission,
          rotation: reward.rotation,
          stage: reward.stage ?? null,
          chance: reward.chance,
          item: reward.item,
        });
      }
    }
  }

  return out.sort((a, b) => (b.chance ?? 0) - (a.chance ?? 0));
}

export function partKey(rewardName: string, itemName: string): string {
  let rest = rewardName.trim();
  if (rest.toLowerCase().startsWith(itemName.toLowerCase())) {
    rest = rest.slice(itemName.length).trim();
  }
  rest = rest.replace(/\s*blueprint$/i, "").trim();
  return (rest.length > 0 ? rest : "Blueprint").toLowerCase();
}

export interface VendorOffer {
  syndicate: string;
  vendor: string | null;
  rank: string | null;
}

const VENDOR = /^([^(,/]+?)(?:\s*\(([^)]+)\))?(?:,\s*([^,/]+?))?\s*$/;

export function vendorOffer(location: string, syndicates: RegExp): VendorOffer | null {
  if (!syndicates.test(location)) return null;
  const match = VENDOR.exec(location.trim());
  if (!match) return null;
  const syndicate = (match[1] ?? "").trim();
  if (syndicate.length === 0) return null;
  return {
    syndicate,
    vendor: match[2]?.trim() ?? null,
    rank: match[3]?.trim() ?? null,
  };
}
