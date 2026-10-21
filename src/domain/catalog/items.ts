import { affinityFactor, maxRankOf } from "@/domain/catalog/mastery";

type ArsenalGroup = "Warframes" | "Primary" | "Secondary" | "Melee" | "Archwing" | "Companions";

type ArsenalKind = ArsenalGroup | "Necramech";

export type SlotKind = "Warframe" | "Weapon" | "Archwing" | "Companion";

export interface CatalogDrop {
  location: string;
  type: string | null;
  chance: number | null;
  rarity: string | null;
}

interface RawDrop {
  location?: string;
  type?: string;
  chance?: number;
  rarity?: string;
}

interface RawComponent {
  uniqueName?: string;
  name?: string;
  itemCount?: number;
  imageName?: string;
  drops?: RawDrop[];
}

export interface RawItem {
  uniqueName: string;
  name: string;
  category?: string;
  productCategory?: string;
  masteryReq?: number;
  maxLevelCap?: number;
  imageName?: string;
  masterable?: boolean;
  isPrime?: boolean;
  vaulted?: boolean;
  bpCost?: number | "";
  marketCost?: number | string;
  buildPrice?: number;
  buildTime?: number;
  buildQuantity?: number;
  wikiaUrl?: string;
  releaseDate?: string;
  introduced?: { name?: string; url?: string; date?: string };
  drops?: RawDrop[];
  components?: RawComponent[];
}

interface CatalogUpdate {
  name: string;
  url: string | null;
}

interface CatalogPart {
  name: string;
  count: number;
  imageUrl: string | null;
  drops: CatalogDrop[];
}

export interface CatalogIngredient {
  name: string;
  uniqueName: string | null;
  count: number;
  imageUrl: string | null;
}

interface CatalogRecipe {
  parts: CatalogPart[];
  ingredients: CatalogIngredient[];
  credits: number | null;
  buildSeconds: number | null;
  yields: number;
}

export interface CatalogItem {
  uniqueName: string;
  name: string;
  group: ArsenalGroup;
  kind: ArsenalKind;
  slot: SlotKind | null;
  masteryReq: number;
  maxRank: number;
  affinityFactor: number;
  imageUrl: string | null;
  isPrime: boolean;
  vaulted: boolean;
  buildable: boolean;
  wikiUrl: string | null;
  releaseDate: string | null;
  update: CatalogUpdate | null;
  drops: CatalogDrop[];
  recipe: CatalogRecipe | null;
}

const SOURCE_CATEGORIES: Record<string, ArsenalGroup> = {
  Warframes: "Warframes",
  Primary: "Primary",
  Secondary: "Secondary",
  Melee: "Melee",
  Archwing: "Archwing",
  "Arch-Gun": "Archwing",
  "Arch-Melee": "Archwing",
  Sentinels: "Companions",
  Pets: "Companions",
  Misc: "Secondary",
};

export const ARSENAL_SOURCES = Object.keys(SOURCE_CATEGORIES);

export const RESOURCE_SOURCES = ["Resources", "Misc"];

export interface CatalogResource {
  uniqueName: string;
  name: string;
  imageUrl: string | null;
}

const ICON_BASE = "https://cdn.warframestat.us/img";
const PLACEHOLDER_ART = "GenericComponent.png";

export const BLUEPRINT_ART = `${ICON_BASE}/blueprint.png`;

const ACQUISITION_ANCHOR = "#Acquisition";

const BLUEPRINT = "Blueprint";

function leafOf(uniqueName: string): string {
  return uniqueName.slice(uniqueName.lastIndexOf("/") + 1).toLowerCase();
}

function stemOf(item: RawItem): string {
  const unique = item.components?.find(
    (component) => component.name === BLUEPRINT && component.uniqueName?.endsWith(BLUEPRINT),
  )?.uniqueName;
  return unique ? leafOf(unique).slice(0, -BLUEPRINT.length) : "";
}

function isNative(stem: string, uniqueName: string): boolean {
  return stem.length > 0 && leafOf(uniqueName).startsWith(stem);
}

function partOwners(raw: RawItem[]): Map<string, string> {
  const owners = new Map<string, { name: string; stem: number }>();
  for (const item of raw) {
    const stem = stemOf(item);
    for (const { uniqueName } of item.components ?? []) {
      if (!uniqueName || !isNative(stem, uniqueName)) continue;
      const known = owners.get(uniqueName);
      if (!known || stem.length > known.stem) {
        owners.set(uniqueName, { name: item.name, stem: stem.length });
      }
    }
  }
  return new Map([...owners].map(([unique, owner]) => [unique, owner.name]));
}

