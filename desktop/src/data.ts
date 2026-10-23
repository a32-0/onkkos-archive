import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export interface DataManifest {
  schema: number;
  files: Record<string, { size: number; sha256: string }>;
}

export interface DataPlaces {
  bundled: string;
  ownRoot: string;
  version: string;
  source: string;
}

const MANIFEST = "manifest.json";
const STAMP = "app-version";
const CHECK_MS = 30_000;

async function manifestIn(dataDir: string): Promise<DataManifest | null> {
  try {
    return JSON.parse(await readFile(path.join(dataDir, MANIFEST), "utf8")) as DataManifest;
  } catch {
    return null;
  }
}

function sameFiles(a: DataManifest, b: DataManifest): boolean {
  const names = Object.keys(a.files);
  return (
    names.length === Object.keys(b.files).length &&
    names.every((name) => b.files[name]?.sha256 === a.files[name]?.sha256)
  );
}

function hashOf(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function safeName(name: string): boolean {
  return /^(vendor\/)?[a-z0-9_-]+\.(yaml|json)$/.test(name);
}

export async function currentServer(places: DataPlaces): Promise<string> {
  const stamp = await readFile(path.join(places.ownRoot, STAMP), "utf8").catch(() => null);
  if (stamp === places.version && (await manifestIn(path.join(places.ownRoot, "data")))) {
    return places.ownRoot;
  }
  await rm(places.ownRoot, { recursive: true, force: true });
  return places.bundled;
}

async function fetchManifest(
  source: string,
  signal: AbortSignal,
  get: typeof fetch,
): Promise<DataManifest> {
  const response = await get(`${source}/${MANIFEST}`, { signal });
  if (!response.ok) throw new Error(`The manifest answered ${response.status}`);
  return (await response.json()) as DataManifest;
}

async function fillSet(
  next: string,
  current: string,
  have: DataManifest | null,
  want: DataManifest,
  source: string,
  signal: AbortSignal,
  get: typeof fetch,
): Promise<void> {
  await mkdir(path.join(next, "vendor"), { recursive: true });
  for (const [name, file] of Object.entries(want.files)) {
    if (!safeName(name)) throw new Error(`A file outside the data set: ${name}`);
    const target = path.join(next, name);
    if (have?.files[name]?.sha256 === file.sha256) {
      await cp(path.join(current, name), target);
      continue;
    }
    const response = await get(`${source}/${name}`, { signal });
    if (!response.ok) throw new Error(`${name} answered ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length !== file.size || hashOf(bytes) !== file.sha256) {
      throw new Error(`${name} does not match its hash`);
    }
    await writeFile(target, bytes);
  }
  await writeFile(path.join(next, MANIFEST), JSON.stringify(want));
}

export async function refreshData(
  places: DataPlaces,
  get: typeof fetch = fetch,
  limitMs = CHECK_MS,
): Promise<string> {
  const current = await currentServer(places);
  const bundled = await manifestIn(path.join(places.bundled, "data"));
  const have = await manifestIn(path.join(current, "data"));
  const next = `${places.ownRoot}-next`;
  try {
    const signal = AbortSignal.timeout(limitMs);
    const want = await fetchManifest(places.source, signal, get);
    if (!bundled || want.schema !== bundled.schema) return current;
    if (have && sameFiles(have, want)) return current;
    await rm(next, { recursive: true, force: true });
    await cp(places.bundled, next, {
      recursive: true,
      filter: (from) => path.relative(places.bundled, from).split(path.sep)[0] !== "data",
    });
    await fillSet(
      path.join(next, "data"),
      path.join(current, "data"),
      have,
      want,
      places.source,
      signal,
      get,
    );
    await writeFile(path.join(next, STAMP), places.version);
    const old = `${places.ownRoot}-old`;
    await rm(old, { recursive: true, force: true });
    if (current === places.ownRoot) await rename(places.ownRoot, old);
    await rename(next, places.ownRoot);
    await rm(old, { recursive: true, force: true });
    return places.ownRoot;
  } catch (error) {
    console.warn(`The data stayed as it was: ${error instanceof Error ? error.message : error}`);
    await rm(next, { recursive: true, force: true }).catch(() => {});
    return current;
  }
}
