import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { VOICE } from "@/content/voice";

const css = readFileSync(path.join(process.cwd(), "src/ui/type.module.css"), "utf8");

function face(className: string): string {
  const rule = new RegExp(`^\\.${className} \\{[^}]*\\}`, "m").exec(css)?.[0] ?? "";
  return /font-family:\s*var\((--font-[a-z-]+)\)/.exec(rule)?.[1] ?? "";
}

describe("the four states keep their vocabulary", () => {
  const badge = readFileSync(path.join(process.cwd(), "src/ui/Badge/Badge.tsx"), "utf8");
  const kinds = /type BadgeKind = ([^;]+);/.exec(badge)?.[1] ?? "";

  it("gives mastered and rank the only two state badges", () => {
    expect(kinds).toContain(`"mastered"`);
    expect(kinds).toContain(`"rank"`);
  });

  it("has no badge for not obtained or unknown", () => {
    expect(kinds).not.toMatch(/absent|unknown|obtained/);
  });
});

describe("the serif carries names, the mono carries readings", () => {
  const NAMES = ["place", "title", "heading", "name", "name-s"];
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

describe("Onkko speaks on every screen", () => {
  const root = path.join(process.cwd(), "src/screens");
  const screens = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "shell")
    .map((entry) => entry.name);

  const source = (screen: string) =>
    readdirSync(path.join(root, screen), { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => readFileSync(path.join(root, screen, file), "utf8"))
      .join("\n");

  it("finds the screens beside the shell", () => {
    expect(readdirSync(root)).toContain("shell");
  });

  it.each(screens)("gives %s a line from voice.ts", (screen) => {
    expect(source(screen)).toMatch(/<OnkkoLine[^>]*line=\{[^}]*VOICE\./);
  });

  it("keeps the shell silent, since the screen inside it speaks", () => {
    expect(source("shell")).not.toContain("OnkkoLine");
  });
});

describe("Onkko's lines are the specs' own", () => {
  const specs = readdirSync(path.join(process.cwd(), "docs", "specs"))
    .filter((file) => file.endsWith(".md"))
    .map((file) => readFileSync(path.join(process.cwd(), "docs", "specs", file), "utf8"))
    .join("\n")
    .replace(/\s+/g, " ");

  it.each(Object.entries(VOICE))("quotes %s as a spec writes it", (_key, line) => {
    const said = typeof line === "function" ? line("{name}") : line;
    expect(specs).toContain(said);
  });
});
