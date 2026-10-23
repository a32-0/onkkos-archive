import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, it } from "node:test";

import { currentServer, refreshData, type DataManifest, type DataPlaces } from "../src/data.ts";

const SOURCE = "https://data.example/data";

function manifestOf(files: Record<string, string>, schema = 1): DataManifest {
  return {
    schema,
    files: Object.fromEntries(
      Object.entries(files).map(([name, text]) => [
        name,
        { size: Buffer.byteLength(text), sha256: createHash("sha256").update(text).digest("hex") },
      ]),
    ),
  };
}

function writeSet(root: string, files: Record<string, string>, schema = 1): void {
  mkdirSync(path.join(root, "data", "vendor"), { recursive: true });
  for (const [name, text] of Object.entries(files))
    writeFileSync(path.join(root, "data", name), text);
  writeFileSync(
    path.join(root, "data", "manifest.json"),
    JSON.stringify(manifestOf(files, schema)),
  );
  writeFileSync(path.join(root, "server.js"), "");
}

function served(published: Record<string, string>, manifest = manifestOf(published)): typeof fetch {
  return (async (url: string | URL | Request) => {
    const name = String(url).slice(SOURCE.length + 1);
    if (name === "manifest.json") return Response.json(manifest);
    const text = published[name];
    return text === undefined ? new Response(null, { status: 404 }) : new Response(text);
  }) as typeof fetch;
}

const OLD = { "grafo.yaml": "old graph", "vendor/items.json": "[1]" };
const NEW = { "grafo.yaml": "new graph", "vendor/items.json": "[1]" };

describe("the data at each start (spec 13)", () => {
  let places: DataPlaces;

  beforeEach(() => {
    const base = mkdtempSync(path.join(tmpdir(), "onkko-data-"));
    places = {
      bundled: path.join(base, "bundled"),
      ownRoot: path.join(base, "own", "server"),
      version: "0.1.0",
      source: SOURCE,
    };
    writeSet(places.bundled, OLD);
  });

  const graphIn = (root: string) => readFileSync(path.join(root, "data", "grafo.yaml"), "utf8");

  it("swaps in a newer, verified set beside the program, and keeps the program's own", async () => {
    const root = await refreshData(places, served(NEW));
    assert.equal(root, places.ownRoot);
    assert.equal(graphIn(root), "new graph");
    assert.ok(existsSync(path.join(root, "server.js")));
    assert.equal(graphIn(places.bundled), "old graph");
    assert.equal(await currentServer(places), places.ownRoot);
  });

  it("keeps the set it has when the published one is the same", async () => {
    assert.equal(await refreshData(places, served(OLD)), places.bundled);
  });

  it("keeps the current set on a wrong hash", async () => {
    const lying = { ...manifestOf(NEW) };
    lying.files = { ...lying.files, "grafo.yaml": { size: 9, sha256: "0".repeat(64) } };
    assert.equal(await refreshData(places, served(NEW, lying)), places.bundled);
    assert.ok(!existsSync(places.ownRoot));
  });

  it("ignores a set made for another schema", async () => {
    assert.equal(await refreshData(places, served(NEW, manifestOf(NEW, 2))), places.bundled);
  });

  it("keeps the current set with no connection, or when the check runs out of time", async () => {
    const offline = (async () => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;
    assert.equal(await refreshData(places, offline), places.bundled);
    const slow = ((_url: string, init?: RequestInit) =>
      new Promise((_resolve, reject) =>
        init?.signal?.addEventListener("abort", () => reject(init.signal?.reason)),
      )) as typeof fetch;
    assert.equal(await refreshData(places, slow, 50), places.bundled);
  });

  it("drops a downloaded set when the app itself changes version", async () => {
    await refreshData(places, served(NEW));
    assert.equal(await currentServer({ ...places, version: "0.2.0" }), places.bundled);
    assert.ok(!existsSync(places.ownRoot));
  });
});
