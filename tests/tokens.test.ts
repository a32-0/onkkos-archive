import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const TOKENS = "src/ui/tokens.css";
const TYPE = "src/ui/type.module.css";

const UNAPPLIED = [
  "--black",
  "--night-800",
  "--night-700",
  "--night-600",
  "--night-500",
  "--night-band",
  "--night-card",
  "--ash-300",
  "--slate-400",
  "--bronze-600",
  "--red-100",
  "--canvas",
  "--surface-header",
  "--surface",
  "--surface-sunken",
  "--surface-raised",
  "--surface-raised-strong",
  "--surface-band",
  "--surface-card",
  "--scrim",
  "--ink-muted",
  "--line",
  "--line-subtle",
  "--timeline",
  "--danger",
  "--danger-ink",
  "--state-mastered-tint",
  "--state-rank-tint",
  "--state-absent",
  "--state-prime",
  "--art-done",
  "--radius-s",
  "--radius-full",
  "--space-2",
  "--space-3",
  "--gutter",
  ".place",
  ".numeral",
  ".title",
  ".display-name",
  ".heading",
  ".name",
  ".name-caps",
  ".name-s",
  ".figure",
  ".figure-caption",
  ".body-l",
  ".body-s",
  ".label-s",
  ".label-s-upper",
  ".kicker",
  ".eyebrow",
  ".eyebrow-s",
  ".quiet",
  ".quiet-upper",
  ".reading",
  ".reading-l",
  ".mono",
  ".mono-label",
  ".mono-strong",
];

function files(dir: string, suffix: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(path.join(root, dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(path.join(root, rel)).isDirectory()) out.push(...files(rel, suffix));
    else if (rel.endsWith(suffix)) out.push(rel);
  }
  return out;
}

const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

const tokensCss = read(TOKENS);
const typeCss = read(TYPE);
const modules = files("src", ".module.css").filter((rel) => rel !== TYPE);

const declared = [...tokensCss.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gm)].map(
  ([, name, value]) => ({ name: name!, value: value! }),
);
const SHAPE = /^--(radius|space|border|blur|gutter)/;
const primitives = declared
  .filter(({ name, value }) => !SHAPE.test(name) && !value.includes("var("))
  .map(({ name }) => name);
const typeClasses = [...typeCss.matchAll(/^\.([a-z0-9-]+)\s*\{/gm)].map(([, name]) => `.${name}`);

const refs = (text: string) =>
  [...text.matchAll(/var\((--[a-z0-9-]+)\)/g)].map(([, name]) => name!);

const RAW = [
  { what: "a colour", pattern: /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/i },
  {
    what: "a length",
    pattern: /(?<![\w-])\d*\.?\d+(?:px|rem|em|ch|ex|vw|vh|vmin|vmax|dvh|svh|lvh|pt|cm|mm|in)\b/,
  },
  { what: "a percentage", pattern: /(?<![\w-])(?!100%)\d*\.?\d+%/ },
  { what: "a duration", pattern: /(?<![\w-])\d*\.?\d+m?s\b/ },
  {
    what: "an easing",
    pattern: /\b(?:cubic-bezier|steps)\(|\b(?:ease|ease-in|ease-out|ease-in-out|linear)(?![\w-])/,
  },
  { what: "a font", pattern: /\bfont(?:-family|-size|-weight)?\s*:/ },
];

function declarations(css: string): string[] {
  return [...css.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)]
    .filter(([, property]) => !property!.startsWith("--") && property !== "composes")
    .map(([whole]) => whole.replace(/var\([^)]*\)/g, "var()"));
}

describe("no raw value outside the token layer", () => {
  it("keeps colours, lengths, radii, durations, easings and fonts out of every module", () => {
    const found = modules.flatMap((rel) =>
      declarations(read(rel)).flatMap((line) =>
        RAW.filter(({ pattern }) => pattern.test(line)).map(
          ({ what }) => `${rel}: ${what} in "${line}"`,
        ),
      ),
    );
    expect(found).toEqual([]);
  });

  it("lets a module reach a primitive only through its role", () => {
    const found = modules.flatMap((rel) =>
      refs(read(rel))
        .filter((name) => primitives.includes(name))
        .map((name) => `${rel}: ${name}`),
    );
    expect(found).toEqual([]);
  });
});

describe("no token that nothing applies", () => {
  const moduleText = modules.map(read).join("\n");
  const composed = new Set(
    [
      ...moduleText.matchAll(
        /composes:\s*([a-z0-9\s-]+?)\s+from\s+["'][^"']*type\.module\.css["']/g,
      ),
    ].flatMap(([, names]) =>
      names!
        .trim()
        .split(/\s+/)
        .map((name) => `.${name}`),
    ),
  );

  const applied = new Set(refs(moduleText));
  let grew = true;
  while (grew) {
    grew = false;
    for (const { name, value } of declared) {
      if (!applied.has(name)) continue;
      for (const ref of refs(value)) {
        if (!applied.has(ref)) {
          applied.add(ref);
          grew = true;
        }
      }
    }
  }

  const everything = [...declared.map(({ name }) => name), ...typeClasses];
  const isApplied = (token: string) =>
    token.startsWith(".") ? composed.has(token) : applied.has(token);

  it("applies every token not on the allowance list", () => {
    const unapplied = everything.filter((token) => !isApplied(token) && !UNAPPLIED.includes(token));
    expect(unapplied).toEqual([]);
  });

  it("lists only tokens that exist and are still unapplied", () => {
    const stale = UNAPPLIED.filter((token) => !everything.includes(token) || isApplied(token));
    expect(stale).toEqual([]);
  });
});
