import { routesFor } from "@/domain/catalog/acquisition";
import type { CatalogDrop, CatalogItem } from "@/domain/catalog/items";
import type { Relic, RelicReward } from "@/domain/catalog/relics";
import { NameMap, type Wiki, type WikiHonoria } from "@/domain/catalog/wiki";
import { proximaPlace } from "@/domain/place/proxima";
import type { PlaceRewards, RegionResources } from "@/domain/place/schema";
import { wikiUrl } from "@/domain/wiki-links";

export type CollectibleGroup = "mods" | "arcanes" | "relics" | "resources" | "other";

type CollectibleFamily = "honoria" | "incarnon" | "ephemera";

interface CollectibleOffer {
  vendor: string;
  link: string;
  currency: string | null;
  cost: number | null;
  rank: string | null;
  quest: string | null;
  event: boolean;
}

export interface Collectible {
  name: string;
  uniqueName: string;
  group: CollectibleGroup;
  kind: string;
  family: CollectibleFamily | null;
  imageUrl: string | null;
  wikiUrl: string | null;
  drops: CatalogDrop[];
  regions: string[];
  relic: Relic | null;
  offers: CollectibleOffer[];
  honoria: WikiHonoria | null;
  incarnon: boolean;
  recipe: CollectibleRecipe | null;
  releaseDate: string | null;
}

export interface CollectibleRecipe {
  credits: number | null;
  ingredients: { name: string; count: number }[];
}

export interface RawEntry {
  uniqueName?: string;
  name?: string;
  type?: string;
  category?: string;
  imageName?: string;
  wikiaUrl?: string;
  releaseDate?: string;
  drops?: { location?: string; type?: string; chance?: number; rarity?: string }[];
  buildPrice?: number;
  components?: { name?: string; itemCount?: number }[];
}

const ICON_BASE = "https://cdn.warframestat.us/img";

const CATEGORIES: Record<string, CollectibleGroup> = {
  Mods: "mods",
  Arcanes: "arcanes",
  Resources: "resources",
  Misc: "other",
  Gear: "other",
  Fish: "other",
  Sigils: "other",
  Skins: "other",
  Glyphs: "other",
  Railjack: "other",
  Honoria: "other",
};

export const COLLECTIBLE_SOURCES = Object.keys(CATEGORIES);

export const GEAR_SOURCES = ["Misc", "Gear"];

const RESOURCE_TYPES = new Set(["Resource", "Gem", "Plant"]);
const RESOURCE_PATH = /\/Types\/Items\/MiscItems\//;
const RESOURCE_KIND = "Resource";
const INCARNON = / Incarnon Genesis$/;
const FAMILIES: { pattern: RegExp; family: CollectibleFamily }[] = [
  { pattern: / Honoria$/, family: "honoria" },
  { pattern: INCARNON, family: "incarnon" },
  { pattern: / Ephemera$/, family: "ephemera" },
];
const PLATINUM = "Platinum";
const EVENT = "Event";

export interface CollectibleSources {
  raw: readonly RawEntry[];
  arsenal: readonly CatalogItem[];
  relics: ReadonlyMap<string, Relic>;
  regions: RegionResources;
  wiki: Wiki;
  curated: { has(name: string): boolean };
}

