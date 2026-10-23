import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildManifest, readManifest } from "../scripts/data-manifest";

const DATA = path.join(process.cwd(), "data");

describe("the data manifest the app reads at each start (spec 13)", () => {
  it("matches every file the server reads; run pnpm data:manifest after changing data/", () => {
    const written = readManifest(DATA);
    expect(written).not.toBeNull();
    expect(written).toEqual(buildManifest(DATA, written?.schema ?? 0));
  });

  it("lists the curated files and the vendored snapshots, and nothing else", () => {
    const names = Object.keys(readManifest(DATA)?.files ?? {});
    expect(names).toContain("sources.yaml");
    expect(names).toContain("vendor/items.json");
    expect(names).not.toContain("manifest.json");
    expect(names).not.toContain("reviewed-update.json");
  });
});
