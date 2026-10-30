import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { z } from "zod";

import type { DropSource } from "@/domain/catalog/data";
import type { Quest } from "@/domain/narrative/schema";

const ART = z.object({ art: z.record(z.string(), z.string()) });

const cached = new Map<string, Record<string, string>>();

function wikiArt(file: string): Record<string, string> {
  let art = cached.get(file);
  if (!art) {
    art = ART.parse(
      JSON.parse(readFileSync(path.join(process.cwd(), "data", "vendor", file), "utf8")),
    ).art;
    cached.set(file, art);
  }
  return art;
}

export function updateArt(): Record<string, string> {
  return wikiArt("update-art.json");
}

export function vendorArt(): Record<string, string> {
  return wikiArt("vendor-art.json");
}

const SOURCES = z.object({
  sources: z.record(
    z.string(),
    z.object({ kind: z.enum(["enemy", "activity", "object"]), art: z.string().nullable() }),
  ),
});

let sources: Record<string, DropSource> | undefined;

export function dropSources(): Record<string, DropSource> {
  sources ??= SOURCES.parse(
    JSON.parse(
      readFileSync(path.join(process.cwd(), "data", "vendor", "drop-sources.json"), "utf8"),
    ),
  ).sources;
  return sources;
}

export function questArt(quest: Pick<Quest, "name" | "wikiTitle">): string | null {
  const art = updateArt();
  return art[quest.name] ?? (quest.wikiTitle === null ? null : art[quest.wikiTitle]) ?? null;
}
