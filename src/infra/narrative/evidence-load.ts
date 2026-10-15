import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { parse as parseYaml } from "yaml";

import { normalizeEvidenceRules, type QuestEvidenceRules } from "@/domain/narrative/evidence";

let cached: QuestEvidenceRules | undefined;

export function loadEvidenceRules(): QuestEvidenceRules {
  if (!cached) {
    cached = normalizeEvidenceRules(
      parseYaml(readFileSync(path.join(process.cwd(), "data", "quest_evidence.yaml"), "utf8")),
    );
  }
  return cached;
}
