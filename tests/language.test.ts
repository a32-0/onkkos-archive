import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const css = readFileSync(path.join(process.cwd(), "src/ui/type.module.css"), "utf8");

function face(className: string): string {
  const rule = new RegExp(`^\\.${className} \\{[^}]*\\}`, "m").exec(css)?.[0] ?? "";
  return /font-family:\s*var\((--font-[a-z-]+)\)/.exec(rule)?.[1] ?? "";
}

describe("the serif carries names, the mono carries readings", () => {
  const NAMES = ["place", "title", "display-name", "heading", "name", "name-caps", "name-s"];
  const READINGS = ["reading", "reading-l"];

  it("sets every name in the display face", () => {
    const missing = NAMES.filter((name) => face(name) !== "--font-cinzel");
    expect(missing).toEqual([]);
  });

  it("sets every reading in the mono face", () => {
    const missing = READINGS.filter((name) => face(name) !== "--font-jetbrains-mono");
    expect(missing).toEqual([]);
  });
});