export function buildCollectibleCatalog(sources: CollectibleSources): Map<string, Collectible> {
  const arsenal = new Set(sources.arsenal.map((item) => item.name));
  const regions = resourceRegions(sources.regions);
  const offers = vendorIndex(sources.wiki);
  const honorias = sources.wiki.honorias;
  const out = new Map<string, Collectible>();

  for (const entry of sources.raw) {
    const name = entry.name;
    const category = entry.category;
    if (!name || !category || arsenal.has(name)) continue;
    const family = FAMILIES.find((one) => one.pattern.test(name)) ?? null;
    const group = family ? "other" : groupOf(category, entry.type, entry.uniqueName ?? "");
    if (!group) continue;

    const drops = ownDrops(entry, name);
    const found = regions.get(name) ?? [];
    const sold = offers.get(name) ?? [];
    const honoria = honorias.get(name) ?? null;
    const incarnon = INCARNON.test(name);
    const known = drops.length > 0 || found.length > 0 || sold.length > 0;
    const documented = family !== null && (told(honoria) || incarnon || sources.curated.has(name));
    if (!known && !documented) continue;

    const existing = out.get(name);
    if (existing && existing.drops.length >= drops.length) continue;

    out.set(name, {
      name,
      uniqueName: entry.uniqueName ?? "",
      group,
      kind:
        group === "resources" && !RESOURCE_TYPES.has(entry.type ?? "")
          ? RESOURCE_KIND
          : (entry.type ?? category),
      family: family?.family ?? null,
      imageUrl: entry.imageName ? `${ICON_BASE}/${entry.imageName}` : null,
      wikiUrl: entry.wikiaUrl ?? titleUrl(sources.wiki, name),
      drops,
      regions: found,
      relic: null,
      offers: sold,
      honoria,
      incarnon,
      recipe: recipeOf(entry),
      releaseDate: typeof entry.releaseDate === "string" ? entry.releaseDate : null,
    });
  }

  for (const relic of sources.relics.values()) {
    out.set(relic.name, {
      name: relic.name,
      uniqueName: relic.uniqueName,
      group: "relics",
      kind: "Relic",
      family: null,
      imageUrl: relic.imageUrl,
      wikiUrl: relic.wikiUrl,
      drops: [],
      regions: [],
      relic,
      offers: [],
      honoria: null,
      incarnon: false,
      recipe: null,
      releaseDate: null,
    });
  }

  return out;
}

function groupOf(
  category: string,
  type: string | undefined,
  uniqueName: string,
): CollectibleGroup | null {
  const group = CATEGORIES[category];
  if (!group) return null;
  if (group !== "other") return group;
  if ((type && RESOURCE_TYPES.has(type)) || RESOURCE_PATH.test(uniqueName)) return "resources";
  return group;
}

function ownDrops(entry: RawEntry, name: string): CatalogDrop[] {
  const out: CatalogDrop[] = [];
  for (const drop of entry.drops ?? []) {
    if (typeof drop.location !== "string") continue;
    if (typeof drop.type === "string" && drop.type !== name) continue;
    out.push({
      location: drop.location,
      type: drop.type ?? null,
      chance: typeof drop.chance === "number" ? drop.chance : null,
      rarity: drop.rarity ?? null,
    });
  }
  return out;
}

const BLUEPRINT_SUFFIX = / Blueprint$/i;

const RECIPE_SKIP = "Blueprint";

function recipeOf(entry: RawEntry): CollectibleRecipe | null {
  const ingredients = (entry.components ?? [])
    .filter((one) => typeof one.name === "string" && one.name !== RECIPE_SKIP)
    .map((one) => ({ name: one.name ?? "", count: one.itemCount ?? 1 }));
  if (ingredients.length === 0 && !entry.buildPrice) return null;
  return { credits: entry.buildPrice ?? null, ingredients };
}

export function buildGearRecipes(raw: readonly RawEntry[]): Map<string, CollectibleRecipe> {
  const out = new Map<string, CollectibleRecipe>();
  for (const entry of raw) {
    const recipe = recipeOf(entry);
    if (entry.name && recipe && recipe.ingredients.length > 0) out.set(entry.name, recipe);
  }
  return out;
}

function titleUrl(wiki: Wiki, name: string): string | null {
  const title = wiki.titles.get(name);
  return title === undefined ? null : wikiUrl(title);
}

function vendorIndex(wiki: Wiki): NameMap<CollectibleOffer[]> {
  const out = new NameMap<CollectibleOffer[]>();
  for (const vendor of wiki.vendors) {
    for (const offer of vendor.offers) {
      const item = offer.item.replace(BLUEPRINT_SUFFIX, "");
      const list = out.get(item) ?? [];
      list.push({
        vendor: vendor.name,
        link: vendor.link,
        currency: vendor.currency,
        cost: offer.cost,
        rank: offer.rank,
        quest: offer.quest,
        event: vendor.kind === EVENT,
      });
      out.set(item, list);
    }
  }
  for (const list of out.values()) {
    list.sort(
      (a, b) =>
        Number(a.event) - Number(b.event) ||
        Number(a.currency === PLATINUM) - Number(b.currency === PLATINUM),
    );
  }
  return out;
}

