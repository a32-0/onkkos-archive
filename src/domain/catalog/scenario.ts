import { SYNDICATE_RE } from "@/domain/catalog/acquisition";
import { circuitTier, inCircuit, type CircuitMode } from "@/domain/catalog/circuit";
import type { CatalogData } from "@/domain/catalog/data";
import type { CatalogDrop, CatalogItem } from "@/domain/catalog/items";
import { relicOffers, rewardOffers, type RelicOffer } from "@/domain/catalog/relics";
import { partKey, rewardRoutes, vendorOffer, type RewardRoute } from "@/domain/catalog/rewards";
import { curatedFor, vendorGates, type CuratedSource } from "@/domain/catalog/sources";
import {
  researchFor,
  sameName,
  type Wiki,
  type WikiNode,
  type WikiResource,
} from "@/domain/catalog/wiki";
import type { NarrativeSpine } from "@/domain/narrative/schema";
import { proximaPlace } from "@/domain/place/proxima";
import type { PlaceRewards } from "@/domain/place/schema";

type RequirementKind =
  "quest" | "intrinsics" | "key" | "nemesis" | "clan" | "rank" | "mastery" | "resource";

export interface Requirement {
  kind: RequirementKind;
  name: string;
  rank: number | null;
  label: string | null;
}

interface DropRoute {
  kind: "drop";
  place: string;
  node: string;
  mission: string | null;
  boss: string | null;
  caches: boolean;
  rotation: string | null;
  chance: number | null;
  requirements: Requirement[];
}

interface EndlessRoute {
  kind: "endless";
  place: string;
  mode: CircuitMode;
  tiers: number[];
  chance: number | null;
  requirements: Requirement[];
}

interface BountyRoute {
  kind: "bounty";
  place: string;
  tier: string;
  rotation: string | null;
  stage: string | null;
  chance: number | null;
  requirements: Requirement[];
}

interface RelicRoute {
  kind: "relic";
  offer: RelicOffer;
}

export interface EnemyRoute {
  kind: "enemy";
  source: string;
  rotation: string | null;
  chance: number | null;
}

interface ResearchRoute {
  kind: "research";
  lab: string;
  prereq: string | null;
  credits: number | null;
}

interface VendorRoute {
  kind: "vendor";
  vendor: string;
  link: string;
  currency: string | null;
  cost: number | null;
  rank: string | null;
  quest: string | null;
  key: string | null;
  unlocks: string | null;
}

interface MarketRoute {
  kind: "market";
  credits: number;
}

interface CuratedRoute {
  kind: "curated";
  source: CuratedSource;
  item: string;
  cite: string;
}

export type Route =
  | DropRoute
  | EndlessRoute
  | BountyRoute
  | RelicRoute
  | EnemyRoute
  | ResearchRoute
  | VendorRoute
  | MarketRoute
  | CuratedRoute;

type RouteKind = Route["kind"];

export interface ResolvedPart {
  name: string;
  count: number;
  main: boolean;
  routes: Route[];
}

type BlueprintShape = "with-parts" | "apart" | "alone" | "none";
type PartsShape = "one-source" | "one-place" | "many-places" | "unknown" | "none";

interface Layout {
  blueprint: BlueprintShape;
  parts: PartsShape;
}

type ScenarioCase =
  | "same-source"
  | "blueprint-apart"
  | "same-place"
  | "many-places"
  | "parts-unknown"
  | "single-blueprint"
  | "no-recipe";

interface Tally {
  name: string;
  count: number;
  rarity: string | null;
  location: string | null;
  link: string;
}

interface Totals {
  resources: Tally[];
  consumes: { name: string; count: number }[];
  credits: number | null;
  missing: string[];
}

export interface AdversarySystem {
  kind: "adversary";
  name: string;
  page: string;
  larva: string | null;
  encounter: string | null;
  create: string | null;
  trade: string | null;
  quests: string[];
  railjack: boolean;
  intrinsics: { place: string; rank: number } | null;
  hound: boolean;
}

interface BaroSystem {
  kind: "baro";
  credits: number | null;
  ducats: number | null;
  lastOffered: string | null;
}

interface InvasionSystem {
  kind: "invasion";
}

interface VaultedSystem {
  kind: "vaulted";
}

type CompanionMechanism = "kubrow" | "kavat" | "vasca" | "son";

export interface CompanionSystem {
  kind: "companion";
  mechanism: CompanionMechanism;
  species: string;
  lure: string | null;
}

export type AcquisitionSystem =
  AdversarySystem | BaroSystem | InvasionSystem | VaultedSystem | CompanionSystem;

export interface Acquisition {
  system: AcquisitionSystem | null;
  parts: ResolvedPart[];
  layout: Layout;
  scenario: ScenarioCase;
  fromDropTables: boolean;
  unresolved: string[];
  places: string[];
  prerequisites: Requirement[];
  totals: Totals;
}

