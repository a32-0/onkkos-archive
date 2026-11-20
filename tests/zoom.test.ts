import { afterEach, describe, expect, it, vi } from "vitest";

import { ZOOM_COOKIE, ZOOM_LEVELS, zoomFrom } from "@/domain/zoom";
import { tellZoom } from "@/infra/app-zoom";
import { keptLevel } from "@/screens/shell/zoom";

const host = process as { parentPort?: { postMessage: (message: unknown) => void } };
const SETTING = {
  level: 100,
  levels: ZOOM_LEVELS,
  cookie: ZOOM_COOKIE,
  choose: async () => {},
} as const;

afterEach(() => {
  delete host.parentPort;
});

describe("the zoom level (BR-92)", () => {
  it("reads one of the three levels, and anything else as 100", () => {
    expect(zoomFrom("130")).toBe(130);
    expect(zoomFrom("200")).toBe(100);
    expect(zoomFrom(null)).toBe(100);
  });

  it("finds the level among the page's cookies", () => {
    expect(keptLevel("wf_place=earth; wf_zoom=115; wf_tour=seen", SETTING)).toBe(115);
    expect(keptLevel("wf_zoom=200", SETTING)).toBe(100);
    expect(keptLevel("", SETTING)).toBe(100);
  });

  it("tells the main process the chosen level", () => {
    const postMessage = vi.fn();
    host.parentPort = { postMessage };
    tellZoom(130);
    expect(postMessage).toHaveBeenCalledWith({ kind: "zoom", level: 130 });
  });
});
