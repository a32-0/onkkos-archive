import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { dropInstalledUpdate, isInstalled, pendingFolder } from "../src/update-cache.ts";

function pendingWith(fileName: string): string {
  const pending = path.join(mkdtempSync(path.join(tmpdir(), "onkko-updater-")), "pending");
  mkdirSync(pending);
  writeFileSync(path.join(pending, "update-info.json"), JSON.stringify({ fileName }));
  writeFileSync(path.join(pending, fileName), "installer");
  return pending;
}

describe("the updater's cache (spec 13)", () => {
  it("knows an update already installed by its file's version", () => {
    assert.equal(isInstalled("onkkos-archive-1.3.0-setup.exe", "1.3.0"), true);
    assert.equal(isInstalled("onkkos-archive-1.2.9-setup.exe", "1.3.0"), true);
    assert.equal(isInstalled("onkkos-archive-1.9.0.AppImage", "1.10.0"), true);
    assert.equal(isInstalled("onkkos-archive-1.3.1-setup.exe", "1.3.0"), false);
    assert.equal(isInstalled("onkkos-archive-2.0.0-setup.exe", "1.9.9"), false);
    assert.equal(isInstalled(undefined, "1.3.0"), false);
    assert.equal(isInstalled("installer.exe", "1.3.0"), false);
  });

  it("drops the copy of the version now running", () => {
    const pending = pendingWith("onkkos-archive-1.3.0-setup.exe");
    dropInstalledUpdate(pending, "1.3.0");
    assert.equal(existsSync(pending), false);
  });

  it("keeps a newer version that has not installed yet", () => {
    const pending = pendingWith("onkkos-archive-1.3.1-setup.exe");
    dropInstalledUpdate(pending, "1.3.0");
    assert.equal(existsSync(path.join(pending, "onkkos-archive-1.3.1-setup.exe")), true);
  });

  it("finds the cache's folder from the package's update file", () => {
    const folder = mkdtempSync(path.join(tmpdir(), "onkko-config-"));
    const config = path.join(folder, "app-update.yml");
    writeFileSync(
      config,
      "provider: github\nupdaterCacheDirName: onkkos-archive-desktop-updater\n",
    );
    assert.equal(
      pendingFolder(config, "base"),
      path.join("base", "onkkos-archive-desktop-updater", "pending"),
    );
    assert.equal(pendingFolder(path.join(folder, "missing.yml"), "base"), null);
  });
});
