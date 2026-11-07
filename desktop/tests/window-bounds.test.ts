import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { fitBounds, readBounds, writeBounds } from "../src/window-bounds.ts";

const LIMITS = { width: 390, widest: 600, height: 844, lowest: 640 };

function screenOf(height: number) {
  return { x: 0, y: 0, width: 2560, height };
}

function fit(saved: unknown, height: number) {
  const primary = screenOf(height);
  return fitBounds(saved, LIMITS, [primary], primary);
}

describe("the window's kept size (spec 13)", () => {
  it("opens at the size the player left it", () => {
    assert.deepEqual(fit({ width: 520, height: 900 }, 1040), { width: 520, height: 900 });
  });

  it("opens at 390 by 844, or the screen's height, the first time", () => {
    assert.deepEqual(fit(null, 1040), { width: 390, height: 844 });
    assert.deepEqual(fit(null, 700), { width: 390, height: 700 });
  });

  it("keeps a saved size inside the window's limits and the screen", () => {
    assert.deepEqual(fit({ width: 1200, height: 2000 }, 1000), { width: 600, height: 1000 });
    assert.deepEqual(fit({ width: 100, height: 100 }, 1000), { width: 390, height: 640 });
  });

  it("ignores a size it cannot read", () => {
    assert.deepEqual(fit({ width: "wide", height: null }, 1000), { width: 390, height: 844 });
    assert.equal(readBounds(path.join(tmpdir(), "no-such-window.json")), null);
  });

  it("reads back what it wrote", () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), "onkko-window-")), "window.json");
    writeBounds(file, { width: 500, height: 800, x: -7, y: 40 });
    assert.deepEqual(readBounds(file), { width: 500, height: 800, x: -7, y: 40 });
  });
});

describe("the window's kept place (spec 13)", () => {
  const primary = { x: 0, y: 0, width: 2560, height: 1392 };
  const below = { x: -1325, y: 1440, width: 2560, height: 900 };
  const both = [primary, below];
  const left = { width: 500, height: 800 };

  it("opens where the player left it", () => {
    assert.deepEqual(fitBounds({ ...left, x: 300, y: 120 }, LIMITS, both, primary), {
      ...left,
      x: 300,
      y: 120,
    });
  });

  it("opens on the second screen, at negative coordinates too", () => {
    assert.deepEqual(fitBounds({ ...left, x: -1000, y: 1500 }, LIMITS, both, primary), {
      ...left,
      x: -1000,
      y: 1500,
    });
  });

  it("keeps a window held against a screen's edge", () => {
    assert.deepEqual(fitBounds({ ...left, x: -7, y: 0 }, LIMITS, both, primary), {
      ...left,
      x: -7,
      y: 0,
    });
  });

  it("holds the height to the screen it opens on", () => {
    const tall = { width: 500, height: 1300 };
    assert.equal(fitBounds({ ...tall, x: 100, y: 0 }, LIMITS, both, primary).height, 1300);
    assert.equal(fitBounds({ ...tall, x: -1000, y: 1500 }, LIMITS, both, primary).height, 900);
  });

  it("leaves the system to place a window whose screen is gone", () => {
    assert.deepEqual(fitBounds({ ...left, x: -1000, y: 1500 }, LIMITS, [primary], primary), left);
  });

  it("leaves the system to place a window with its title bar off every screen", () => {
    assert.deepEqual(fitBounds({ ...left, x: 2400, y: 100 }, LIMITS, [primary], primary), left);
    assert.deepEqual(fitBounds({ ...left, x: 100, y: -200 }, LIMITS, [primary], primary), left);
  });

  it("opens a file from an older version at its size, with the system placing it", () => {
    assert.deepEqual(fitBounds(left, LIMITS, both, primary), left);
  });

  it("ignores a place it cannot read", () => {
    assert.deepEqual(fitBounds({ ...left, x: "left", y: null }, LIMITS, both, primary), left);
  });
});
