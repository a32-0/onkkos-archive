import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { parse as parseYaml } from "yaml";

import {
  canonicalMod,
  modFacts,
  normalizeModStats,
  type ModStats,
} from "@/domain/catalog/mod-effects";

import { readItems } from "./items";

interface RawMod {
  name: string;
  uniqueName: string;
  baseDrain?: number;
  fusionLimit?: number;
  polarity?: string;
  maxStats?: string[];
}

let cached: ModStats | undefined;
let mods: RawMod[] | undefined;

export function loadModStats(): ModStats {
  cached ??= normalizeModStats(
    parseYaml(readFileSync(path.join(process.cwd(), "data", "mod_stats.yaml"), "utf8")),
  );
  return cached;
}

export function modEntry(name: string): (RawMod & { facts: ReturnType<typeof modFacts> }) | null {
  mods ??= readItems<RawMod>(["Mods"]);
  const entry = canonicalMod(mods, name);
  return entry ? { ...entry, facts: modFacts(entry) } : null;
}
