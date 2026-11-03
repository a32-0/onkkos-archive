import type * as FS from "node:fs";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

const root = process.cwd();
const NOT_READ = ["vendor/manifest.json"];

const read = new Set<string>();

vi.mock("node:fs", async (actual) => {
  const fs = await actual<typeof FS>();
  const readFileSync = ((file: string, ...rest: unknown[]) => {
    read.add(
      path.relative(path.join(process.cwd(), "data"), String(file)).split(path.sep).join("/"),
    );
    return (fs.readFileSync as (...args: unknown[]) => unknown)(file, ...rest);
  }) as typeof fs.readFileSync;
  return { ...fs, default: { ...fs, readFileSync }, readFileSync };
});

async function freshCheck() {
  vi.resetModules();
  return (await import("@/infra/data-check")).readAllData;
}

function published(): string[] {
  const manifest = JSON.parse(readFileSync(path.join(root, "data", "manifest.json"), "utf8")) as {
    files: Record<string, unknown>;
  };
  return Object.keys(manifest.files).filter((name) => !NOT_READ.includes(name));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the data a new set must pass before the app uses it (BR-82)", () => {
  it("reads every file the manifest publishes", async () => {
    read.clear();
    (await freshCheck())();
    expect(published().filter((name) => !read.has(name))).toEqual([]);
  });

  it("refuses a route type this code does not know", async () => {
    const copy = mkdtempSync(path.join(tmpdir(), "onkko-check-"));
    cpSync(path.join(root, "data"), path.join(copy, "data"), { recursive: true });
    const sources = path.join(copy, "data", "sources.yaml");
    writeFileSync(sources, readFileSync(sources, "utf8").replace("type: weekly", "type: monthly"));
    vi.spyOn(process, "cwd").mockReturnValue(copy);
    expect(await freshCheck()).toThrow(/discriminator|Invalid/);
  });
});
