import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { channelOf } from "../src/channel.ts";

describe("where the app was installed from (spec 13)", () => {
  it("updates itself from GitHub when packaged outside the Store", () => {
    assert.equal(channelOf(true, false), "github");
    assert.equal(channelOf(true, undefined), "github");
  });

  it("leaves updating to the Microsoft Store when it runs from its package", () => {
    assert.equal(channelOf(true, true), "store");
  });

  it("never updates when started from the tree", () => {
    assert.equal(channelOf(false, false), "tree");
    assert.equal(channelOf(false, true), "tree");
  });
});
