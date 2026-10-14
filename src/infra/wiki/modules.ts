import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { normalizeWiki, WIKI_FILES, type Wiki } from "@/domain/catalog/wiki";
import { loadResearch } from "@/infra/place/load";

let cached: Wiki | undefined;

function readVendor(file: string): unknown {
  return JSON.parse(readFileSync(path.join(process.cwd(), "data", "vendor", file), "utf8"));
}

export function wikiModules(): Wiki {
  cached ??= normalizeWiki(
    {
      blueprints: readVendor(WIKI_FILES.blueprints),
      nodes: readVendor(WIKI_FILES.nodes),
      resources: readVendor(WIKI_FILES.resources),
      vendors: readVendor(WIKI_FILES.vendors),
      traits: readVendor(WIKI_FILES.traits),
      baro: readVendor(WIKI_FILES.baro),
      adversaries: readVendor(WIKI_FILES.adversaries),
      companions: readVendor(WIKI_FILES.companions),
      honorias: readVendor(WIKI_FILES.honorias),
      titles: readVendor(WIKI_FILES.titles),
      relics: readVendor(WIKI_FILES.relics),
      circuit: readVendor(WIKI_FILES.circuit),
      incarnons: readVendor(WIKI_FILES.incarnons),
      honoriaTags: readVendor(WIKI_FILES.honoriaTags),
    },
    loadResearch(),
  );
  return cached;
}
