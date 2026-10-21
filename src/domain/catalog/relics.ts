import type { CatalogDrop } from "@/domain/catalog/items";
import { proximaPlace } from "@/domain/place/proxima";
import type { PlaceRewards } from "@/domain/place/schema";

type Refinement = "Intact" | "Exceptional" | "Flawless" | "Radiant";

export interface RelicReward {
  name: string;
  rarity: string | null;
  intact: number | null;
  radiant: number | null;
}

interface RelicFarm {
  place: string;
  node: string;
  mission: string | null;
  rotation: string | null;
  chance: number | null;
}

export interface Relic {
  name: string;
  uniqueName: string;
  imageUrl: string | null;
  wikiUrl: string | null;
  vaulted: boolean;
  rewards: RelicReward[];
  farms: RelicFarm[];
}

export interface RelicOffer {
  relic: string;
  rarity: string | null;
  intact: number | null;
  radiant: number | null;
  imageUrl: string | null;
  vaulted: boolean;
  farm: RelicFarm | null;
  farms: number;
}

export interface RawRelic {
  uniqueName?: string;
  name?: string;
  imageName?: string;
  wikiaUrl?: string;
  vaulted?: boolean;
  rewards?: { chance?: number; rarity?: string; item?: { name?: string } }[];
}

export const RELIC_SOURCES = ["Relics"];

const ICON_BASE = "https://cdn.warframestat.us/img";
const REFINED = /^(.+) (Intact|Exceptional|Flawless|Radiant)$/;
const DROP = /^(.+ Relic)(?:\s*\((Exceptional|Flawless|Radiant)\))?$/;
const UNNAMED = /\bundefined\b/;

export function buildRelicCatalog(raw: RawRelic[], rewards: PlaceRewards): Map<string, Relic> {
  const byRefinement = new Map<string, Partial<Record<Refinement, RawRelic>>>();
  for (const entry of raw) {
    const match = REFINED.exec(entry.name ?? "");
    if (!match?.[1] || !match[2]) continue;
    const name = `${match[1]} Relic`;
    const set = byRefinement.get(name) ?? {};
    set[match[2] as Refinement] = entry;
    byRefinement.set(name, set);
  }

  const farms = relicFarms(rewards);
  const relics = new Map<string, Relic>();
  for (const [name, set] of byRefinement) {
    const intact = set.Intact ?? set.Radiant;
    if (!intact) continue;
    const radiant = new Map(
      (set.Radiant?.rewards ?? []).map((reward) => [reward.item?.name ?? "", reward.chance]),
    );
    relics.set(name, {
      name,
      uniqueName: intact.uniqueName ?? "",
      imageUrl: intact.imageName ? `${ICON_BASE}/${intact.imageName}` : null,
      wikiUrl: intact.wikiaUrl ?? null,
      vaulted: intact.vaulted === true,
      rewards: (set.Intact?.rewards ?? [])
        .filter((reward) => typeof reward.item?.name === "string")
        .map((reward) => ({
          name: reward.item?.name ?? "",
          rarity: reward.rarity ?? null,
          intact: reward.chance ?? null,
          radiant: radiant.get(reward.item?.name ?? "") ?? null,
        }))
        .sort((a, b) => (a.intact ?? 0) - (b.intact ?? 0) || a.name.localeCompare(b.name)),
      farms: farms.get(name) ?? [],
    });
  }

  return relics;
}

export function relicOffers(
  catalog: ReadonlyMap<string, Relic>,
  drops: readonly CatalogDrop[],
): RelicOffer[] {
  const grouped = new Map<string, { rarity: string | null; chances: Map<Refinement, number> }>();
  for (const drop of drops) {
    const match = DROP.exec(drop.location.trim());
    if (!match?.[1] || UNNAMED.test(match[1])) continue;
    const entry = grouped.get(match[1]) ?? { rarity: drop.rarity, chances: new Map() };
    if (drop.chance !== null) entry.chances.set((match[2] as Refinement) ?? "Intact", drop.chance);
    grouped.set(match[1], entry);
  }

  return [...grouped]
    .map(([name, entry]) => {
      const relic = catalog.get(name);
      const farms = relic?.farms ?? [];
      return {
        relic: name,
        rarity: entry.rarity,
        intact: entry.chances.get("Intact") ?? null,
        radiant: entry.chances.get("Radiant") ?? null,
        imageUrl: relic?.imageUrl ?? null,
        vaulted: relic?.vaulted ?? false,
        farm: farms[0] ?? null,
        farms: farms.length,
      };
    })
    .sort(
      (a, b) =>
        Number(a.vaulted) - Number(b.vaulted) ||
        Number(a.farm === null) - Number(b.farm === null) ||
        (b.radiant ?? b.intact ?? 0) - (a.radiant ?? a.intact ?? 0) ||
        a.relic.localeCompare(b.relic),
    );
}

function relicFarms(rewards: PlaceRewards): Map<string, RelicFarm[]> {
  const farms = new Map<string, RelicFarm[]>();
  for (const [place, nodes] of Object.entries(rewards)) {
    for (const node of nodes) {
      if (node.isEvent) continue;
      for (const reward of node.rewards) {
        if (!reward.item.endsWith(" Relic")) continue;
        const list = farms.get(reward.item) ?? [];
        list.push({
          place: proximaPlace(rewards, place, [node.node], node.mission),
          node: node.mission ? node.node.replace(` (${node.mission})`, "") : node.node,
          mission: node.mission,
          rotation: reward.rotation,
          chance: reward.chance,
        });
        farms.set(reward.item, list);
      }
    }
  }
  for (const list of farms.values()) list.sort((a, b) => (b.chance ?? 0) - (a.chance ?? 0));
  return farms;
}

export function rewardOffers(
  catalog: ReadonlyMap<string, Relic>,
  names: readonly string[],
): RelicOffer[] {
  const offers: RelicOffer[] = [];
  for (const relic of catalog.values()) {
    const reward = relic.rewards.find((one) => names.includes(one.name));
    if (!reward) continue;
    offers.push({
      relic: relic.name,
      rarity: reward.rarity,
      intact: reward.intact,
      radiant: reward.radiant,
      imageUrl: relic.imageUrl,
      vaulted: relic.vaulted,
      farm: relic.farms[0] ?? null,
      farms: relic.farms.length,
    });
  }
  return offers.sort((a, b) => a.relic.localeCompare(b.relic));
}