const MAIN = "Blueprint";
const PRIME = / Prime$/;
const LINK = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g;
const RANK_AFTER = /^\]\]\s*Rank\s*(\d+)/;
const KEY_LIKE = /(Locator|Key)$/;
const NEMESIS = /^(Kuva Lich|Sister of Parvos|Technocyte Coda)$/;
const MASTERY_LINK = "Mastery Rank";
const RANK_NUMBER_AFTER = /^\]\]\s*(\d+)/;
const COUNT_BEFORE = /(\d+)\s*$/;
const BOUNTY_MISSION = "Bounty";
const BOUNTY_HUB = /^Level\s+[\d\s-]+\s+(.+?)\s+Bounty$/;
const HUB_TYPES = new Set(["Hub", "Free Roam"]);
const PLATINUM = "Platinum";
const BOUNTY_TEXT = /\bBounty\b/;
const ROTATION_SPLIT = /,\s*Rotation\s+/;
const NODE_QUALIFIER = / \((Caches|Extra)\)$/;
const CACHES = "(Caches)";
const ENDLESS = /^Endless: (?:Tier (\d+)|Repeated Rewards)(?: \(Hard\))?$/;
const STEEL_PATH_MODE = "Hard";

const vendorNameCache = new WeakMap<Wiki, string[]>();

function vendorNames(wiki: Wiki): string[] {
  let names = vendorNameCache.get(wiki);
  if (!names) {
    names = wiki.vendors.map((vendor) => vendor.name);
    vendorNameCache.set(wiki, names);
  }
  return names;
}

export function parseRequirements(text: string | null): Requirement[] {
  if (text === null) return [];
  const out: Requirement[] = [];
  for (const match of text.matchAll(LINK)) {
    const target = (match[1] ?? "").trim();
    const after = text.slice((match.index ?? 0) + match[0].length - 2);
    if (target === "Intrinsics") {
      const rank = RANK_AFTER.exec(after);
      out.push({
        kind: "intrinsics",
        name: target,
        rank: rank ? Number(rank[1]) : null,
        label: null,
      });
    } else if (target === MASTERY_LINK) {
      const rank = RANK_NUMBER_AFTER.exec(after);
      if (rank) out.push({ kind: "mastery", name: target, rank: Number(rank[1]), label: null });
    } else if (COUNT_BEFORE.test(text.slice(0, match.index ?? 0))) {
      const count = Number(COUNT_BEFORE.exec(text.slice(0, match.index ?? 0))?.[1] ?? 1);
      out.push({ kind: "resource", name: target, rank: count, label: null });
    } else if (KEY_LIKE.test(target)) {
      out.push({ kind: "key", name: target, rank: null, label: null });
    } else if (NEMESIS.test(target)) {
      out.push({ kind: "nemesis", name: target, rank: null, label: null });
    } else {
      out.push({
        kind: "quest",
        name: target.replace(/ \(Quest\)$/, ""),
        rank: null,
        label: null,
      });
    }
  }
  return out;
}

const nodeIndexCache = new WeakMap<Wiki, Map<string, WikiNode[]>>();

function nodesNamed(wiki: Wiki, name: string): WikiNode[] {
  let index = nodeIndexCache.get(wiki);
  if (!index) {
    index = new Map();
    for (const node of wiki.nodes) {
      const list = index.get(node.name) ?? [];
      list.push(node);
      index.set(node.name, list);
    }
    nodeIndexCache.set(wiki, index);
  }
  return index.get(name) ?? [];
}

function wikiNode(wiki: Wiki, name: string, place: string | null): WikiNode | null {
  const clean = name.replace(NODE_QUALIFIER, "");
  const found = nodesNamed(wiki, clean);
  return found.find((node) => node.planet === place) ?? found[0] ?? null;
}

export function bountyHub(tier: string): string | null {
  return BOUNTY_HUB.exec(tier)?.[1] ?? null;
}

function hubRequirements(wiki: Wiki, place: string, tier: string): Requirement[] {
  const hub = bountyHub(tier);
  const hubs = wiki.nodes.filter(
    (node) => node.type !== null && HUB_TYPES.has(node.type) && node.planet === place,
  );
  const named = hub === null ? undefined : hubs.find((node) => node.name.includes(hub));
  const gated = named?.requirements ? named : hubs.find((node) => node.requirements !== null);
  return parseRequirements(gated?.requirements ?? null);
}

