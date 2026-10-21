import { sameName, type Wiki } from "@/domain/catalog/wiki";
import type { CatalogEntry } from "@/domain/place/catalog";
import type { AcquisitionVerb, CuratedAcquisition } from "@/domain/place/schema";

const CIRCUIT = "The Circuit";

type HubSources = Pick<Wiki, "incarnons" | "honorias" | "honoriaTags" | "vendors">;

interface HubSource {
  hub: string;
  verb: AcquisitionVerb;
}

function sourceOf(entry: CatalogEntry, wiki: HubSources): HubSource | null {
  if (entry.group === "incarnons") {
    return wiki.incarnons.has(entry.name) ? { hub: CIRCUIT, verb: "drop" } : null;
  }
  if (entry.group === "honoria") {
    const tags = wiki.honorias.get(entry.name)?.tags ?? [];
    const place = tags.map((tag) => wiki.honoriaTags.get(tag)?.place).find(Boolean);
    return place ? { hub: place, verb: "vendor" } : null;
  }
  if (entry.group === "ephemera") {
    const seller = wiki.vendors.find((vendor) =>
      vendor.offers.some((offer) => sameName(offer.item, entry.name)),
    );
    return seller ? { hub: seller.name, verb: "vendor" } : null;
  }
  return null;
}

export function hubAcquisition(
  entries: ReadonlyMap<string, CatalogEntry>,
  wiki: HubSources,
  hubs: Readonly<Record<string, string>>,
): CuratedAcquisition[] {
  const rows: CuratedAcquisition[] = [];
  for (const entry of entries.values()) {
    const source = sourceOf(entry, wiki);
    const place = source ? hubs[source.hub] : undefined;
    if (!source || !place) continue;
    rows.push({ item: entry.name, place, verb: source.verb, from: source.hub, verify: false });
  }
  return rows;
}
