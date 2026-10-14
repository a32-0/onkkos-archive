import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { parse as parseYaml } from "yaml";

import { normalizeGraph, type Graph } from "@/domain/graph/schema";

let cached: Graph | undefined;

export function loadGraph(): Graph {
  if (!cached) {
    cached = normalizeGraph(
      parseYaml(readFileSync(path.join(process.cwd(), "data", "grafo.yaml"), "utf8")),
    );
  }
  return cached;
}
