import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { parse as parseYaml } from "yaml";

import { normalizeSpine, type NarrativeSpine } from "@/domain/narrative/schema";

let cached: NarrativeSpine | undefined;

export function loadSpine(): NarrativeSpine {
  if (!cached) {
    cached = normalizeSpine(
      parseYaml(readFileSync(path.join(process.cwd(), "data", "narrative_spine.yaml"), "utf8")),
    );
  }
  return cached;
}
