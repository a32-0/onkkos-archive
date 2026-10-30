function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export const REVIEW = {
  title: (date: string) => `# Content review of ${date}`,
  catalog: (from: string, to: string) =>
    from === to ? `Catalog ${to}, unchanged.` : `Catalog ${from} → ${to}.`,
  checked: (passed: boolean) =>
    passed
      ? "Every check passes with the new data: types, lint, format and tests."
      : "The checks fail with the new data: run pnpm check to see which.",
  glance: "## At a glance",
  counts: (own: number, source: number, fresh: number) =>
    `${plural(own + source + fresh, "new thing", "new things")}: ${own} ${own === 1 ? "enters" : "enter"} on ${own === 1 ? "its" : "their"} own, ${source} ${source === 1 ? "needs" : "need"} a source, ${fresh} ${fresh === 1 ? "is" : "are"} new to the app.`,
  nothing: "Nothing new: no update since the last review, and nothing new in the catalog.",
  update: (version: string, name: string) =>
    name === `Update ${version}` ? `## Update ${version}` : `## Update ${version}: ${name}`,
  released: (date: string | null, hotfixes: readonly string[]) => {
    const when = date === null ? "Not in DE's patch notes yet." : `Released ${date}.`;
    return hotfixes.length === 0 ? when : `${when} With what ${listOf(hotfixes)} added.`;
  },
  empty: "The catalog has nothing from it yet; the next review lists what it brought.",
  late: "## New in the catalog, from updates already reviewed",
  lateLead: "The catalog added these after their update was reviewed.",
  places: "## New places",
  newToApp: "### New to the app — needs you",
  fresh: (name: string, kind: string) =>
    `- **${name}** (${kind}): no screen places a ${kind} item. Next: decide whether the app answers it at all. If it does, it needs a rule and a Step by step frame before any code.`,
  needsSource: "### Needs a source",
  sourceHead: ["What", "Kind", "What is missing", "Where to look"],
  missing: {
    route: "How to get it",
    story: "Its place in the story",
    planet: "The planet it belongs to",
  },
  lookIn: {
    route: "Its wiki page, Acquisition",
    story: "The quest's wiki page",
    planet: "The node's wiki page",
  },
  ownHead: ["What", "Kind", "Where it comes from"],
  noRoute: "Its own page",
  ownLevel: "### Enters on its own",
  changed: "## What else changed",
  drops: (changed: number, added: number, removed: number) =>
    changed + added + removed === 0
      ? "Drop tables: unchanged."
      : `Drop tables: ${plural(changed, "row", "rows")} changed, ${added} added, ${removed} removed.`,
  wiki: (names: readonly string[]) =>
    names.length === 0 ? "Wiki data: unchanged." : `Wiki data: ${listOf(names)} changed.`,
  wikiNames: {
    adversaries: "Adversaries",
    baro: "Baro",
    blueprints: "Blueprints",
    circuit: "The Circuit",
    companions: "Companions",
    "honoria-tags": "Honoria tags",
    honorias: "Honorias",
    incarnons: "Incarnons",
    nodes: "Missions",
    relics: "Void relics",
    research: "Research",
    resources: "Resources",
    titles: "Titles",
    traits: "Weapons",
    vendors: "Vendors",
  } as Record<string, string>,
  nothingLine: "Nothing new since the last review. Every source is as it was.",
  restored: "Every source and the mark are back as they were.",
  failed: (source: string) =>
    `Could not bring ${source} up to date. Every source is back as it was; try again later.`,
  sources: {
    items: "the item catalog",
    snapshot: "the item catalog's snapshot",
    drops: "DE's drop tables and the update art",
    wiki: "the wiki's data",
    art: "the vendors' art and the drops' sources",
    notes: "DE's patch notes",
  },
  written: (version: string) => `The report is in the updates folder, as ${version}.`,
} as const;

function listOf(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
