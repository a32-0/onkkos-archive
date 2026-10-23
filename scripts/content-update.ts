import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { REVIEW } from "@/content/review";
import { reviewOf, rowChanges, type ReviewEntry, type ReviewNode } from "@/domain/catalog/review";
import { compareVersions, gameUpdates } from "@/domain/catalog/updates";
import { catalogData, updateSources } from "@/infra/catalog/data";
import { readItems } from "@/infra/catalog/items";
import { loadGraph } from "@/infra/graph/load";
import { loadSystems } from "@/infra/place/load";
import { writeManifest } from "./data-manifest";
import { isEmpty, renderReport } from "./review-report";

const say = (line: string) => process.stdout.write(`${line}\n`);

const ROOT = process.cwd();
const VENDOR = path.join(ROOT, "data", "vendor");
const MARK = path.join(ROOT, "data", "reviewed-update.json");
const MANIFEST = path.join(ROOT, "data", "manifest.json");
const REPORTS = path.join(ROOT, "docs", "updates");
const PACKAGE_FILES = ["package.json", "pnpm-lock.yaml"];
const WIKI_FILE = /^wiki-(.+)\.json$/;

const STEPS: { source: keyof typeof REVIEW.sources; args: string[] }[] = [
  { source: "items", args: ["add", "--save-exact", "@wfcd/items@latest"] },
  { source: "snapshot", args: ["data:items"] },
  { source: "drops", args: ["data:refresh"] },
  { source: "wiki", args: ["data:wiki"] },
  { source: "art", args: ["data:vendor-art"] },
  { source: "notes", args: ["data:patch-notes"] },
];

interface Mark {
  version: string;
  catalog: string;
  reviewedAt: string;
}

interface Options {
  dryRun: boolean;
  since: string | null;
}

function options(argv: readonly string[]): Options {
  const at = argv.indexOf("--since");
  return { dryRun: argv.includes("--dry-run"), since: at >= 0 ? (argv[at + 1] ?? null) : null };
}

