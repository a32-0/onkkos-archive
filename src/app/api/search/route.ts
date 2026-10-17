import { NextResponse, type NextRequest } from "next/server";

import type { CATALOGUES } from "@/content/goals";
import { searchCatalog } from "@/domain/catalog/search";
import { bestPlaces } from "@/domain/catalog/whats-new";
import { itemGaps, placeGap, readReach } from "@/domain/place/reach";
import { catalogData } from "@/infra/catalog/data";
import { loadSystems, placeCatalog, placeIndex } from "@/infra/place/load";
import { readScreen } from "@/infra/screen";
import type { SearchInput } from "@/screens/goals/state";
import { suggestionRows } from "@/screens/goals/view";

const PRIVATE = { "cache-control": "private, no-store" };

type Catalogue = keyof typeof CATALOGUES;

const BY_KIND: Readonly<Record<string, Catalogue>> = {
  Warframes: "warframes",
  Primary: "primary",
  Secondary: "secondary",
  Melee: "melee",
  Archwing: "archwing",
  Companions: "companion",
  Necramech: "necramech",
};

export async function GET(request: NextRequest) {
  const read = await readScreen();
  if (read.state !== "ok") {
    return NextResponse.json({ results: [] }, { status: 401, headers: PRIVATE });
  }

  const { graph, profile } = read.screen;
  const term = request.nextUrl.searchParams.get("q") ?? "";
  const data = catalogData();
  const index = placeIndex();
  const reach = readReach(graph, profile);
  const best = bestPlaces(index);
  const groups = placeCatalog().entries;
  const { systems } = loadSystems();
  const masteryReq = new Map(data.arsenal.map((item) => [item.name, item.masteryReq]));

  const hits: SearchInput[] = searchCatalog(data, index, term).map((hit) => {
    if (hit.kind === "place") {
      return {
        kind: "place",
        name: hit.name,
        catalogue: "place",
        art: null,
        system: systems.find((system) => system.places.includes(hit.name))?.id ?? null,
        gap: placeGap(reach, hit.name),
      };
    }
    const catalogue: Catalogue =
      hit.kind === "item"
        ? (groups.get(hit.name)?.group ?? BY_KIND[hit.type ?? ""] ?? "other")
        : (hit.family ?? (hit.group === "arsenal" || hit.group === "places" ? "other" : hit.group));
    const gaps = itemGaps(reach, {
      masteryReq: masteryReq.get(hit.name) ?? 0,
      place: best.get(hit.name) ?? null,
    });
    return {
      kind: hit.kind,
      name: hit.name,
      catalogue,
      art: hit.imageUrl,
      system: null,
      gap: gaps[0] ?? null,
    };
  });

  return NextResponse.json({ results: suggestionRows(hits) }, { headers: PRIVATE });
}
