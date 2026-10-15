import { oneIn } from "@/domain/catalog/odds";
import type { PlaceItem } from "@/domain/place/build";
import type { AcquisitionVerb } from "@/domain/place/schema";

interface TileReading {
  verb: AcquisitionVerb;
  runs: number | null;
  rotation: string | null;
  node: string | null;
  mission: string | null;
  routes: number;
  from: string | null;
}

export function tileFor(item: PlaceItem): TileReading {
  const best = item.routes[0];
  return {
    verb: item.verb,
    runs: oneIn(best?.chance ?? null),
    rotation: best?.rotation ?? null,
    node: best?.node ?? null,
    mission: best?.mission ?? null,
    routes: item.routes.length,
    from: best ? null : item.from,
  };
}
