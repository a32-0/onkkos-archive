import worldstateData from "warframe-worldstate-data";

import type { RawProfile } from "@/domain/types/profile";

const STAR_CHART_TAG = /^(SolNode|SettlementNode|ClanNode)\d+$/;
const REGION_RE = /\(([^)]+)\)$/;

interface NodeCounts {
  total: number;
  done: number;
  steelPath: number;
}

interface CatalogNode {
  tag: string;
  name: string;
  region: string;
  type: string;
}

let catalog: CatalogNode[] | undefined;

export function nodesOfType(type: string): CatalogNode[] {
  return nodeCatalog().filter((node) => node.type.includes(type));
}

export function regionsPlayed(profile: RawProfile): Set<string> {
  const played = new Set<string>();
  const missions = profile.Missions;
  if (!Array.isArray(missions)) return played;
  const tags = new Set(
    missions.map((m) => m?.Tag).filter((tag): tag is string => typeof tag === "string"),
  );
  for (const node of nodeCatalog()) {
    if (tags.has(node.tag)) played.add(node.region);
  }
  return played;
}

export function nodeCountsByPlace(profile: RawProfile): Map<string, NodeCounts> | null {
  const missions = profile.Missions;
  if (!Array.isArray(missions)) return null;

  const byTag = new Map<string, { completes: number; tier: number }>();
  for (const mission of missions) {
    if (typeof mission?.Tag !== "string") continue;
    byTag.set(mission.Tag, { completes: mission.Completes ?? 1, tier: mission.Tier ?? 0 });
  }

  const counts = new Map<string, NodeCounts>();
  for (const node of nodeCatalog()) {
    const entry = counts.get(node.region) ?? { total: 0, done: 0, steelPath: 0 };
    entry.total += 1;
    const played = byTag.get(node.tag);
    if (played && played.completes > 0) entry.done += 1;
    if (played && played.tier >= 1) entry.steelPath += 1;
    counts.set(node.region, entry);
  }
  return counts;
}

function nodeCatalog(): CatalogNode[] {
  if (!catalog) {
    catalog = [];
    for (const [tag, node] of Object.entries(worldstateData.solNodes)) {
      if (!STAR_CHART_TAG.test(tag) || node.type === "Relay") continue;
      const region = REGION_RE.exec(node.value)?.[1];
      if (region) {
        catalog.push({
          tag,
          name: node.value,
          region,
          type: node.type ?? "",
        });
      }
    }
  }
  return catalog;
}
