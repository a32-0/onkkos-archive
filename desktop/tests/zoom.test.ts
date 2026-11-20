import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isZoomMessage, stepZoom, widthAt, zoomFrom, zoomStepOf } from "../src/zoom.ts";

const PRESS = { type: "keyDown", key: "", code: "", control: true, alt: false, meta: false };

describe("the zoom levels (spec 13, Zoom)", () => {
  it("steps through 100, 115 and 130 and stops at the ends", () => {
    assert.equal(stepZoom(100, "in"), 115);
    assert.equal(stepZoom(115, "in"), 130);
    assert.equal(stepZoom(130, "in"), 130);
    assert.equal(stepZoom(130, "out"), 115);
    assert.equal(stepZoom(100, "out"), 100);
    assert.equal(stepZoom(130, "reset"), 100);
  });

  it("reads a kept level, and anything else as 100", () => {
    assert.equal(zoomFrom("115"), 115);
    assert.equal(zoomFrom("120"), 100);
    assert.equal(zoomFrom(undefined), 100);
  });

  it("widens the window so the page keeps 390 px", () => {
    assert.equal(widthAt(100, 390), 390);
    assert.equal(widthAt(115, 390), 449);
    assert.equal(widthAt(130, 390), 507);
  });

  it("answers Ctrl +, Ctrl − and Ctrl 0, on the main keys and the keypad", () => {
    assert.equal(zoomStepOf({ ...PRESS, key: "+" }), "in");
    assert.equal(zoomStepOf({ ...PRESS, key: "=" }), "in");
    assert.equal(zoomStepOf({ ...PRESS, code: "NumpadAdd" }), "in");
    assert.equal(zoomStepOf({ ...PRESS, key: "-" }), "out");
    assert.equal(zoomStepOf({ ...PRESS, code: "NumpadSubtract" }), "out");
    assert.equal(zoomStepOf({ ...PRESS, key: "0" }), "reset");
    assert.equal(zoomStepOf({ ...PRESS, code: "Numpad0" }), "reset");
  });

  it("leaves other keys alone", () => {
    assert.equal(zoomStepOf({ ...PRESS, key: "+", control: false }), null);
    assert.equal(zoomStepOf({ ...PRESS, key: "+", alt: true }), null);
    assert.equal(zoomStepOf({ ...PRESS, key: "+", type: "keyUp" }), null);
    assert.equal(zoomStepOf({ ...PRESS, key: "c" }), null);
  });

  it("takes a level from the server only when it is one of the three", () => {
    assert.equal(isZoomMessage({ kind: "zoom", level: 130 }), true);
    assert.equal(isZoomMessage({ kind: "zoom", level: 200 }), false);
    assert.equal(isZoomMessage({ kind: "restart" }), false);
  });
});
