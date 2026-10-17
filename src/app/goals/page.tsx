import { chromeOf } from "@/app/chrome";
import { requireScreen, startHereOf } from "@/app/screen";
import { lackingNecramechs } from "@/domain/catalog/necramechs";
import { bestPlaces } from "@/domain/catalog/whats-new";
import type { GraphGoal } from "@/domain/graph/schema";
import { findNextPlanet, junctionOf } from "@/domain/graph/star-chart";
import { goalAtPlace, goalsProvenDone, suggestedGoals } from "@/domain/graph/suggest";
import { itemGaps, readReach } from "@/domain/place/reach";
import { startHere } from "@/domain/place/start-here";
import { itemRanks } from "@/domain/place/state";
import { catalogData } from "@/infra/catalog/data";
import { loadSystems, placeCatalog, placeIndex } from "@/infra/place/load";
import type { Screen } from "@/infra/screen";
import { itemRoute, placeRoute } from "@/routes";
import { Goals } from "@/screens/goals/Goals";
import type { GoalInput } from "@/screens/goals/state";
import { goalCards } from "@/screens/goals/view";

const NECRAMECH = "build_necramech";
const FROM = "goal";

function goalsOf(screen: Screen): GoalInput[] {
  const { graph, profile } = screen;
  const index = placeIndex();
  const { systems } = loadSystems();
  const reach = readReach(graph, profile);
  const frontier = findNextPlanet(graph, profile).entry;
  const junction = frontier?.junctionTag ? junctionOf(frontier.junctionTag) : null;
  const best = bestPlaces(index);
  const mech = lackingNecramechs(catalogData().arsenal, profile)[0] ?? null;

  const hidden = goalsProvenDone(graph, profile, screen.confirmedQuests);
  hidden.delete(NECRAMECH);
  const mechGoal = graph.goals[NECRAMECH];
  const mechBeyond =
    mech !== null &&
    itemGaps(reach, {
      masteryReq: mech.masteryReq,
      place: best.get(mech.name) ?? mechGoal?.place ?? null,
    }).length > 0;
  if (mech === null || mechBeyond) hidden.add(NECRAMECH);

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

  return suggestedGoals(graph, screen.display.masteryRank, hidden, first).flatMap((id) => {
    const goal = graph.goals[id];
    const input = goal ? inputOf(goal) : null;
    return input ? [input] : [];
  });
}

export default async function GoalsPage() {
  const screen = await requireScreen();
  return (
    <Goals
      chrome={await chromeOf(screen)}
      cards={goalCards(goalsOf(screen))}
      skip={startHereOf(screen)}
    />
  );
}
