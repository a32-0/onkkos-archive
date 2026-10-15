import type { CatalogDrop, CatalogItem } from "@/domain/catalog/items";
import { placeFromLocation } from "@/domain/catalog/places";

type GateKind = "quest" | "relic" | "place" | "syndicate" | "dojo" | "market" | "unknown";

export interface Gate {
  kind: GateKind;
  places: string[];
  quest: string | null;
  detail: string | null;
}

export const SYNDICATE_RE =
  /^(Steel Meridian|Arbiters of Hexis|Cephalon Suda|The Perrin Sequence|Red Veil|New Loka|Kahl's Garrison|Conclave|Solaris United|Ostron|Entrati|The Holdfasts|Cavia|The Hex|Necraloid|Vox Solaris|The Quills|Ventkids|NecraLoid)\b/i;

const DOJO_RE = /\/ClanTech\//;

export function classify(
  item: CatalogItem,
  known: ReadonlySet<string>,
  questReward: string | null,
): Gate {
  if (questReward) return { kind: "quest", places: [], quest: questReward, detail: null };
  if (item.isPrime)
    return { kind: "relic", places: [], quest: null, detail: firstLocation(item.drops) };

  const places = dropPlaces(item.drops, known);
  if (places.length > 0) return { kind: "place", places, quest: null, detail: null };

  const syndicate = item.drops.map((drop) => SYNDICATE_RE.exec(drop.location)?.[1]).find(Boolean);
  if (syndicate) return { kind: "syndicate", places: [], quest: null, detail: syndicate };

  if (DOJO_RE.test(item.uniqueName)) return { kind: "dojo", places: [], quest: null, detail: null };
  if (item.drops.length > 0) {
    return { kind: "unknown", places: [], quest: null, detail: firstLocation(item.drops) };
  }
  if (item.buildable) return { kind: "market", places: [], quest: null, detail: null };
  return { kind: "unknown", places: [], quest: null, detail: null };
}

function dropPlaces(drops: readonly CatalogDrop[], known: ReadonlySet<string>): string[] {
  const found = new Set<string>();
  for (const drop of drops) {
    const place = placeFromLocation(drop.location, known);
    if (place) found.add(place);
  }
  return [...found];
}

function firstLocation(drops: readonly CatalogDrop[]): string | null {
  return drops[0]?.location ?? null;
}

export interface AcquisitionRoute {
  place: string | null;
  source: string | null;
  rotations: string[];
  parts: string[];
  chance: number | null;
  nodes: string[];
}

interface RouteGroup {
  place: string | null;
  source: string | null;
  rotations: Set<string>;
  parts: Set<string>;
  chance: number | null;
  nodes: Set<string>;
}

interface ParsedLocation {
  node: string;
  source: string | null;
  rotation: string | null;
}

export function acquisitionRoutes(
  item: CatalogItem,
  known: ReadonlySet<string>,
): AcquisitionRoute[] {
  return routesFor(item.drops, item.name, known);
}

export function routesFor(
  drops: readonly CatalogDrop[],
  itemName: string,
  known: ReadonlySet<string>,
): AcquisitionRoute[] {
  const groups = new Map<string, RouteGroup>();

  for (const drop of drops) {
    const place = placeFromLocation(drop.location, known);
    const parsed = parseLocation(drop.location, place ?? "");
    const key =
      place === null ? `|${parsed.node}|${parsed.source ?? ""}` : `${place}|${parsed.source ?? ""}`;
    const group = groups.get(key) ?? {
      place,
      source: parsed.source,
      rotations: new Set<string>(),
      parts: new Set<string>(),
      chance: null,
      nodes: new Set<string>(),
    };
    if (parsed.node) group.nodes.add(parsed.node);
    if (parsed.rotation) group.rotations.add(parsed.rotation);
    const part = partName(drop.type, itemName);
    if (part) group.parts.add(part);
    if (drop.chance !== null && (group.chance === null || drop.chance > group.chance)) {
      group.chance = drop.chance;
    }
    groups.set(key, group);
  }

  return [...groups.values()]
    .map((group) => ({
      place: group.place,
      source: group.source,
      rotations: [...group.rotations].sort(),
      parts: [...group.parts].sort(),
      chance: group.chance,
      nodes: [...group.nodes].sort(),
    }))
    .sort(
      (a, b) =>
        (b.chance ?? 0) - (a.chance ?? 0) ||
        b.nodes.length - a.nodes.length ||
        (a.source ?? "").localeCompare(b.source ?? ""),
    );
}

function parseLocation(location: string, place: string): ParsedLocation {
  let rest = location;

  const rotation = /,\s*Rotation ([A-Z])\s*$/.exec(rest);
  if (rotation) rest = rest.slice(0, rotation.index);

  rest = rest.trim();
  const paren = /\(([^)]*)\)$/.exec(rest);
  if (paren) rest = rest.slice(0, paren.index).trim();

  let source = paren?.[1]?.trim() ?? null;
  let node = rest;

  if (rest.startsWith(place + "/")) {
    node = rest.slice(place.length + 1).trim();
  } else {
    const slash = rest.indexOf("/");
    const head = slash >= 0 ? rest.slice(0, slash) : rest;
    const tail = slash >= 0 ? rest.slice(slash + 1).trim() : "";
    const comma = head.lastIndexOf(",");
    node = (comma >= 0 ? head.slice(0, comma) : head).trim();
    if (source === null && tail) source = tail;
  }

  return { node, source, rotation: rotation?.[1] ?? null };
}

function partName(type: string | null, itemName: string): string | null {
  if (!type) return null;
  const trimmed = type.trim();
  if (trimmed === itemName) return null;
  if (!trimmed.startsWith(itemName + " ")) return null;
  return trimmed.slice(itemName.length + 1);
}
