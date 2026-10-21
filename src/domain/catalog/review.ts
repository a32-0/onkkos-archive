import { collectibleStepPlan, stepPlan, type Phrase, type StepPlan } from "@/domain/catalog/checks";
import { COLLECTIBLE_SOURCES, collectibleView } from "@/domain/catalog/collectibles";
import type { CatalogData } from "@/domain/catalog/data";
import { dossier } from "@/domain/catalog/dossier";
import { ARSENAL_SOURCES } from "@/domain/catalog/items";
import { RELIC_SOURCES } from "@/domain/catalog/relics";
import { compareVersions, releaseOfName, type GameUpdate } from "@/domain/catalog/updates";

type Level = "own" | "source" | "new";

type Missing = "route" | "story" | "planet";

export interface ReviewEntry {
  uniqueName?: string;
  name?: string;
  category?: string;
  introduced?: { name?: string };
}

export interface ReviewNode {
  name: string;
  planet: string;
}

export interface Finding {
  name: string;
  kind: string;
  level: Level;
  route: Phrase | null;
  missing: Missing | null;
}

export interface ReviewedUpdate {
  version: string;
  name: string;
  date: string | null;
  hotfixes: string[];
  findings: Finding[];
}

export interface Review {
  updates: ReviewedUpdate[];
  late: Finding[];
  nodes: Finding[];
}

export interface ReviewSources {
  data: CatalogData;
  updates: readonly GameUpdate[];
  entries: readonly ReviewEntry[];
  before: ReadonlySet<string>;
  nodes: readonly ReviewNode[];
  nodesBefore: ReadonlySet<string>;
  places: ReadonlySet<string>;
  now: number;
}

export interface ReviewFrom {
  after: string | null;
  from: string | null;
}

const QUESTS = "Quests";
const NODE_KIND = "Node";
const PASSED_OVER = new Set(["Components", "Enemy", "Node"]);
const KNOWN = new Set([...ARSENAL_SOURCES, ...COLLECTIBLE_SOURCES, ...RELIC_SOURCES]);
const REFINED = / (Intact|Exceptional|Flawless|Radiant)$/;
const HOTFIX = /^Hotfix /;
const PREREQUISITES = "prerequisites";
const MASTERY_RANK = 10;

export function isReviewed(version: string, from: ReviewFrom): boolean {
  if (from.from !== null) return compareVersions(version, from.from) < 0;
  return from.after !== null && compareVersions(version, from.after) <= 0;
}

export function reviewOf(sources: ReviewSources, from: ReviewFrom): Review {
  const named = new Map<string, GameUpdate>();
  for (const update of sources.updates) {
    for (const version of update.versions) if (!named.has(version)) named.set(version, update);
  }

  const windows = new Map<string, ReviewedUpdate>();
  const late: Finding[] = [];
  const seen = new Set<string>();

  for (const entry of sources.entries) {
    const version = releaseOfName(entry.introduced?.name);
    const fresh = entry.uniqueName !== undefined && !sources.before.has(entry.uniqueName);
    const due = version !== null && !isReviewed(version, from);
    if (!due && !fresh) continue;
    const finding = findingOf(sources, entry);
    if (finding === null || seen.has(finding.name)) continue;
    seen.add(finding.name);
    if (!due || version === null) {
      late.push(finding);
      continue;
    }
    const window = windows.get(version) ?? newWindow(version, named.get(version));
    const hotfix = entry.introduced?.name;
    if (hotfix && HOTFIX.test(hotfix) && !window.hotfixes.includes(hotfix)) {
      window.hotfixes.push(hotfix);
    }
    window.findings.push(finding);
    windows.set(version, window);
  }

  for (const update of sources.updates) {
    if (isReviewed(update.version, from) || windows.has(update.version)) continue;
    windows.set(update.version, newWindow(update.version, update));
  }

  const updates = [...windows.values()]
    .map((window) => ({
      ...window,
      hotfixes: window.hotfixes.sort(byHotfix),
      findings: sortFindings(window.findings),
    }))
    .sort((a, b) => compareVersions(b.version, a.version));

  return {
    updates,
    late: sortFindings(late),
    nodes: sortFindings(newNodes(sources)),
  };
}

function byHotfix(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true });
}