function pnpm(args: readonly string[], quiet = true): boolean {
  const result = spawnSync(`pnpm ${args.join(" ")}`, {
    cwd: ROOT,
    shell: true,
    stdio: quiet ? "ignore" : "inherit",
  });
  return result.status === 0;
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function backUp(): Map<string, string | null> {
  const files = new Map<string, string | null>();
  for (const file of PACKAGE_FILES) {
    files.set(path.join(ROOT, file), readFileSync(path.join(ROOT, file), "utf8"));
  }
  for (const file of readdirSync(VENDOR)) {
    files.set(path.join(VENDOR, file), readFileSync(path.join(VENDOR, file), "utf8"));
  }
  files.set(MARK, existsSync(MARK) ? readFileSync(MARK, "utf8") : null);
  files.set(MANIFEST, existsSync(MANIFEST) ? readFileSync(MANIFEST, "utf8") : null);
  return files;
}

function restore(files: ReadonlyMap<string, string | null>): void {
  for (const file of readdirSync(VENDOR)) {
    const full = path.join(VENDOR, file);
    if (!files.has(full)) rmSync(full);
  }
  for (const [file, text] of files) {
    if (text === null) rmSync(file, { force: true });
    else writeFileSync(file, text);
  }
  pnpm(["install", "--frozen-lockfile"]);
}

function snapshotNames(text: string): { version: string; names: Set<string> } {
  const snapshot = JSON.parse(text) as {
    version: string;
    categories: Record<string, { uniqueName?: string }[]>;
  };
  const names = new Set<string>();
  for (const items of Object.values(snapshot.categories)) {
    for (const item of items) if (item.uniqueName) names.add(item.uniqueName);
  }
  return { version: snapshot.version, names };
}

function nodesOf(text: string): ReviewNode[] {
  const { nodes } = JSON.parse(text) as { nodes: { name: string; planet: string }[] };
  return nodes.map((node) => ({ name: node.name, planet: node.planet }));
}

function dropRows(text: string): Map<string, string> {
  const { places } = JSON.parse(text) as {
    places: Record<
      string,
      {
        node: string;
        mission: string;
        rewards: { rotation: string; item: string; chance: number }[];
      }[]
    >;
  };
  const rows = new Map<string, string>();
  for (const [place, nodes] of Object.entries(places)) {
    for (const node of nodes) {
      for (const reward of node.rewards) {
        rows.set(
          [place, node.node, node.mission, reward.rotation, reward.item].join("\u0000"),
          String(reward.chance),
        );
      }
    }
  }
  return rows;
}

function changedWiki(files: ReadonlyMap<string, string | null>): string[] {
  const names: string[] = [];
  for (const file of readdirSync(VENDOR).sort()) {
    const match = WIKI_FILE.exec(file);
    if (!match?.[1]) continue;
    const full = path.join(VENDOR, file);
    if (files.get(full) !== readFileSync(full, "utf8")) names.push(match[1]);
  }
  return names;
}

function places(): Set<string> {
  const systems = loadSystems();
  const known = new Set<string>(systems.systems.flatMap((system) => system.places));
  for (const [alias, place] of Object.entries(systems.aliases)) {
    known.add(alias);
    known.add(place);
  }
  return known;
}

function main(): number {
  const { dryRun, since } = options(process.argv.slice(2));
  const files = backUp();
  const mark = existsSync(MARK) ? readJson<Mark>(MARK) : null;
  const before = snapshotNames(files.get(path.join(VENDOR, "items.json")) ?? "");
  const nodesBefore = new Set(
    nodesOf(files.get(path.join(VENDOR, "wiki-nodes.json")) ?? "").map((node) => node.name),
  );
  const dropsBefore = dropRows(files.get(path.join(VENDOR, "place-rewards.json")) ?? "");

  try {
    for (const step of STEPS) {
      if (!pnpm(step.args)) {
        restore(files);
        say(REVIEW.failed(REVIEW.sources[step.source]));
        return 1;
      }
    }

    const data = catalogData();
    const updates = gameUpdates(loadGraph(), updateSources());
    const after = readFileSync(path.join(VENDOR, "items.json"), "utf8");
    const review = reviewOf(
      {
        data,
        updates,
        entries: readItems<ReviewEntry>(),
        before: before.names,
        nodes: nodesOf(readFileSync(path.join(VENDOR, "wiki-nodes.json"), "utf8")),
        nodesBefore,
        places: places(),
        now: Date.now(),
      },
      { after: mark?.version ?? null, from: since },
    );

    if (isEmpty(review)) {
      restore(files);
      say(REVIEW.nothingLine);
      return 0;
    }

    writeManifest(path.join(ROOT, "data"));
    const passed = pnpm(["check"]);
    const today = new Date().toISOString().slice(0, 10);
    const catalogTo = snapshotNames(after).version;
    const report = renderReport(review, {
      date: today,
      catalogFrom: before.version,
      catalogTo,
      passed,
      drops: rowChanges(
        dropsBefore,
        dropRows(readFileSync(path.join(VENDOR, "place-rewards.json"), "utf8")),
      ),
      modules: changedWiki(files),
    });

    const newest = review.updates[0]?.version ?? today;
    mkdirSync(REPORTS, { recursive: true });
    const written = path.join(REPORTS, `${newest}.md`);
    writeFileSync(written, report);
    pnpm(["exec", "prettier", "--write", JSON.stringify(written)]);
    say(report.split("\n").slice(0, 7).join("\n"));
    say(REVIEW.written(newest));

    if (dryRun) {
      restore(files);
      say(REVIEW.restored);
      return 0;
    }

    const latest = [mark?.version ?? "0", ...updates.map((update) => update.version)].sort(
      compareVersions,
    );
    const next: Mark = {
      version: latest[latest.length - 1] ?? newest,
      catalog: catalogTo,
      reviewedAt: today,
    };
    writeFileSync(MARK, `${JSON.stringify(next, null, 2)}\n`);
    return passed ? 0 : 1;
  } catch (error) {
    restore(files);
    throw error;
  }
}

process.exitCode = main();