function rewardRoute(wiki: Wiki, route: RewardRoute): DropRoute | EndlessRoute | BountyRoute {
  const endless = ENDLESS.exec(route.node);
  if (endless) {
    return {
      kind: "endless",
      place: route.place,
      mode: route.mission === STEEL_PATH_MODE ? "steelPath" : "normal",
      tiers: endless[1] ? [Number(endless[1])] : [],
      chance: route.chance,
      requirements: circuitRequirements(wiki),
    };
  }
  if (route.mission === BOUNTY_MISSION) {
    return {
      kind: "bounty",
      place: route.place,
      tier: route.node,
      rotation: route.rotation,
      stage: route.stage,
      chance: route.chance,
      requirements: hubRequirements(wiki, route.place, route.node),
    };
  }
  const node = wikiNode(wiki, route.node, route.place);
  const caches = route.node.endsWith(CACHES);
  return {
    kind: "drop",
    place: route.place,
    node: route.node.replace(NODE_QUALIFIER, ""),
    mission: caches ? (node?.type ?? null) : (node?.type ?? route.mission),
    boss: node?.boss ?? null,
    caches,
    rotation: route.rotation,
    chance: route.chance,
    requirements: parseRequirements(node?.requirements ?? null),
  };
}

function catalogRoutes(wiki: Wiki, drops: readonly CatalogDrop[]): Route[] {
  const out: Route[] = [];
  for (const drop of drops) {
    const location = drop.location.trim();
    if (/ Relic(\s*\(|$)/.test(location)) continue;
    const offer = vendorOffer(location, SYNDICATE_RE);
    if (offer) {
      out.push({
        kind: "vendor",
        vendor: offer.vendor ?? offer.syndicate,
        link: offer.syndicate,
        currency: "Standing",
        cost: null,
        rank: offer.rank,
        quest: null,
        key: null,
        unlocks: null,
      });
      continue;
    }
    if (location.includes("/") || BOUNTY_TEXT.test(location)) continue;
    if (vendorNames(wiki).some((name) => location.startsWith(name))) continue;
    const [source = location, rotation] = location.split(ROTATION_SPLIT);
    out.push({
      kind: "enemy",
      source: source.trim(),
      rotation: rotation?.trim() ?? null,
      chance: drop.chance,
    });
  }
  return out;
}

export function partName(item: string, part: string): string {
  return part.startsWith(`${item} `) ? part : `${item} ${part}`;
}

const PLURAL = /s$/;

function offerNames(item: string, part: string, main: boolean): string[] {
  if (main) return [`${item} Blueprint`, item];
  const full = partName(item, part);
  const single = full.replace(PLURAL, "");
  return [`${full} Blueprint`, full, `${single} Blueprint`, single];
}

function vendorRoutes(wiki: Wiki, item: string, part: string, main: boolean): VendorRoute[] {
  const wanted = new Set(offerNames(item, part, main).map((name) => name.toLowerCase()));
  const keyPrefix = main ? null : partName(item, part).toLowerCase();
  const out: VendorRoute[] = [];
  for (const vendor of wiki.vendors) {
    for (const offer of vendor.offers) {
      const offered = offer.item.toLowerCase();
      const isKey = keyPrefix !== null && offer.type === "Key" && offered.startsWith(keyPrefix);
      if (!wanted.has(offered) && !isKey) continue;
      out.push({
        kind: "vendor",
        vendor: vendor.name,
        link: vendor.link,
        currency: vendor.currency,
        cost: offer.cost,
        rank: offer.rank,
        quest: offer.quest,
        key: isKey ? offer.item : null,
        unlocks: isKey ? keyNode(wiki, offer.item) : null,
      });
    }
  }
  return out;
}

function keyNode(wiki: Wiki, key: string): string | null {
  const node = wiki.nodes.find((entry) => entry.requirements?.includes(`[[${key}]]`) === true);
  return node?.name ?? null;
}

function researchRoute(
  wiki: Wiki,
  item: string,
  part: string,
  main: boolean,
): ResearchRoute | null {
  const entry = researchFor(wiki, main ? item : partName(item, part));
  if (!entry?.lab) return null;
  return {
    kind: "research",
    lab: entry.lab,
    prereq: entry.prereq,
    credits: main ? (wiki.blueprints.get(item)?.bpCost ?? null) : null,
  };
}

const KIND_ORDER: Record<RouteKind, number> = {
  drop: 0,
  endless: 0,
  bounty: 0,
  relic: 1,
  enemy: 2,
  curated: 3,
  research: 3,
  market: 4,
  vendor: 5,
};

const LATE_CURATED = new Set(["copies", "market", "circuit"]);

const CONCLAVE = "Conclave";

function orderOf(route: Route): number {
  if (route.kind === "curated" && LATE_CURATED.has(route.source.type)) return KIND_ORDER.vendor + 1;
  if (route.kind === "drop" && route.mission === CONCLAVE) return KIND_ORDER.vendor + 1;
  return KIND_ORDER[route.kind];
}

export function chanceOf(route: Route): number | null {
  if (route.kind === "relic") return route.offer.intact;
  if (
    route.kind === "drop" ||
    route.kind === "endless" ||
    route.kind === "bounty" ||
    route.kind === "enemy"
  ) {
    return route.chance;
  }
  return null;
}

function routeOrder(a: Route, b: Route): number {
  const byKind = orderOf(a) - orderOf(b);
  if (byKind !== 0) return byKind;
  if (a.kind === "vendor" && b.kind === "vendor") {
    return Number(a.currency === PLATINUM) - Number(b.currency === PLATINUM);
  }
  if (a.kind === "relic" && b.kind === "relic" && a.offer.vaulted !== b.offer.vaulted) {
    return Number(a.offer.vaulted) - Number(b.offer.vaulted);
  }
  return (chanceOf(b) ?? 0) - (chanceOf(a) ?? 0);
}

const DROPPED = new Set<RouteKind>(["drop", "endless", "bounty", "enemy"]);

function oddsFirst(a: Route, b: Route): number {
  const tier = (route: Route) => (DROPPED.has(route.kind) ? -1 : orderOf(route));
  const byTier = tier(a) - tier(b);
  if (byTier !== 0 || !DROPPED.has(a.kind)) return byTier || routeOrder(a, b);
  const conclave = Number(orderOf(a) > KIND_ORDER.vendor) - Number(orderOf(b) > KIND_ORDER.vendor);
  return conclave || (chanceOf(b) ?? 0) - (chanceOf(a) ?? 0);
}

function dedupeVendors(routes: Route[]): Route[] {
  const priced = routes.filter(
    (route): route is VendorRoute => route.kind === "vendor" && route.cost !== null,
  );
  return routes.filter((route) => {
    if (route.kind !== "vendor" || route.cost !== null) return true;
    return !priced.some(
      (other) =>
        (other.vendor === route.vendor || other.vendor === route.link) &&
        (other.rank === null || route.rank === null || other.rank === route.rank),
    );
  });
}

function partRoutes(
  data: CatalogData,
  item: CatalogItem,
  name: string,
  drops: readonly CatalogDrop[],
  byPart: Map<string, RewardRoute[]>,
): Route[] {
  const { wiki, curated } = data;
  const main = name === MAIN;
  const routes: Route[] = [];
  const own = byPart.get(partKey(name, item.name));
  const isCurated = curatedFor(curated, item.name, name).length > 0;
  const rewards = own ?? (isCurated ? [] : foreignPart(data, item.name, name));
  for (const reward of rewards) routes.push(rewardRoute(wiki, reward));
  const offers =
    drops.length > 0
      ? relicOffers(data.relics, drops)
      : rewardOffers(data.relics, [`${item.name} ${name}`, `${item.name} ${name} Blueprint`]);
  for (const offer of offers) routes.push({ kind: "relic", offer });
  routes.push(...catalogRoutes(wiki, drops));
  const research = researchRoute(wiki, item.name, name, main);
  if (research) routes.push(research);
  routes.push(...vendorRoutes(wiki, item.name, name, main));
  const bpCost = main ? (wiki.blueprints.get(item.name)?.bpCost ?? null) : null;
  const dojo = curatedFor(curated, item.name, name).find((source) => source.type === "dojo");
  if (dojo) {
    routes.push(...curatedRoutes(data, item.name, name).map((route) => withCredits(route, bpCost)));
  } else if (bpCost !== null && research === null) {
    routes.push({ kind: "market", credits: bpCost });
  }
  const curatedHere = curatedRoutes(data, item.name, name).filter(
    (route) => route.source.type !== "dojo",
  );
  const scoped = curatedHere.filter(
    (route) => "part" in route.source && route.source.part === name,
  );
  routes.push(...(routes.length === 0 ? curatedHere : scoped));
  const weekly = circuitRoutes(wiki, item.name, name);
  routes.push(...weekly);
  const kept = weekly.length > 0 ? routes.filter((route) => route.kind !== "endless") : routes;
  return merged(dedupeVendors(kept)).sort(routeOrder);
}

const ROTATIONS = /[A-Z]/g;
const LEVELS = /\d+/g;

function rotationsOf(values: readonly (string | null)[]): string | null {
  const letters = [
    ...new Set(values.flatMap((value) => (value === null ? [] : (value.match(ROTATIONS) ?? [])))),
  ].sort();
  if (letters.length <= 1) return letters[0] ?? null;
  const first = letters[0] ?? "";
  const last = letters[letters.length - 1] ?? "";
  const run = last.charCodeAt(0) - first.charCodeAt(0) === letters.length - 1;
  return run ? `${first}–${last}` : letters.join(", ");
}

function higher(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.max(a, b);
}

function mergeKey(route: Route): string | null {
  switch (route.kind) {
    case "drop":
      return `drop:${route.place}:${route.node}:${route.mission ?? ""}:${route.caches}`;
    case "endless":
      return `endless:${route.mode}`;
    case "bounty":
      return `bounty:${route.place}:${route.tier.match(LEVELS)?.join("-") ?? route.tier}`;
    case "enemy":
      return `enemy:${route.source}`;
    case "vendor":
      return `vendor:${route.vendor}:${route.rank ?? ""}`;
    default:
      return null;
  }
}

function mergedPair(a: Route, b: Route): Route {
  if (a.kind === "endless" && b.kind === "endless") {
    return {
      ...a,
      tiers: [...new Set([...a.tiers, ...b.tiers])].sort((x, y) => x - y),
      chance: higher(a.chance, b.chance),
    };
  }
  if (a.kind === "bounty" && b.kind === "bounty") {
    const top = (b.chance ?? 0) > (a.chance ?? 0) ? b : a;
    return { ...top, rotation: rotationsOf([a.rotation, b.rotation]) };
  }
  if ((a.kind === "drop" && b.kind === "drop") || (a.kind === "enemy" && b.kind === "enemy")) {
    return {
      ...a,
      rotation: rotationsOf([a.rotation, b.rotation]),
      chance: higher(a.chance, b.chance),
    };
  }
  return a;
}

function merged(routes: readonly Route[]): Route[] {
  const out: Route[] = [];
  const at = new Map<string, number>();
  for (const route of routes) {
    const key = mergeKey(route);
    const index = key === null ? undefined : at.get(key);
    if (key === null || index === undefined) {
      if (key !== null) at.set(key, out.length);
      out.push(route);
      continue;
    }
    const known = out[index];
    if (known) out[index] = mergedPair(known, route);
  }
  return out;
}

const CIRCUIT_NODE = "The Circuit";

function circuitRoutes(wiki: Wiki, item: string, part: string): CuratedRoute[] {
  if (!inCircuit(wiki.circuit, "normal", item)) return [];
  const tier = circuitTier(wiki.circuit, part === MAIN ? MAIN : (part.split(" ").at(-1) ?? part));
  if (tier === null) return [];
  return [
    {
      kind: "curated",
      source: { type: "circuit", mode: "normal", tier },
      item,
      cite: CIRCUIT_NODE,
    },
  ];
}

function circuitRequirements(wiki: Wiki): Requirement[] {
  return parseRequirements(wikiNode(wiki, CIRCUIT_NODE, null)?.requirements ?? null);
}

function withCredits(route: CuratedRoute, credits: number | null): CuratedRoute {
  if (route.source.type !== "dojo" || credits === null) return route;
  return { ...route, source: { ...route.source, credits } };
}

function foreignPart(data: CatalogData, item: string, part: string): RewardRoute[] {
  if (part === MAIN || part.startsWith(`${item} `) || !part.includes(" ")) return [];
  return rewardRoutes(data.rewards, part).filter(
    (route) => partKey(route.item, part) === "blueprint",
  );
}

function curatedRoutes(data: CatalogData, item: string, part: string | null): CuratedRoute[] {
  return curatedFor(data.curated, item, part)
    .filter((source) => source.type !== "invasion")
    .map((source) => ({
      kind: "curated",
      source,
      item,
      cite: data.curated.items.get(item)?.cite ?? item,
    }));
}

function routeGroup(route: Route): string {
  switch (route.kind) {
    case "drop":
      return `drop:${route.place}:${route.node}`;
    case "endless":
      return `endless:${route.mode}`;
    case "bounty":
      return `bounty:${route.place}:${route.tier}`;
    case "relic":
      return `relic:${route.offer.relic}`;
    case "enemy":
      return `enemy:${route.source}`;
    case "research":
      return `research:${route.lab}`;
    case "vendor":
      return `vendor:${route.vendor}`;
    case "market":
      return "market";
    case "curated":
      return `curated:${JSON.stringify(route.source)}`;
  }
}

export function routeArea(route: Route): string | null {
  return route.kind === "drop" || route.kind === "endless" || route.kind === "bounty"
    ? route.place
    : null;
}

export function layoutOf(parts: readonly ResolvedPart[]): Layout {
  const main = parts.find((part) => part.main);
  const others = parts.filter((part) => !part.main);
  const mainRoute = main?.routes[0] ?? null;

  if (others.length === 0) {
    return { blueprint: main ? "alone" : "none", parts: "none" };
  }

  const primaries = others.map((part) => part.routes[0] ?? null);
  const routed = primaries.filter((route): route is Route => route !== null);
  const groups = new Set(routed.map(routeGroup));
  const areas = new Set(routed.map(routeArea));
  const complete = routed.length === others.length;

  let shape: PartsShape;
  if (routed.length === 0) shape = "unknown";
  else if (complete && groups.size === 1) shape = "one-source";
  else if (complete && areas.size === 1 && !areas.has(null)) shape = "one-place";
  else shape = "many-places";

  if (!main) return { blueprint: "none", parts: shape };
  const together =
    mainRoute !== null &&
    ((shape === "one-source" && groups.has(routeGroup(mainRoute))) ||
      (shape === "one-place" && areas.has(routeArea(mainRoute))));
  return { blueprint: together ? "with-parts" : "apart", parts: shape };
}

export function scenarioOf(layout: Layout): ScenarioCase {
  if (layout.parts === "none")
    return layout.blueprint === "none" ? "no-recipe" : "single-blueprint";
  if (layout.parts === "one-source") {
    return layout.blueprint === "with-parts" ? "same-source" : "blueprint-apart";
  }
  if (layout.parts === "one-place") return "same-place";
  if (layout.parts === "unknown") return "parts-unknown";
  return "many-places";
}

function blueprintKey(wiki: Wiki, item: string, part: string): string | null {
  const base = item.replace(PRIME, "");
  for (const key of [partName(item, part), partName(base, part)])
    if (wiki.blueprints.has(key)) return key;
  return null;
}

function totalsOf(wiki: Wiki, item: CatalogItem): Totals {
  const blueprints = wiki.blueprints;
  const root = blueprints.get(item.name);
  const resources = wiki.resources;
  const tally = new Map<string, number>();
  const consumes = new Map<string, number>();
  const missing: string[] = [];
  const own = new Set([
    MAIN,
    ...(item.recipe?.parts ?? []).flatMap((part) => [part.name, `${item.name} ${part.name}`]),
  ]);

  if (!root) {
    for (const ingredient of item.recipe?.ingredients ?? []) {
      if (own.has(ingredient.name)) continue;
      tally.set(ingredient.name, (tally.get(ingredient.name) ?? 0) + ingredient.count);
    }
    return {
      resources: tallies(tally, resources),
      consumes: [],
      credits: item.recipe?.credits ?? null,
      missing: [MAIN],
    };
  }

  let credits = root.credits ?? 0;
  for (const part of root.parts) {
    if (part.type === "Resource") {
      if (own.has(part.name)) continue;
      tally.set(part.name, (tally.get(part.name) ?? 0) + part.count);
      continue;
    }
    if (part.type === "Weapon") {
      consumes.set(part.name, (consumes.get(part.name) ?? 0) + part.count);
      continue;
    }
    const key = blueprintKey(wiki, item.name, part.name);
    const component = key === null ? undefined : blueprints.get(key);
    if (!component) {
      if (part.type !== "PrimePart") missing.push(part.name);
      continue;
    }
    credits += (component.credits ?? 0) * part.count;
    for (const inner of component.parts) {
      if (inner.type !== "Resource") continue;
      tally.set(inner.name, (tally.get(inner.name) ?? 0) + inner.count * part.count);
    }
  }

  return {
    resources: tallies(tally, resources),
    consumes: [...consumes].map(([name, count]) => ({ name, count })),
    credits,
    missing,
  };
}

function tallies(tally: Map<string, number>, resources: Map<string, WikiResource>): Tally[] {
  const trimmed = new Map<string, number>();
  for (const [name, count] of tally) {
    trimmed.set(name.trim(), (trimmed.get(name.trim()) ?? 0) + count);
  }
  return [...trimmed]
    .map(([name, count]) => {
      const fact = resources.get(name);
      return {
        name,
        count,
        rarity: fact?.rarity ?? null,
        location: fact?.location ?? null,
        link: fact?.link ?? name,
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function prerequisitesOf(data: CatalogData, parts: readonly ResolvedPart[]): Requirement[] {
  const seen = new Map<string, Requirement>();
  const add = (requirement: Requirement) => {
    const key = `${requirement.kind}:${requirement.name}`;
    const known = seen.get(key);
    if (!known || (requirement.rank ?? 0) > (known.rank ?? 0)) seen.set(key, requirement);
  };
  for (const part of parts) {
    const route = part.routes[0];
    if (!route) continue;
    if (route.kind === "drop" || route.kind === "endless" || route.kind === "bounty") {
      route.requirements.forEach(add);
    }
    if (route.kind === "research") add({ kind: "clan", name: route.lab, rank: null, label: null });
    if (route.kind === "vendor") {
      for (const quest of vendorGates(data.curated, route.vendor)) {
        add({ kind: "quest", name: quest, rank: null, label: null });
      }
      if (route.quest) add({ kind: "quest", name: route.quest, rank: null, label: null });
      if (route.rank) add({ kind: "rank", name: route.vendor, rank: null, label: route.rank });
    }
    if (route.kind === "curated" && route.source.type === "circuit") {
      circuitRequirements(data.wiki).forEach(add);
    }
    if (route.kind === "curated" && "quest" in route.source && route.source.quest) {
      if (route.source.type !== "quest") {
        add({ kind: "quest", name: route.source.quest, rank: null, label: null });
      }
    }
  }
  return [...seen.values()];
}

export function resolveAcquisition(data: CatalogData, item: CatalogItem): Acquisition {
  const byPart = new Map<string, RewardRoute[]>();
  for (const route of rewardRoutes(data.rewards, item.name)) {
    const key = partKey(route.item, item.name);
    const list = byPart.get(key) ?? [];
    list.push(route);
    byPart.set(key, list);
  }

  const recipe = item.recipe?.parts ?? [];
  const parts: ResolvedPart[] = recipe.map((part) => ({
    name: part.name,
    count: part.count,
    main: part.name === MAIN,
    routes: partRoutes(data, item, part.name, part.drops, byPart),
  }));

  if (parts.length === 0) {
    parts.push({ name: item.name, count: 1, main: false, routes: wholeItemRoutes(data, item) });
  }

  const layout =
    recipe.length === 0 ? { blueprint: "none" as const, parts: "none" as const } : layoutOf(parts);
  const fromDropTables = parts.some((part) =>
    part.routes.some((route) => ["drop", "bounty", "relic", "enemy"].includes(route.kind)),
  );
  const places = [
    ...new Set(
      parts.flatMap((part) => {
        const route = part.routes[0];
        const area = route ? routeArea(route) : null;
        return area === null ? [] : [area];
      }),
    ),
  ];

  const unresolved = parts.filter((part) => part.routes.length === 0).map((part) => part.name);
  const system =
    companionOf(data, item) ??
    curatedSystem(data, item) ??
    (unresolved.length === parts.length ? systemOf(data, item) : vaultedOf(item, parts));

  return {
    system,
    parts,
    layout,
    scenario: scenarioOf(layout),
    fromDropTables,
    unresolved,
    places,
    prerequisites: prerequisitesOf(data, parts),
    totals: totalsOf(data.wiki, item),
  };
}

const BARO_TRAIT = "Baro";
const INVASION_TRAIT = "Invasion Reward";
const RAILJACK = "Railjack";

const questCache = new WeakMap<NarrativeSpine, Set<string>>();

function questNames(spine: NarrativeSpine): Set<string> {
  let names = questCache.get(spine);
  if (!names) {
    names = new Set(spine.arcs.flatMap((arc) => arc.quests.map((quest) => quest.name)));
    questCache.set(spine, names);
  }
  return names;
}

function adversarySystem(data: CatalogData, trait: string, hound: boolean): AdversarySystem | null {
  const adversary = data.wiki.adversaries.find((entry) => entry.trait === trait);
  if (!adversary) return null;
  return {
    kind: "adversary",
    name: adversary.name,
    page: adversary.page,
    larva: adversary.larva,
    encounter: adversary.encounter,
    create: adversary.create,
    trade: adversary.trade,
    quests: adversary.links.filter((link) => questNames(data.spine).has(link)),
    railjack: adversary.links.includes(RAILJACK),
    intrinsics: adversary.intrinsics,
    hound,
  };
}

const HOUND = "Hound";
const HOUND_TRAIT = "Tenet";
const KUBROW = "Kubrow";
const KAVAT = "Kavat";
const REVIVED = new Set(["Predasite", "Vulpaphyla"]);

function lureFor(wiki: Wiki, name: string): string | null {
  const wanted = `${name} Echo-Lure`;
  const sold = wiki.vendors.some((vendor) =>
    vendor.offers.some((offer) => sameName(offer.item, wanted)),
  );
  return sold ? wanted : null;
}

function companionOf(data: CatalogData, item: CatalogItem): AcquisitionSystem | null {
  const species = data.wiki.companions.get(item.name);
  if (species === undefined || PRIME.test(item.name)) return null;
  if (species === HOUND) return adversarySystem(data, HOUND_TRAIT, true);
  const companion = (mechanism: CompanionMechanism, lure: string | null): CompanionSystem => ({
    kind: "companion",
    mechanism,
    species,
    lure,
  });
  if (species === KUBROW) return companion("kubrow", null);
  if (REVIVED.has(species)) return companion("son", lureFor(data.wiki, species));
  if (species === KAVAT) {
    const lure = lureFor(data.wiki, item.name);
    return lure ? companion("vasca", lure) : companion("kavat", null);
  }
  return null;
}

function curatedSystem(data: CatalogData, item: CatalogItem): InvasionSystem | null {
  return curatedFor(data.curated, item.name, null).some((source) => source.type === "invasion")
    ? { kind: "invasion" }
    : null;
}

function vaultedOf(item: CatalogItem, parts: readonly ResolvedPart[]): VaultedSystem | null {
  if (!PRIME.test(item.name) || parts.length === 0) return null;
  const vaulted = parts.every(
    (part) =>
      part.routes.length > 0 &&
      part.routes.every((route) => route.kind === "relic" && route.offer.vaulted),
  );
  return vaulted ? { kind: "vaulted" } : null;
}

function systemOf(data: CatalogData, item: CatalogItem): AcquisitionSystem | null {
  const traits = data.wiki.traits.get(item.name) ?? [];
  const trait = data.wiki.adversaries.find((entry) => traits.includes(entry.trait))?.trait;
  if (trait) return adversarySystem(data, trait, false);
  const baro = data.wiki.baro.get(item.name);
  if (baro && traits.includes(BARO_TRAIT)) return { kind: "baro", ...baro };
  if (traits.includes(INVASION_TRAIT)) return { kind: "invasion" };
  if (baro) return { kind: "baro", ...baro };
  return null;
}

function wholeItemRoutes(data: CatalogData, item: CatalogItem): Route[] {
  const { wiki } = data;
  const routes: Route[] = [];
  for (const offer of relicOffers(data.relics, item.drops)) routes.push({ kind: "relic", offer });
  routes.push(...catalogRoutes(wiki, item.drops));
  const research = researchFor(wiki, item.name);
  if (research?.lab) {
    routes.push({ kind: "research", lab: research.lab, prereq: research.prereq, credits: null });
  }
  routes.push(...vendorRoutes(wiki, item.name, "", true));
  const bpCost = wiki.blueprints.get(item.name)?.bpCost ?? null;
  if (bpCost !== null && !research?.lab) routes.push({ kind: "market", credits: bpCost });
  if (routes.length === 0) routes.push(...curatedRoutes(data, item.name, null));
  return dedupeVendors(routes).sort(routeOrder);
}

const STACK = /^\d+X /i;

const rewardIndexCache = new WeakMap<PlaceRewards, Map<string, RewardRoute[]>>();

function rewardIndex(rewards: PlaceRewards): Map<string, RewardRoute[]> {
  let index = rewardIndexCache.get(rewards);
  if (!index) {
    index = new Map();
    for (const [place, nodes] of Object.entries(rewards)) {
      for (const node of nodes) {
        for (const reward of node.rewards) {
          const key = reward.item.replace(STACK, "").toLowerCase();
          const list = index.get(key) ?? [];
          list.push({
            place: proximaPlace(rewards, place, [node.node], node.mission),
            node: node.node,
            mission: node.mission,
            rotation: reward.rotation,
            stage: reward.stage ?? null,
            chance: reward.chance,
            item: reward.item,
          });
          index.set(key, list);
        }
      }
    }
    rewardIndexCache.set(rewards, index);
  }
  return index;
}

function exactRewards(data: CatalogData, name: string): Route[] {
  const found = rewardIndex(data.rewards).get(name.toLowerCase()) ?? [];
  const own = found.filter((route) => !STACK.test(route.item));
  return (own.length > 0 ? own : found).map((route) => rewardRoute(data.wiki, route));
}

function rankedVendors(wiki: Wiki, drops: readonly CatalogDrop[]): VendorRoute[] {
  const out: VendorRoute[] = [];
  for (const drop of drops) {
    const location = drop.location.trim();
    const vendor = vendorNames(wiki).find((name) => location.startsWith(`${name}, `));
    if (!vendor) continue;
    out.push({
      kind: "vendor",
      vendor,
      link: vendor,
      currency: null,
      cost: null,
      rank: location.slice(vendor.length + 2).trim() || null,
      quest: null,
      key: null,
      unlocks: null,
    });
  }
  return out;
}

export function collectibleRoutes(
  data: CatalogData,
  name: string,
  drops: readonly CatalogDrop[],
): Route[] {
  const routes: Route[] = exactRewards(data, name);
  for (const offer of rewardOffers(data.relics, [name])) routes.push({ kind: "relic", offer });
  routes.push(...catalogRoutes(data.wiki, drops), ...rankedVendors(data.wiki, drops));
  return merged(dedupeVendors(routes)).sort(oddsFirst);
}

export function blueprintRoutes(data: CatalogData, name: string): Route[] {
  const routes: Route[] = exactRewards(data, `${name} Blueprint`);
  const research = researchFor(data.wiki, name);
  if (research?.lab) {
    routes.push({ kind: "research", lab: research.lab, prereq: research.prereq, credits: null });
  }
  const bpCost = data.wiki.blueprints.get(name)?.bpCost ?? null;
  if (bpCost !== null && !research?.lab) routes.push({ kind: "market", credits: bpCost });
  return merged(routes).sort(routeOrder);
}

export function routeRequirements(data: CatalogData, route: Route | undefined): Requirement[] {
  return route ? prerequisitesOf(data, [{ name: "", count: 1, main: false, routes: [route] }]) : [];
}

interface Junction {
  name: string;
  from: string;
}

export function junctionTo(wiki: Wiki, place: string): Junction | null {
  const node = wiki.nodes.find(
    (entry) => entry.type === "Solar Rail Junction" && entry.name === `${place} Junction`,
  );
  return node?.planet ? { name: node.name, from: node.planet } : null;
}
