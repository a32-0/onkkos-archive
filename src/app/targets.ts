import type { CATALOGUES } from "@/content/goals";
import { browseCatalog, searchCatalog } from "@/domain/catalog/search";
import { bestPlaces } from "@/domain/catalog/whats-new";
import { itemGaps, placeGap, readReach } from "@/domain/place/reach";
import { itemRanks, stateByName } from "@/domain/place/state";
import { catalogData } from "@/infra/catalog/data";
import { questArt } from "@/infra/catalog/update-art";
import { loadSystems, placeCatalog, placeIndex } from "@/infra/place/load";
import type { Screen } from "@/infra/screen";
import type { SearchInput, Standing } from "@/screens/goals/state";

type Catalogue = keyof typeof CATALOGUES;

const MIN_TERM = 2;

const BY_KIND: Readonly<Record<string, Catalogue>> = {
  Warframes: "warframes",
  Primary: "primary",
  Secondary: "secondary",
  Melee: "melee",
  Archwing: "archwing",
  Companions: "companion",
  Necramech: "necramech",
};

const STANDING: Readonly<Record<string, Standing>> = {
  absent: "absent",
  ranked: "ranked",
  done: "done",
};

export function targetInputs(
  screen: Pick<Screen, "graph" | "profile">,
  term: string,
): SearchInput[] {
  const { graph, profile } = screen;
  const data = catalogData();
  const index = placeIndex();
  const reach = readReach(graph, profile);
  const best = bestPlaces(index);
  const entries = placeCatalog().entries;
  const ranks = itemRanks(profile, entries);
  const { systems, colors } = loadSystems();
  const quests = data.spine.arcs.flatMap((arc) => arc.quests);
  const masteryReq = new Map(data.arsenal.map((item) => [item.name, item.masteryReq]));
  const hits =
    term.trim().length >= MIN_TERM ? searchCatalog(data, index, term) : browseCatalog(data, index);

  return hits.map((hit) => {
    const common = { score: hit.score, vaulted: hit.vaulted };
    if (hit.kind === "quest") {
      const quest = quests.find((one) => one.name === hit.name);
      return {
        ...common,
        kind: "quest",
        name: hit.name,
        catalogue: "quest",
        art: quest ? questArt(quest) : null,
        system: null,
        gap: null,
        standing: null,
      };
    }
    if (hit.kind === "place") {
      return {
        ...common,
        kind: "place",
        name: hit.name,
        catalogue: "place",
        art: null,
        orb: colors[hit.name] ?? null,
        system: systems.find((system) => system.places.includes(hit.name))?.id ?? null,
        gap: placeGap(reach, hit.name),
        standing: null,
      };
    }
    const catalogue: Catalogue =
      hit.kind === "item"
        ? (entries.get(hit.name)?.group ?? BY_KIND[hit.type ?? ""] ?? "other")
        : (hit.family ??
          (hit.group === "arsenal" || hit.group === "places" || hit.group === "quests"
            ? "other"
            : hit.group));
    const gaps = itemGaps(reach, {
      masteryReq: masteryReq.get(hit.name) ?? 0,
      place: best.get(hit.name) ?? null,
    });
    return {
      ...common,
      kind: hit.kind,
      name: hit.name,
      catalogue,
      art: hit.imageUrl,
      system: null,
      gap: gaps[0] ?? null,
      standing: STANDING[stateByName(hit.name, ranks, entries).kind] ?? null,
    };
  });
}
