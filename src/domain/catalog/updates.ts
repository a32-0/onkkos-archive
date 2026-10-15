import type { CatalogItem } from "@/domain/catalog/items";
import type { Graph } from "@/domain/graph/schema";
import type { NarrativeSpine } from "@/domain/narrative/schema";
import { ownedArsenal } from "@/domain/profile/arsenal";
import type { RawProfile } from "@/domain/types/profile";

export interface GameUpdate {
  version: number;
  name: string;
  yearMonth: string;
  date: string;
  wikiUrl: string | null;
  items: number;
  quest: string | null;
  art: string | null;
}

interface RawIntroduced {
  name?: string;
  url?: string;
  date?: string;
  parent?: string;
  aliases?: string[];
}

export interface Introduced {
  introduced?: RawIntroduced;
}

export interface UpdateSources {
  entries: readonly Introduced[];
  spine: NarrativeSpine;
  art: Readonly<Record<string, string>>;
  arsenal: CatalogItem[];
}

const FIRST_TRACKED_VERSION = 15;
const UPDATE_NAME = /^Update (\d+\.\d+)$/;
const RELEASE_OF = /(\d+\.\d+)/;
const NUMERIC_ALIAS = /^[0-9]/;
const VERSION_ALIAS = /^Update /;

interface CatalogAnchors {
  anchors: Map<number, RawIntroduced>;
  items: Map<number, number>;
}

const anchorCache = new WeakMap<readonly Introduced[], CatalogAnchors>();

export function gameUpdates(graph: Graph, sources: UpdateSources): GameUpdate[] {
  return buildUpdates(graph, sources);
}

export function updateFor(
  graph: Graph,
  sources: UpdateSources,
  yearMonth: string,
): GameUpdate | null {
  return gameUpdates(graph, sources).find((update) => update.yearMonth === yearMonth) ?? null;
}

interface BannerEntry {
  name: string;
  version: number;
  yearMonth: string;
  art: string | null;
}

export function bannerUpdates(graph: Graph, sources: UpdateSources): BannerEntry[] {
  return gameUpdates(graph, sources).map(({ name, version, yearMonth, art }) => ({
    name,
    version,
    yearMonth,
    art,
  }));
}

interface UpdateStanding {
  update: GameUpdate | null;
  current: boolean;
}

export function latestArsenal(
  updates: readonly GameUpdate[],
  arsenal: readonly CatalogItem[],
): string[] {
  for (const update of updates) {
    const shipped = arsenal.filter(
      (item) => item.releaseDate !== null && item.releaseDate >= update.date,
    );
    if (shipped.length > 0) return shipped.map((item) => item.uniqueName);
  }
  return [];
}

function ownsLatest(
  updates: readonly GameUpdate[],
  arsenal: readonly CatalogItem[],
  owned: ReadonlySet<string> | null,
): boolean {
  if (owned === null) return false;
  const shipped = latestArsenal(updates, arsenal);
  return shipped.length > 0 && shipped.every((name) => owned.has(name));
}

export function updateStanding(
  graph: Graph,
  sources: UpdateSources,
  since: string | null,
  profile: RawProfile,
): UpdateStanding {
  const arsenal = ownedArsenal(profile, sources.arsenal);
  const owned = arsenal.readable
    ? new Set(arsenal.items.map((entry) => entry.item.uniqueName))
    : null;
  const all = gameUpdates(graph, sources);
  const newest = all[0] ?? null;
  const chosen = since ? (all.find((update) => update.yearMonth === since) ?? null) : null;
  const caughtUp = since !== null && newest !== null && since >= newest.yearMonth;
  if (newest && (caughtUp || ownsLatest(all, sources.arsenal, owned))) {
    return { update: newest, current: true };
  }
  return { update: chosen, current: false };
}

function readAnchors(entries: readonly Introduced[]): CatalogAnchors {
  const cached = anchorCache.get(entries);
  if (cached) return cached;

  const anchors = new Map<number, RawIntroduced>();
  const items = new Map<number, number>();

  for (const raw of entries) {
    const introduced = raw.introduced;
    if (!introduced) continue;

    const named = UPDATE_NAME.exec(introduced.name ?? "")?.[1];
    if (named !== undefined && isRealDate(introduced.date)) {
      const version = Number(named);
      if (!anchors.has(version)) anchors.set(version, introduced);
    }

    const release = RELEASE_OF.exec(introduced.name ?? "")?.[1];
    if (release !== undefined) {
      const version = Number(release);
      items.set(version, (items.get(version) ?? 0) + 1);
    }
  }

  const found = { anchors, items };
  anchorCache.set(entries, found);
  return found;
}

function buildUpdates(graph: Graph, sources: UpdateSources): GameUpdate[] {
  const curated = new Map(graph.updateNames.map((entry) => [entry.version, entry.name]));
  const questByDate = questReleases(sources.spine);
  const { anchors, items } = readAnchors(sources.entries);

  const updates: GameUpdate[] = [];
  for (const [version, introduced] of anchors) {
    if (version < FIRST_TRACKED_VERSION) continue;
    const date = introduced.date as string;
    const name = curated.get(version) ?? titleAlias(introduced.aliases);
    if (name === null) continue;
    updates.push({
      version,
      name,
      date,
      yearMonth: date.slice(0, 7),
      wikiUrl: typeof introduced.url === "string" ? introduced.url : null,
      items: items.get(version) ?? 0,
      quest: questByDate.get(date) ?? null,
      art: sources.art[name] ?? null,
    });
  }

  return updates.sort((a, b) => b.version - a.version);
}

function titleAlias(aliases: string[] | undefined): string | null {
  return (
    (aliases ?? []).find(
      (alias) => !NUMERIC_ALIAS.test(alias) && !VERSION_ALIAS.test(alias) && alias.length > 3,
    ) ?? null
  );
}

function questReleases(spine: NarrativeSpine): Map<string, string> {
  const byDate = new Map<string, string>();
  for (const arc of spine.arcs) {
    for (const quest of arc.quests) {
      if (quest.release !== null && !byDate.has(quest.release))
        byDate.set(quest.release, quest.name);
    }
  }
  return byDate;
}

function isRealDate(date: string | undefined): boolean {
  return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && !date.startsWith("0000");
}
