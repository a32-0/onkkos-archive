import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const RUNNER = path.join("scripts", "data-compat-run.ts");
const SHELL = process.platform === "win32";

function git(...args: string[]): string {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function schemaAt(tag: string): number | null {
  try {
    return (JSON.parse(git("show", `${tag}:data/manifest.json`)) as { schema: number }).schema;
  } catch {
    return null;
  }
}

function released(schema: number, asked: string[]): string[] {
  const tags = asked.length > 0 ? asked : git("tag", "--list", "v*").split("\n").filter(Boolean);
  return tags.filter((tag) => schemaAt(tag) === schema);
}

function readsData(tag: string): string | null {
  const folder = mkdtempSync(path.join(tmpdir(), "onkko-compat-"));
  try {
    git("worktree", "add", "--detach", "--force", folder, tag);
    execFileSync("pnpm", ["install", "--frozen-lockfile", "--ignore-scripts"], {
      cwd: folder,
      stdio: "ignore",
      shell: SHELL,
    });
    rmSync(path.join(folder, "data"), { recursive: true, force: true });
    cpSync(path.join(ROOT, "data"), path.join(folder, "data"), { recursive: true });
    cpSync(path.join(ROOT, RUNNER), path.join(folder, RUNNER));
    const run = spawnSync(
      process.execPath,
      ["--import", "tsx", "--conditions=react-server", RUNNER],
      { cwd: folder, encoding: "utf8" },
    );
    return run.status === 0 ? null : run.stderr.trim() || `exit ${run.status}`;
  } finally {
    rmSync(folder, { recursive: true, force: true });
    git("worktree", "prune");
  }
}

const { schema } = JSON.parse(readFileSync(path.join(ROOT, "data", "manifest.json"), "utf8")) as {
  schema: number;
};
const tags = released(schema, process.argv.slice(2));
const refused: string[] = [];
for (const tag of tags) {
  const refusal = readsData(tag);
  process.stdout.write(`${tag}: ${refusal === null ? "reads this data" : "REFUSES it"}\n`);
  if (refusal !== null) {
    refused.push(tag);
    process.stdout.write(`${refusal.split("\n").slice(0, 12).join("\n")}\n`);
  }
}
if (refused.length > 0) {
  process.stdout.write(
    `\n${refused.join(", ")} would break on this data. Raise "schema" in data/manifest.json (now ${schema}), so released apps keep their own data until they update. See docs/maintaining.md.\n`,
  );
  process.exit(1);
}
process.stdout.write(`Every release on schema ${schema} reads this data (${tags.length}).\n`);
