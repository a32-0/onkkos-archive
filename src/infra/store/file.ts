import "server-only";

import { readFileSync, renameSync, writeFileSync } from "node:fs";

import { mapStore, type Entry } from "./memory";
import type { Store } from "./store";

function isEntry(value: unknown): value is Entry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Partial<Entry>;
  return typeof entry.value === "string" && typeof entry.expiresAt === "number";
}

function unexpired(entries: Iterable<[string, unknown]>, now: number): [string, Entry][] {
  const kept: [string, Entry][] = [];
  for (const [key, entry] of entries) {
    if (isEntry(entry) && entry.expiresAt > now) kept.push([key, entry]);
  }
  return kept;
}

function load(file: string): Map<string, Entry> {
  try {
    const saved = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
    return new Map(unexpired(Object.entries(saved), Date.now()));
  } catch {
    return new Map();
  }
}

function save(file: string, entries: Map<string, Entry>): void {
  const temporary = `${file}.tmp`;
  writeFileSync(temporary, JSON.stringify(Object.fromEntries(unexpired(entries, Date.now()))));
  renameSync(temporary, file);
}

export function fileStore(file: string): Store {
  const entries = load(file);
  return mapStore(
    () => entries,
    () => save(file, entries),
  );
}
