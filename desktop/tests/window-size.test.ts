import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { fitSize, readSize, writeSize } from "../src/window-size.ts";

const LIMITS = { width: 390, widest: 600, height: 844, lowest: 640 };

describe("the window's kept size (spec 13)", () => {
  it("opens at the size the player left it", () => {
    assert.deepEqual(fitSize({ width: 520, height: 900 }, LIMITS, 1040), {
      width: 520,
      height: 900,
    });
  });

  it("opens at 390 by 844, or the screen's height, the first time", () => {
    assert.deepEqual(fitSize(null, LIMITS, 1040), { width: 390, height: 844 });
    assert.deepEqual(fitSize(null, LIMITS, 700), { width: 390, height: 700 });
  });

  it("keeps a saved size inside the window's limits and the screen", () => {
    assert.deepEqual(fitSize({ width: 1200, height: 2000 }, LIMITS, 1000), {
      width: 600,
      height: 1000,
    });
    assert.deepEqual(fitSize({ width: 100, height: 100 }, LIMITS, 1000), {
      width: 390,
      height: 640,
    });
  });

  it("ignores a size it cannot read", () => {
    assert.deepEqual(fitSize({ width: "wide", height: null }, LIMITS, 1000), {
      width: 390,
      height: 844,
    });
    assert.equal(readSize(path.join(tmpdir(), "no-such-window.json")), null);
  });

  it("reads back what it wrote", () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), "onkko-window-")), "window.json");
    writeSize(file, { width: 500, height: 800 });
    assert.deepEqual(readSize(file), { width: 500, height: 800 });
  });
});
