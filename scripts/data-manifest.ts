import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export interface DataManifest {
  schema: number;
  files: Record<string, { size: number; sha256: string }>;
}

const FIRST_SCHEMA = 1;

function served(dataDir: string): string[] {
  const top = readdirSync(dataDir).filter((name) => name.endsWith(".yaml"));
  const vendor = readdirSync(path.join(dataDir, "vendor"))
    .filter((name) => name.endsWith(".json"))
    .map((name) => `vendor/${name}`);
  return [...top, ...vendor].sort();
}

export function buildManifest(dataDir: string, schema: number): DataManifest {
  const files: DataManifest["files"] = {};
  for (const name of served(dataDir)) {
    const bytes = readFileSync(path.join(dataDir, name));
    files[name] = { size: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
  }
  return { schema, files };
}

export function readManifest(dataDir: string): DataManifest | null {
  const file = path.join(dataDir, "manifest.json");
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as DataManifest) : null;
}

export function writeManifest(dataDir: string): DataManifest {
  const manifest = buildManifest(dataDir, readManifest(dataDir)?.schema ?? FIRST_SCHEMA);
  writeFileSync(path.join(dataDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

if (import.meta.main) {
  const manifest = writeManifest(path.join(process.cwd(), "data"));
  process.stdout.write(
    `data/manifest.json: schema ${manifest.schema}, ${Object.keys(manifest.files).length} files\n`,
  );
}
