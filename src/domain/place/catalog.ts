import { affinityFactor, maxRankOf } from "@/domain/catalog/mastery";
import { registerTarget, type RewardTarget } from "@/domain/place/resolve";

export type Catalog = "arsenal" | "collection";

export type Group =
  | "warframes"
  | "primary"
  | "secondary"
  | "melee"
  | "archgun"
  | "archmelee"
  | "amp"
  | "companion"
  | "necramech"
  | "archwing"
  | "railjack"
  | "resources"
  | "relics"
  | "mods"
  | "arcanes"
  | "incarnons"
  | "ephemera"
  | "honoria";

type SummaryGroup = "warframes" | "weapons" | "companions" | "vehicles";

const ARSENAL_GROUPS: ReadonlySet<Group> = new Set([
  "warframes",
  "primary",
  "secondary",
  "melee",
  "archgun",
  "archmelee",
  "amp",
  "companion",
  "necramech",
  "archwing",
  "railjack",
]);

const SUMMARY_GROUPS: Readonly<Partial<Record<Group, SummaryGroup>>> = {
  warframes: "warframes",
  primary: "weapons",
  secondary: "weapons",
  melee: "weapons",
  archgun: "weapons",
  archmelee: "weapons",
  amp: "weapons",
  companion: "companions",
  necramech: "vehicles",
  archwing: "vehicles",
  railjack: "vehicles",
};

const BY_CATEGORY: Readonly<Record<string, Group>> = {
  Warframes: "warframes",
  Primary: "primary",
  Secondary: "secondary",
  Melee: "melee",
  "Arch-Gun": "archgun",
  "Arch-Melee": "archmelee",
  Sentinels: "companion",
  Pets: "companion",
  Archwing: "archwing",
  Railjack: "railjack",
  Resources: "resources",
  Relics: "relics",
  Mods: "mods",
  Arcanes: "arcanes",
};

const BY_UNIQUE_NAME: readonly { match: RegExp; group: Group }[] = [
  { match: /\/IncarnonAdapters\//, group: "incarnons" },
  { match: /\/OperatorAmplifiers\//, group: "amp" },
  { match: /\/Types\/Items\/Titles\//, group: "honoria" },
  { match: /\/Upgrades\/Skins\/Effects\//, group: "ephemera" },
  { match: /\/Upgrades\/Skins\/RailJack\//, group: "railjack" },
  { match: /\/Types\/Items\/MiscItems\//, group: "resources" },
];

const BY_TYPE: Readonly<Record<string, Group>> = {
  "Kitgun Component": "secondary",
};

const WHOLE_GROUPS: ReadonlySet<Group> = new Set(["amp", "railjack"]);

const BY_PRODUCT: Readonly<Record<string, Group>> = {
  MechSuits: "necramech",
  OperatorAmps: "amp",
  SentinelWeapons: "companion",
};

function groupOf(item: RawEntry): Group | null {
  const unique = item.uniqueName ?? "";
  const group =
    BY_UNIQUE_NAME.find((rule) => rule.match.test(unique))?.group ??
    (item.productCategory ? BY_PRODUCT[item.productCategory] : undefined) ??
    (item.type ? BY_TYPE[item.type] : undefined) ??
    (item.category ? BY_CATEGORY[item.category] : undefined) ??
    null;
  if (group === "ephemera" && !item.name?.endsWith(" Ephemera")) return null;
  if (
    group !== null &&
    ARSENAL_GROUPS.has(group) &&
    !WHOLE_GROUPS.has(group) &&
    item.masterable === false
  )
    return null;
  return group;
}

export function summaryGroupOf(group: Group): SummaryGroup | Group {
  return SUMMARY_GROUPS[group] ?? group;
}

const ICON_BASE = "https://cdn.warframestat.us/img";

export interface CatalogEntry {
  uniqueName: string;
  name: string;
  category: string;
  catalog: Catalog;
  group: Group;
  imageUrl: string | null;
  wikiUrl: string | null;
  masterable: boolean;
  releaseDate: string | null;
  maxRank: number;
  affinityFactor: number;
}

export interface RawEntry {
  uniqueName?: string;
  releaseDate?: string;
  introduced?: { date?: string };
  maxLevelCap?: number;
  productCategory?: string;
  type?: string;
  name?: string;
  category?: string;
  imageName?: string;
  wikiaUrl?: string;
  masterable?: boolean;
  components?: { name?: string }[];
}

export interface PlaceCatalog {
  entries: ReadonlyMap<string, CatalogEntry>;
  index: ReadonlyMap<string, RewardTarget>;
}

export function buildPlaceCatalog(raw: readonly RawEntry[]): PlaceCatalog {
  const entries = new Map<string, CatalogEntry>();
  const index = new Map<string, RewardTarget>();

  for (const item of raw) {
    const { name, category } = item;
    if (!name || !category) continue;
    const unique = item.uniqueName ?? "";
    const group = groupOf(item);
    if (!group) continue;
    const masterable = item.masterable !== false;
    const placement = {
      catalog: (ARSENAL_GROUPS.has(group) ? "arsenal" : "collection") as Catalog,
      group,
    };

    if (!entries.has(name)) {
      entries.set(name, {
        uniqueName: unique,
        name,
        category,
        catalog: placement.catalog,
        group: placement.group,
        imageUrl: item.imageName ? `${ICON_BASE}/${item.imageName}` : null,
        wikiUrl: item.wikiaUrl ?? null,
        masterable,
        releaseDate: item.releaseDate ?? item.introduced?.date ?? null,
        maxRank: maxRankOf(item.maxLevelCap),
        affinityFactor: affinityFactor(item.productCategory),
      });
    }

    const target: RewardTarget = { name, group: placement.group };
    registerTarget(index, name, target);
    registerTarget(index, `${name} blueprint`, target);

    for (const component of item.components ?? []) {
      const part = component.name;
      if (!part) continue;
      registerTarget(index, `${name} ${part}`, target);
      registerTarget(index, `${name} ${part} blueprint`, target);
      if (part.toLowerCase().startsWith(`${name.toLowerCase()} `)) {
        registerTarget(index, part, target);
        registerTarget(index, `${part} blueprint`, target);
      }
    }
  }

  return { entries, index };
}
