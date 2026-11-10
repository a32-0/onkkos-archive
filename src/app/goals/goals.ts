import "server-only";

import { lackingNamed } from "@/domain/catalog/lacking";
import { lackingNecramechs } from "@/domain/catalog/necramechs";
import { bestPlaces } from "@/domain/catalog/whats-new";
import type { GraphGoal } from "@/domain/graph/schema";
import { findNextPlanet, junctionOf } from "@/domain/graph/star-chart";
import { goalAtPlace, goalsProvenDone, goalsWaiting, suggestedGoals } from "@/domain/graph/suggest";
import { itemGaps, readReach } from "@/domain/place/reach";
import { startHere } from "@/domain/place/start-here";
import { itemRanks } from "@/domain/place/state";
import { catalogData } from "@/infra/catalog/data";
import { loadSystems, placeCatalog, placeIndex } from "@/infra/place/load";
import type { Screen } from "@/infra/screen";
import { itemRoute, placeRoute, ROUTES } from "@/routes";
import type { GoalInput } from "@/screens/goals/state";

const NECRAMECH = "build_necramech";
const FROM = "goal";

export interface GoalState {
  open: GoalInput[];
  done: GoalInput[];
}

export function goalState(screen: Screen): GoalState {
  const { graph, profile } = screen;
  const index = placeIndex();
  const { systems } = loadSystems();
  const reach = readReach(graph, profile);
  const frontier = findNextPlanet(graph, profile).entry;
  const junction = frontier?.junctionTag ? junctionOf(frontier.junctionTag) : null;
  const best = bestPlaces(index);
  const data = catalogData();
  const mechs = lackingNecramechs(data.arsenal, profile);
  const mech = mechs[0] ?? null;
  const ownsMech = mechs.length < data.arsenal.filter((item) => item.kind === "Necramech").length;

  const done = goalsProvenDone(graph, profile, screen.confirmedQuests);
  done.delete(NECRAMECH);
  if (ownsMech) done.add(NECRAMECH);
  const hidden = new Set([...done, ...goalsWaiting(graph, profile, screen.confirmedQuests, done)]);
  const mechGoal = graph.goals[NECRAMECH];
  const mechBeyond =
    mech !== null &&
    itemGaps(reach, {
      masteryReq: mech.masteryReq,
      place: best.get(mech.name) ?? mechGoal?.place ?? null,
    }).length > 0;
  if (mech === null || mechBeyond) hidden.add(NECRAMECH);
  const lackingOf = (goal: GraphGoal) => lackingNamed(data.arsenal, profile, goal.lacking ?? "");
  for (const goal of Object.values(graph.goals)) {
    if (goal.lacking === undefined) continue;
    const { owned, lacking } = lackingOf(goal);
    if (owned.length > 0) done.add(goal.id);
    if (owned.length > 0 || lacking.length === 0) hidden.add(goal.id);
  }

  const start = startHere(
    graph,
    profile,
    systems,
    index,
    itemRanks(profile, placeCatalog().entries),
  );
  const first = goalAtPlace(graph, frontier?.planet ?? null, start?.place ?? null);
  const systemOf = (place: string) =>
    systems.find((system) => system.places.includes(place))?.id ?? null;

  const inputOf = (goal: GraphGoal): GoalInput | null => {
    if (goal.id === NECRAMECH && mech) {
      return {
        id: goal.id,
        kind: "necramech",
        href: itemRoute(mech.name, FROM, "steps"),
        junction: null,
      };
    }
    if (goal.lacking !== undefined) {
      const weapon = lackingOf(goal).lacking[0];
      if (!weapon) return null;
      return {
        id: goal.id,
        kind: "lich",
        href: itemRoute(weapon.name, FROM, "steps"),
        junction: null,
      };
    }
    if (goal.item !== undefined) {
      return {
        id: goal.id,
        kind: "item",
        href: itemRoute(goal.item, FROM, "steps"),
        junction: null,
      };
    }
    if (goal.mode !== undefined) {
      return {
        id: goal.id,
        kind: "mode",
        href: itemRoute(goal.mode, FROM, "steps"),
        junction: null,
      };
    }
    if (goal.quest) {
      return {
        id: goal.id,
        kind: "quest",
        href: itemRoute(goal.quest, FROM, "steps"),
        junction: null,
      };
    }
    const planet = frontier?.planet ?? null;
    const system = planet ? systemOf(planet) : null;
    if (!planet || !system) return null;
    return { id: goal.id, kind: "planet", href: placeRoute(system, planet), junction };
  };

  const doneOf = (goal: GraphGoal): GoalInput => {
    if (goal.id === NECRAMECH) {
      const owned = data.arsenal.find((item) => item.kind === "Necramech" && !mechs.includes(item));
      return {
        id: goal.id,
        kind: "necramech",
        href: owned ? itemRoute(owned.name, FROM) : ROUTES.system,
        junction: null,
      };
    }
    if (goal.lacking !== undefined) {
      const owned = lackingOf(goal).owned[0];
      return {
        id: goal.id,
        kind: "lich",
        href: owned ? itemRoute(owned.name, FROM) : ROUTES.system,
        junction: null,
      };
    }
    if (goal.mode !== undefined) {
      return {
        id: goal.id,
        kind: "mode",
        href: itemRoute(goal.mode, FROM, "steps"),
        junction: null,
      };
    }
    if (goal.quest) {
      return {
        id: goal.id,
        kind: "quest",
        href: itemRoute(goal.quest, FROM, "steps"),
        junction: null,
      };
    }
    if (goal.item !== undefined) {
      return {
        id: goal.id,
        kind: "item",
        href: itemRoute(goal.item, FROM, "steps"),
        junction: null,
      };
    }
    return { id: goal.id, kind: "planet", href: ROUTES.system, junction: null };
  };

  return {
    open: suggestedGoals(graph, screen.display.masteryRank, hidden, first).flatMap((id) => {
      const goal = graph.goals[id];
      const input = goal ? inputOf(goal) : null;
      return input ? [input] : [];
    }),
    done: Object.values(graph.goals)
      .filter((goal) => done.has(goal.id))
      .map(doneOf),
  };
}
