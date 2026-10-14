import type { Catalog, CatalogEntry, Group, PlaceCatalog } from "@/domain/place/catalog";
import { proximaPlace } from "@/domain/place/proxima";
import { resolveReward } from "@/domain/place/resolve";
import {
  DOJO,
  type AcquisitionVerb,
  type CuratedAcquisition,
  type PlaceRewards,
  type RegionResources,
  type Research,
  type SystemEntry,
} from "@/domain/place/schema";

interface PlaceRoute {
  node: string;
  mission: string | null;
  rotation: string | null;
  chance: number | null;
}

export interface PlaceItem {
  uniqueName: string;
  name: string;
  catalog: Catalog;
  group: Group;
  verb: AcquisitionVerb;
  from: string | null;
  imageUrl: string | null;
  wikiUrl: string | null;
  masterable: boolean;
  canonical: boolean;
  releaseDate: string | null;
  maxRank: number;
  routes: PlaceRoute[];
}

export interface PlaceView {
  place: string;
  system: SystemEntry | null;
  resources: string[];
  items: PlaceItem[];
}

const BOUNTY_MISSION = "Bounty";

function verbFor(mission: string | null): AcquisitionVerb {
  return mission === BOUNTY_MISSION ? "bounty" : "drop";
}

function blank(entry: CatalogEntry, verb: AcquisitionVerb, from: string | null): PlaceItem {
  return {
    uniqueName: entry.uniqueName,
    name: entry.name,
    catalog: entry.catalog,
    group: entry.group,
    verb,
    from,
    imageUrl: entry.imageUrl,
    wikiUrl: entry.wikiUrl,
    masterable: entry.masterable,
    canonical: false,
    releaseDate: entry.releaseDate,
    maxRank: entry.maxRank,
    routes: [],
  };
}

export interface PlaceSources {
  catalog: PlaceCatalog;
  rewards: PlaceRewards;
  resources: RegionResources;
  systems: readonly SystemEntry[];
  acquisition: readonly CuratedAcquisition[];
  research: Research;
}

export function buildPlaceIndex(sources: PlaceSources): Map<string, PlaceView> {
  const { entries, index } = sources.catalog;
  const { rewards, resources, systems } = sources;

  const systemOf = new Map<string, SystemEntry>();
  for (const system of systems) {
    for (const place of system.places) systemOf.set(place, system);
  }

  const views = new Map<string, PlaceView>();
  const ensure = (place: string): PlaceView => {
    let view = views.get(place);
    if (!view) {
      view = {
        place,
        system: systemOf.get(place) ?? null,
        resources: resources[place] ?? [],
        items: [],
      };
      views.set(place, view);
    }
    return view;
  };

  const byPlace = new Map<string, PlaceRewards[string]>();
  for (const [planet, nodes] of Object.entries(rewards)) {
    for (const node of nodes) {
      const place = proximaPlace(rewards, planet, [node.node], node.mission);
      byPlace.set(place, [...(byPlace.get(place) ?? []), node]);
    }
  }

  for (const [place, nodes] of byPlace) {
    const view = ensure(place);
    const byItem = new Map<string, PlaceItem>();

    for (const node of nodes) {
      for (const reward of node.rewards) {
        const target = resolveReward(index, reward.item);
        if (!target) continue;
        const entry = entries.get(target.name);
        if (!entry) continue;

        let item = byItem.get(entry.name);
        if (!item) {
          item = blank(entry, verbFor(node.mission), null);
          byItem.set(entry.name, item);
        }
        item.routes.push({
          node: node.node,
          mission: node.mission,
          rotation: reward.rotation,
          chance: reward.chance,
        });
      }
    }

    for (const item of byItem.values()) {
      item.routes.sort((a, b) => (b.chance ?? 0) - (a.chance ?? 0));
      view.items.push(item);
    }
  }

  for (const [place, names] of Object.entries(resources)) {
    const view = views.get(place);
    if (!view) continue;
    for (const name of names) {
      const entry = entries.get(name);
      if (!entry) continue;
      const existing = view.items.find((item) => item.name === entry.name);
      if (existing) {
        existing.canonical = true;
        continue;
      }
      view.items.push({ ...blank(entry, "drop", null), canonical: true });
    }
  }

  for (const [name, lab] of Object.entries(sources.research)) {
    const target = resolveReward(index, name);
    const entry = target ? entries.get(target.name) : undefined;
    if (!entry) continue;
    const view = ensure(DOJO);
    if (view.items.some((item) => item.name === entry.name)) continue;
    view.items.push(blank(entry, "research", lab));
  }

  for (const row of sources.acquisition) {
    if (row.place === null) continue;
    const entry = entries.get(row.item);
    if (!entry) continue;
    const view = ensure(row.place);
    if (view.items.some((item) => item.name === entry.name)) continue;
    view.items.push(blank(entry, row.verb, row.from));
  }

  for (const view of views.values()) {
    view.items.sort(
      (a, b) =>
        a.group.localeCompare(b.group) ||
        Number(b.canonical) - Number(a.canonical) ||
        a.name.localeCompare(b.name),
    );
  }

  return views;
}