function resourceRegions(regions: RegionResources): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const [region, resources] of Object.entries(regions)) {
    for (const resource of resources) out.set(resource, [...(out.get(resource) ?? []), region]);
  }
  return out;
}

interface CollectibleRoute {
  place: string | null;
  node: string | null;
  mission: string | null;
  rotation: string | null;
  chance: number | null;
}

interface HeldReward extends RelicReward {
  imageUrl: string | null;
}

export interface CollectibleView {
  collectible: Collectible;
  routes: CollectibleRoute[];
  others: number;
  rewards: HeldReward[];
}

export interface ViewSources {
  rewards: PlaceRewards;
  arsenal: readonly CatalogItem[];
  collectibles: ReadonlyMap<string, Collectible>;
}

const ROUTES_SHOWN = 5;

export function collectibleView(
  sources: ViewSources,
  collectible: Collectible,
  known: ReadonlySet<string>,
  reached: ReadonlySet<string>,
): CollectibleView {
  const found: CollectibleRoute[] = collectible.relic
    ? collectible.relic.farms.map((farm) => ({ ...farm }))
    : routesFor(collectible.drops, collectible.name, known).map((route) => ({
        place:
          route.place === null
            ? null
            : proximaPlace(sources.rewards, route.place, route.nodes, route.source),
        node: route.nodes.slice(0, 2).join(", ") || null,
        mission: route.source,
        rotation:
          route.rotations.length > 1
            ? `${route.rotations[0]}–${route.rotations[route.rotations.length - 1]}`
            : (route.rotations[0] ?? null),
        chance: route.chance,
      }));
  const isReached = (route: CollectibleRoute) => route.place !== null && reached.has(route.place);
  const all = found
    .map((route, index) => ({ route, index }))
    .sort(
      (a, b) =>
        (b.route.chance ?? 0) - (a.route.chance ?? 0) ||
        Number(isReached(b.route)) - Number(isReached(a.route)) ||
        a.index - b.index,
    )
    .map((entry) => entry.route);

  const art = rewardArt(sources);
  return {
    collectible,
    routes: all.slice(0, ROUTES_SHOWN),
    others: Math.max(all.length - ROUTES_SHOWN, 0),
    rewards: (collectible.relic?.rewards ?? []).map((reward) => ({
      ...reward,
      imageUrl: art.get(reward.name.toLowerCase()) ?? null,
    })),
  };
}

const artCache = new WeakMap<ReadonlyMap<string, Collectible>, Map<string, string>>();

function rewardArt(sources: ViewSources): Map<string, string> {
  const cached = artCache.get(sources.collectibles);
  if (cached) return cached;
  const art = new Map<string, string>();
  for (const item of sources.arsenal) {
    for (const part of item.recipe?.parts ?? []) {
      if (part.imageUrl === null) continue;
      const name = part.name.startsWith(`${item.name} `) ? part.name : `${item.name} ${part.name}`;
      art.set(name.toLowerCase(), part.imageUrl);
      art.set(`${name} blueprint`.toLowerCase(), part.imageUrl);
    }
    if (item.imageUrl !== null) art.set(item.name.toLowerCase(), item.imageUrl);
  }
  for (const entry of sources.collectibles.values()) {
    if (entry.imageUrl !== null && !art.has(entry.name.toLowerCase())) {
      art.set(entry.name.toLowerCase(), entry.imageUrl);
    }
  }
  artCache.set(sources.collectibles, art);
  return art;
}

function told(honoria: WikiHonoria | null): boolean {
  return honoria !== null && (honoria.description !== null || honoria.price.length > 0);
}
