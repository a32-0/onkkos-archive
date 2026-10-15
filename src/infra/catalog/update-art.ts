import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { z } from "zod";

let cached: Record<string, string> | undefined;

export function updateArt(): Record<string, string> {
  cached ??= z
    .object({ art: z.record(z.string(), z.string()) })
    .parse(
      JSON.parse(
        readFileSync(path.join(process.cwd(), "data", "vendor", "update-art.json"), "utf8"),
      ),
    ).art;
  return cached;
}
