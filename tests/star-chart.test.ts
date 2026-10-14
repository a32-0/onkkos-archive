import { describe, expect, it } from "vitest";

import {
  asksWhenLastPlayed,
  findFocus,
  findNextPlanet,
  junctionOf,
  missionTags,
  reachedPlaces,
  starChartProgress,
  type PlaceShare,
} from "@/domain/graph/star-chart";
import type { RawProfile } from "@/domain/types/profile";

import { fixture, NEW_PLAYER, testGraph, VETERAN } from "./helpers";

const graph = testGraph();
const veteran = fixture(VETERAN);
const newPlayer = fixture(NEW_PLAYER);

function withJunctions(...tags: string[]): RawProfile {
  return { Missions: tags.map((Tag) => ({ Tag, Completes: 1 })) };
}

describe("missionTags", () => {
  it("returns an empty set when the profile has no Missions", () => {
    expect(missionTags({}).size).toBe(0);
  });

  it("indexes every tag of the real profile", () => {
    const tags = missionTags(veteran);
    expect(tags.has("EarthToVenusJunction")).toBe(true);
    expect(tags.has("DeimosHub")).toBe(true);
  });
});

describe("findNextPlanet", () => {
  it("returns null once every junction is there", () => {
    const all = withJunctions(
      ...graph.starChartOrder.map((e) => e.junctionTag).filter((t): t is string => t !== null),
    );
    expect(findNextPlanet(graph, all).entry).toBeNull();
  });

  it("the real veteran profile has the whole star chart", () => {
    expect(findNextPlanet(graph, veteran).entry).toBeNull();
  });

  it("never proposes Earth as the next step", () => {
    expect(findNextPlanet(graph, newPlayer).entry?.planet).not.toBe("Earth");
    expect(findNextPlanet(graph, withJunctions()).entry?.planet).not.toBe("Earth");
  });

  it("a player without junctions gets Venus, not Mercury", () => {
    expect(findNextPlanet(graph, withJunctions()).entry?.planet).toBe("Venus");
    expect(findNextPlanet(graph, newPlayer).entry?.planet).toBe("Venus");
  });

  it("counts Earth as unlocked from the start", () => {
    expect(findNextPlanet(graph, withJunctions()).unlocked).toContain("Earth");
  });

  it("every junction_tag names a planet earlier in the list", () => {
    const index = new Map(graph.starChartOrder.map((e, i) => [e.planet, i]));
    for (const [i, entry] of graph.starChartOrder.entries()) {
      if (!entry.junctionTag) continue;
      const from = /^(.+?)To/.exec(entry.junctionTag)?.[1];
      expect(index.get(from ?? "")).toBeLessThan(i);
    }
  });

  it("separates unlocked planets from completed junctions", () => {
    const none = findNextPlanet(graph, withJunctions());
    expect(none.unlocked).toEqual(["Earth"]);
    expect(none.junctionsCompleted).toBe(0);
    expect(none.junctionsTotal).toBe(13);

    const complete = findNextPlanet(graph, veteran);
    expect(complete.unlocked).toHaveLength(14);
    expect(complete.junctionsCompleted).toBe(13);
  });
});

describe("starChartProgress", () => {
  it("marks Earth as the start and the first pending planet as next", () => {
    const rail = starChartProgress(graph, newPlayer);
    expect(rail[0]).toMatchObject({ planet: "Earth", status: "start" });
    expect(rail[1]).toMatchObject({ planet: "Venus", status: "next" });
    expect(rail[2]?.status).toBe("ahead");
  });

  it("marks everything as done for the veteran profile", () => {
    const rail = starChartProgress(graph, veteran);
    expect(rail.filter((e) => e.status === "ahead")).toHaveLength(0);
    expect(rail.filter((e) => e.status === "done")).toHaveLength(13);
  });
});

describe("junctionOf", () => {
  it("reads the two planets a junction joins", () => {
    expect(junctionOf("EarthToVenusJunction")).toEqual({ from: "Earth", to: "Venus" });
  });

  it("reads nothing rather than leak a tag it cannot read", () => {
    expect(junctionOf("DeimosHub")).toBeNull();
  });
});

describe("reachedPlaces", () => {
  it("reaches the planets behind the player and the frontier (BR-59)", () => {
    expect([...reachedPlaces(graph, newPlayer)]).toEqual(["Earth", "Venus"]);
  });

  it("reaches the whole chart once there is no frontier", () => {
    expect(reachedPlaces(graph, veteran).size).toBe(graph.starChartOrder.length);
  });
});

const SYSTEMS = ["Origin", "Pom-2 PC", "Duviri", "Empyrean Proxima", "Dark Refractory", "Tau"];

const share = (
  place: string,
  mastered: number,
  readable: number,
  system = "Origin",
): PlaceShare => ({
  place,
  system,
  mastered,
  readable,
});

describe("findFocus", () => {
  it("picks the place with the highest share mastered, short of all of them", () => {
    const shares = [share("Earth", 9, 10), share("Mars", 19, 20), share("Venus", 10, 10)];
    expect(findFocus(graph, shares, SYSTEMS)).toBe("Mars");
  });

  it("compares shares exactly, so a third and two sixths tie", () => {
    const shares = [share("Mars", 2, 6), share("Earth", 1, 3)];
    expect(findFocus(graph, shares, SYSTEMS)).toBe("Earth");
  });

  it("breaks a tie by the systems' order (BR-47) before the chart", () => {
    const shares = [share("Duviri", 1, 2, "Duviri"), share("Sedna", 1, 2)];
    expect(findFocus(graph, shares, SYSTEMS)).toBe("Sedna");
  });

  it("then by star_chart_order, a place off the chart just after its planet", () => {
    expect(findFocus(graph, [share("Mars", 1, 2), share("Venus", 1, 2)], SYSTEMS)).toBe("Venus");
    expect(findFocus(graph, [share("Deimos", 1, 2), share("Mars", 1, 2)], SYSTEMS)).toBe("Mars");
    expect(findFocus(graph, [share("Phobos", 1, 2), share("Deimos", 1, 2)], SYSTEMS)).toBe(
      "Deimos",
    );
  });

  it("leaves out a place with nothing readable", () => {
    expect(findFocus(graph, [share("Earth", 0, 0), share("Mars", 1, 4)], SYSTEMS)).toBe("Mars");
  });

  it("has no focus when everything readable is mastered", () => {
    const shares = [share("Earth", 10, 10), share("Mars", 20, 20), share("Lua", 0, 0)];
    expect(findFocus(graph, shares, SYSTEMS)).toBeNull();
  });
});

describe("asksWhenLastPlayed", () => {
  it("asks once the second planet is reached", () => {
    expect(asksWhenLastPlayed(graph, withJunctions("EarthToVenusJunction"))).toBe(true);
    expect(asksWhenLastPlayed(graph, veteran)).toBe(true);
  });

  it("does not ask a player still short of the second planet", () => {
    expect(asksWhenLastPlayed(graph, withJunctions())).toBe(false);
    expect(asksWhenLastPlayed(graph, withJunctions("EarthToMarsJunction"))).toBe(false);
  });

  it("asks when the profile carries no missions to read", () => {
    expect(asksWhenLastPlayed(graph, {})).toBe(true);
  });
});