export function buildArsenalCatalog(raw: RawItem[]): CatalogItem[] {
  const seen = new Set<string>();
  const owners = partOwners(raw);
  return raw
    .filter((item) => item.masterable !== false && Boolean(item.name))
    .map((item) => toCatalogItem(item, owners))
    .filter((item): item is CatalogItem => {
      if (!item || seen.has(item.uniqueName)) return false;
      seen.add(item.uniqueName);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function buildResourceCatalog(raw: RawItem[]): CatalogResource[] {
  const seen = new Set<string>();
  return raw
    .filter((item) => Boolean(item.name) && !seen.has(item.uniqueName) && seen.add(item.uniqueName))
    .map((item) => ({
      uniqueName: item.uniqueName,
      name: item.name,
      imageUrl: iconUrl(item.imageName),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const byUniqueName = new WeakMap<CatalogItem[], Map<string, CatalogItem>>();

export function catalogByUniqueName(catalog: CatalogItem[]): Map<string, CatalogItem> {
  let index = byUniqueName.get(catalog);
  if (!index) {
    index = new Map(catalog.map((item) => [item.uniqueName, item]));
    byUniqueName.set(catalog, index);
  }
  return index;
}

function iconUrl(imageName: string | undefined): string | null {
  return imageName && imageName !== PLACEHOLDER_ART ? `${ICON_BASE}/${imageName}` : null;
}

function acquisitionAnchor(wikiaUrl: string | undefined): string | null {
  if (!wikiaUrl) return null;
  return wikiaUrl.includes("#") ? wikiaUrl : wikiaUrl + ACQUISITION_ANCHOR;
}

function readDropList(drops: RawDrop[] | undefined): CatalogDrop[] {
  const out: CatalogDrop[] = [];
  for (const drop of drops ?? []) {
    if (typeof drop.location !== "string") continue;
    out.push({
      location: drop.location,
      type: typeof drop.type === "string" ? drop.type : null,
      chance: typeof drop.chance === "number" ? drop.chance : null,
      rarity: typeof drop.rarity === "string" ? drop.rarity : null,
    });
  }
  return out;
}

function readDrops(item: RawItem): CatalogDrop[] {
  const out = readDropList(item.drops);
  for (const component of item.components ?? []) out.push(...readDropList(component.drops));
  return out;
}

function toCatalogItem(item: RawItem, owners: Map<string, string>): CatalogItem | null {
  const group = item.category ? SOURCE_CATEGORIES[item.category] : undefined;
  if (!group) return null;

  const { productCategory } = item;
  if (group === "Warframes" && productCategory !== "Suits" && productCategory !== "MechSuits") {
    return null;
  }

  return {
    uniqueName: item.uniqueName,
    name: item.name,
    group,
    kind: productCategory === "MechSuits" ? "Necramech" : group,
    slot: slotOf(group, productCategory),
    masteryReq: typeof item.masteryReq === "number" ? item.masteryReq : 0,
    maxRank: maxRankOf(item.maxLevelCap),
    affinityFactor: affinityFactor(productCategory),
    imageUrl: iconUrl(item.imageName),
    isPrime: item.isPrime === true,
    vaulted: item.vaulted === true,
    buildable: Boolean(item.bpCost) || Boolean(item.marketCost),
    wikiUrl: acquisitionAnchor(item.wikiaUrl),
    releaseDate: typeof item.releaseDate === "string" ? item.releaseDate : null,
    update: readUpdate(item),
    drops: readDrops(item),
    recipe: readRecipe(item, owners),
  };
}

const SLOT_BY_PRODUCT: Record<string, SlotKind> = {
  Suits: "Warframe",
  SpaceSuits: "Archwing",
  LongGuns: "Weapon",
  Pistols: "Weapon",
  Melee: "Weapon",
  SpaceGuns: "Weapon",
  SpaceMelee: "Weapon",
};

function slotOf(group: ArsenalGroup, productCategory: string | undefined): SlotKind | null {
  if (group === "Companions") return "Companion";
  return productCategory === undefined ? null : (SLOT_BY_PRODUCT[productCategory] ?? null);
}

const CRAFTED_PART = "/Lotus/Types/Recipes/";

function isPart(component: RawComponent, itemName: string, count: number): boolean {
  if (component.uniqueName?.startsWith(CRAFTED_PART)) return true;
  return count === 1 && component.name?.startsWith(`${itemName} `) === true;
}

function partName(
  item: RawItem,
  name: string,
  owners: Map<string, string>,
  unique?: string,
): string {
  const owner = unique ? owners.get(unique) : undefined;
  if (!unique || !owner || owner === item.name || isNative(stemOf(item), unique)) return name;
  return `${owner} ${name}`;
}

function readRecipe(item: RawItem, owners: Map<string, string>): CatalogRecipe | null {
  const components = item.components ?? [];
  if (components.length === 0) return null;

  const parts: CatalogPart[] = [];
  const ingredients: CatalogIngredient[] = [];

  for (const component of components) {
    if (typeof component.name !== "string" || component.name.length === 0) continue;
    const count = typeof component.itemCount === "number" ? component.itemCount : 1;
    const imageUrl = iconUrl(component.imageName);
    if (isPart(component, item.name, count)) {
      parts.push({
        name: partName(item, component.name, owners, component.uniqueName),
        count,
        imageUrl,
        drops: readDropList(component.drops),
      });
    } else {
      const uniqueName = component.uniqueName ?? null;
      const same = ingredients.find(
        (entry) => entry.name === component.name && entry.uniqueName === uniqueName,
      );
      if (same) same.count += count;
      else ingredients.push({ name: component.name.trim(), uniqueName, count, imageUrl });
    }
  }

  if (parts.length === 0 && ingredients.length === 0) return null;

  return {
    parts,
    ingredients: ingredients.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    credits: typeof item.buildPrice === "number" ? item.buildPrice : null,
    buildSeconds: typeof item.buildTime === "number" ? item.buildTime : null,
    yields: typeof item.buildQuantity === "number" ? item.buildQuantity : 1,
  };
}

function readUpdate(item: RawItem): CatalogUpdate | null {
  const name = item.introduced?.name;
  if (typeof name !== "string" || name.length === 0) return null;
  return { name, url: typeof item.introduced?.url === "string" ? item.introduced.url : null };
}
