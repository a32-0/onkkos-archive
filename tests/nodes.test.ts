import { describe, expect, it } from "vitest";

import { nodeCountsByPlace } from "@/domain/profile/nodes";

import { CY, fixture, NEW_PLAYER, testGraph } from "./helpers";

const graph = testGraph();
const planets = graph.starChartOrder.map((entry) => entry.planet);
const cy = fixture(CY);
const newPlayer = fixture(NEW_PLAYER);

describe("nodeCountsByPlace", () => {
  it("without Missions there is no data, not a zero", () => {
    expect(nodeCountsByPlace({})).toBeNull();
  });

  it("counts star chart nodes only, without relays or Railjack", () => {
    const counts = nodeCountsByPlace(cy);
    expect(counts?.get("Earth")).toEqual({ total: 15, done: 15, steelPath: 12 });
  });

  it("reads Steel Path from Missions[].Tier", () => {
    const counts = nodeCountsByPlace(newPlayer);
    expect(counts?.get("Earth")).toMatchObject({ done: 3, steelPath: 0 });
  });

  it("keys every planet the model names", () => {
    const counts = nodeCountsByPlace(cy);
    for (const planet of planets) expect(counts?.has(planet)).toBe(true);
  });

  it("reaches worlds outside the junction chain", () => {
    const counts = nodeCountsByPlace(cy);
    expect(counts?.get("Lua")?.total).toBeGreaterThan(0);
    expect(counts?.get("Void")?.total).toBeGreaterThan(0);
  });

  it("never reports more run than exist, nor more Steel Path than run", () => {
    const counts = nodeCountsByPlace(cy);
    if (!counts) throw new Error("unreadable");
    for (const entry of counts.values()) {
      expect(entry.done).toBeLessThanOrEqual(entry.total);
      expect(entry.steelPath).toBeLessThanOrEqual(entry.total);
    }
  });

  it("a world the catalog knows no nodes for is absent, not empty", () => {
    const counts = nodeCountsByPlace(cy);
    expect(counts?.get("Höllvania")).toBeUndefined();
  });
});
