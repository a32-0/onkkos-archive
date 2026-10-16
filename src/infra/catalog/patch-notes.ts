import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { z } from "zod";

import type { PatchNote } from "@/domain/catalog/updates";

let cached: PatchNote[] | undefined;

const note = z.object({
  version: z.string().regex(/^\d+(\.\d+)?$/),
  name: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  art: z.string().url().nullable(),
  url: z.string().url().nullable(),
});

export function patchNotes(): PatchNote[] {
  cached ??= z
    .object({ updates: z.array(note) })
    .parse(
      JSON.parse(
        readFileSync(path.join(process.cwd(), "data", "vendor", "patch-notes.json"), "utf8"),
      ),
    ).updates;
  return cached;
}
