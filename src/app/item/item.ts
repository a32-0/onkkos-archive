import "server-only";

import { collectibleStepPlan, stepPlan, type Part } from "@/domain/catalog/checks";
import { collectibleView } from "@/domain/catalog/collectibles";
import { dossier } from "@/domain/catalog/dossier";
import { BLUEPRINT_ART } from "@/domain/catalog/items";
import { allPlaces } from "@/domain/catalog/places";
import { briefOf, type BriefBlock } from "@/domain/catalog/summary";
import { bestPlaces, itemLine, type WhatsNewSources } from "@/domain/catalog/whats-new";
import { itemGaps, readReach } from "@/domain/place/reach";
import { canonicalPlace } from "@/domain/place/schema";
import { itemRanks, stateByName } from "@/domain/place/state";
import { catalogData } from "@/infra/catalog/data";
import { loadSystems, placeCatalog, placeIndex } from "@/infra/place/load";
import type { Screen } from "@/infra/screen";
import type { ItemFacts, ItemPlace } from "@/screens/item/state";

const NO_PARTS: Part[] = [];

function systemPlace(name: string): string | null {
  const { systems, aliases } = loadSystems();
  const place = canonicalPlace(aliases, name);
  return systems.some((one) => one.released && one.places.includes(place)) ? place : null;
}

function namedPlace(blocks: readonly BriefBlock[]): string | null {
  const line = blocks[0]?.lines[0];
  if (!line) return null;
  const named = (line.where.length > 0 ? line.where : line.reading).filter(
    (part): part is string => typeof part === "string",
  );
  for (const name of named) {
    const place = systemPlace(name);
    if (place) return place;
  }
  return null;
}

function placeOf(place: string | null): ItemPlace | null {
  if (place === null) return null;
  const { systems, colors } = loadSystems();
  const system = systems.find((one) => one.released && one.places.includes(place));
  return system
    ? { system: system.id, systemName: system.name, place, orb: colors[place] ?? null }
    : null;
}

export function itemOf(screen: Screen, name: string): ItemFacts | null {
  const data = catalogData();
  const entries = placeCatalog().entries;
  const reach = readReach(screen.graph, screen.profile);
  const known = new Set(allPlaces(screen.graph).map((place) => place.name));
  const best = bestPlaces(placeIndex());
  const sources: WhatsNewSources = {
    data,
    places: known,
    bestPlaces: best,
    reach,
    now: Date.now(),
  };
  const masteryRank = reach.rank ?? undefined;
  const item = data.arsenal.find((one) => one.name === name) ?? null;
  const collectible = item ? null : (data.collectibles.get(name) ?? null);
  if (!item && !collectible) return null;

  const view = collectible
    ? collectibleView(data, collectible, known, reach.places ?? known)
    : null;
  const reader = { now: sources.now, masteryRank };
  const plan = view
    ? collectibleStepPlan(data, view, reader)
    : item && stepPlan(data, dossier(item, data.arsenal), reader);
  if (!plan) return null;
  const blocks = briefOf(plan);
  const place = namedPlace(blocks) ?? best.get(name) ?? null;

  const lines: Record<string, { reading: Part[]; where: Part[] }> = {};
  for (const line of blocks.flatMap((block) => block.lines)) {
    if (line.thing !== null && line.reading.length === 0 && !(line.thing in lines)) {
      const own = itemLine(sources, line.thing);
      lines[line.thing] = own.reading.length > 0 ? own : { reading: NO_PARTS, where: NO_PARTS };
    }
  }

  return {
    name,
    group: entries.get(name)?.group ?? null,
    collectible: collectible !== null,
    art: item?.imageUrl ?? collectible?.imageUrl ?? entries.get(name)?.imageUrl ?? null,
    blueprint: BLUEPRINT_ART,
    prime: item?.isPrime ?? false,
    state: item
      ? stateByName(name, itemRanks(screen.profile, entries), entries)
      : { kind: "unknown" },
    blocks,
    lines,
    place: placeOf(place),
    beyond: itemGaps(reach, { masteryReq: item?.masteryReq ?? 0, place }).length > 0,
  };
}