function newWindow(version: string, update: GameUpdate | undefined): ReviewedUpdate {
  return {
    version,
    name: update?.name ?? `Update ${version}`,
    date: update && update.version === version ? update.date : null,
    hotfixes: [],
    findings: [],
  };
}

function newNodes(sources: ReviewSources): Finding[] {
  return sources.nodes
    .filter((node) => !sources.nodesBefore.has(node.name))
    .map((node) => {
      const known = sources.places.has(node.planet);
      return {
        name: node.name,
        kind: NODE_KIND,
        level: known ? "own" : "source",
        route: null,
        missing: known ? null : "planet",
      };
    });
}

function findingOf(sources: ReviewSources, entry: ReviewEntry): Finding | null {
  const { data, now } = sources;
  const category = entry.category ?? "";
  const name = entry.name ?? "";
  if (name.length === 0 || PASSED_OVER.has(category)) return null;

  if (category === QUESTS) {
    const told = data.spine.arcs.some((arc) =>
      arc.quests.some((quest) => quest.name.toLowerCase() === name.toLowerCase()),
    );
    return found(name, "Quest", told ? null : "story", null);
  }

  const item = data.arsenal.find((one) => one.uniqueName === entry.uniqueName);
  if (item) {
    const plan = stepPlan(data, dossier(item, data.arsenal), { now, masteryRank: MASTERY_RANK });
    return planned(item.name, item.kind, plan, thinArsenal(plan));
  }

  const collectible = data.collectibles.get(relicName(name, category));
  if (collectible) {
    const empty = new Set<string>();
    const plan = collectibleStepPlan(data, collectibleView(data, collectible, empty, empty), {
      now,
    });
    return planned(collectible.name, collectible.kind, plan, proseOnly(plan));
  }

  if (KNOWN.has(category)) return found(relicName(name, category), category, "route", null);
  return { name, kind: category, level: "new", route: null, missing: null };
}

function relicName(name: string, category: string): string {
  return RELIC_SOURCES.includes(category) && REFINED.test(name)
    ? `${name.replace(REFINED, "")} Relic`
    : name;
}

function found(name: string, kind: string, missing: Missing | null, route: Phrase | null): Finding {
  return { name, kind, level: missing === null ? "own" : "source", route, missing };
}

function planned(name: string, kind: string, plan: StepPlan, thin: boolean): Finding {
  return found(name, kind, thin ? "route" : null, thin ? null : firstRoute(plan));
}

function firstRoute(plan: StepPlan): Phrase | null {
  for (const section of plan.sections) {
    if (section.id === PREREQUISITES) continue;
    const row = section.groups.flatMap((group) => group.rows)[0];
    if (row) return row.title;
  }
  return null;
}

function rowsOf(plan: StepPlan) {
  return plan.sections.flatMap((one) => one.groups.flatMap((group) => group.rows));
}

export function proseOnly(plan: StepPlan): boolean {
  const how = plan.sections.find((one) => one.id === "how");
  const rows = how?.groups.flatMap((group) => group.rows) ?? [];
  return (
    rows.length === 0 || rows.every((row) => row.detail.length === 0 && row.brief.length === 0)
  );
}

export function thinArsenal(plan: StepPlan): boolean {
  const unknown = rowsOf(plan).some((row) => row.id.endsWith(":none"));
  const noRecipe = !plan.sections.some(
    (one) => one.id.startsWith("part:") || one.id === "blueprints",
  );
  const acquisition = plan.sections.some((one) => one.title.say === "sectionAcquisition");
  return unknown || (noRecipe && proseOnly(plan) && !acquisition);
}

const LEVEL_ORDER: Record<Level, number> = { new: 0, source: 1, own: 2 };

function sortFindings(findings: Finding[]): Finding[] {
  return findings.sort(
    (a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || a.name.localeCompare(b.name),
  );
}

export interface RowChanges {
  changed: number;
  added: number;
  removed: number;
}

export function rowChanges(
  before: ReadonlyMap<string, string>,
  after: ReadonlyMap<string, string>,
): RowChanges {
  let changed = 0;
  let added = 0;
  for (const [key, value] of after) {
    const old = before.get(key);
    if (old === undefined) added += 1;
    else if (old !== value) changed += 1;
  }
  const removed = [...before.keys()].filter((key) => !after.has(key)).length;
  return { changed, added, removed };
}
