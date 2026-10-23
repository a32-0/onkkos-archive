import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { APP } from "../../src/content/app.ts";
import { DESKTOP } from "../../src/content/desktop.ts";
import { LETTERS } from "../../src/ui/Wordmark/letters.ts";

const root = path.resolve(import.meta.dirname, "..", "..");
const out = path.join(root, "desktop", "dist", "starting");
const chunks = path.join(root, ".next", "static", "chunks");

const tokens = readFileSync(path.join(root, "src", "ui", "tokens.css"), "utf8");
const quill = /d="([^"]+)"/
  .exec(readFileSync(path.join(root, "src", "ui", "Wordmark", "Quill.tsx"), "utf8"))[1]
  .replace(/\s+/g, " ");

const css = readdirSync(chunks)
  .filter((name) => name.endsWith(".css"))
  .map((name) => readFileSync(path.join(chunks, name), "utf8"))
  .find((text) => text.includes("@font-face"));
if (!css) throw new Error("The build holds no font faces");
const faces = css.match(/@font-face\{[^}]*\}/g) ?? [];
mkdirSync(path.join(out, "media"), { recursive: true });
for (const [, file] of faces.join("").matchAll(/url\(\.\.\/media\/([^)]+)\)/g)) {
  copyFileSync(path.join(root, ".next", "static", "media", file), path.join(out, "media", file));
}
const fontFaces = faces.join("\n").replaceAll("url(../media/", "url(media/");

const escape = (text) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const quillSvg = (attributes) =>
  `<svg ${attributes} viewBox="15 0 79 144" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${quill}" fill="var(--brand)"/></svg>`;

const opening = `<div class="card" role="status">${quillSvg("")}<p class="line">${escape(DESKTOP.opening)}</p></div>`;
const failing = `<div class="failing" role="alert"><p class="band">${escape(DESKTOP.cantStart)}</p><a class="close" href="app:close">${escape(DESKTOP.close)}</a></div>`;

const page = (state) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src 'self'; img-src 'self'">
<title>${escape(APP.name)}</title>
<style>
${fontFaces}
${tokens}
:root { --font-cinzel: "Cinzel", "Cinzel Fallback"; --font-inter: "Inter", "Inter Fallback"; --font-jetbrains-mono: "JetBrains Mono", "JetBrains Mono Fallback"; }
html, body { height: 100%; margin: 0; }
body { display: flex; flex-direction: column; background: var(--canvas); color: var(--ink); }
header { display: flex; justify-content: center; padding: var(--space-6); border-bottom: var(--border-1) solid var(--brand); background: var(--surface-header); }
header svg { display: block; height: 48px; width: auto; }
.letters { fill: var(--ink); }
main { display: flex; flex: 1; flex-direction: column; justify-content: center; gap: var(--space-6); padding: var(--space-6) var(--gutter); }
.card { display: flex; flex-direction: column; align-items: center; gap: var(--space-6); padding: var(--space-6); border-left: var(--border-1) solid var(--accent); border-radius: 0 var(--radius-m) var(--radius-m) 0; background: var(--surface-card); }
.card svg { display: block; width: var(--space-8); height: calc(var(--space-8) + var(--space-6)); }
.line { margin: 0; font: 700 24px var(--font-inter), sans-serif; text-align: center; }
.band { margin: 0; padding: var(--space-2); border-radius: var(--radius-m); background: var(--danger); color: var(--danger-ink); font: 400 14px var(--font-jetbrains-mono), monospace; }
.close { display: flex; align-items: center; justify-content: center; box-sizing: border-box; min-height: 45px; padding: var(--space-5); border: var(--border-1) solid var(--line-strong); border-radius: var(--radius-full); color: var(--ink); font: 700 16px var(--font-inter), sans-serif; text-decoration: none; }
.close:hover { background-image: linear-gradient(var(--hover), var(--hover)); }
.close:focus-visible { outline: var(--border-2) solid var(--focus); outline-offset: calc(var(--border-2) * -1); }
.failing { display: flex; flex-direction: column; gap: var(--space-6); }
</style>
</head>
<body>
<header>
<svg viewBox="0 0 275.333 80" role="img" aria-label="${escape(APP.name)}">${quillSvg('x="0" y="0" width="53.333" height="80"')}<g class="letters">${LETTERS.map((d) => `<path d="${d}"/>`).join("")}</g></svg>
</header>
<main>
${state === "starting" ? opening : failing}
</main>
</body>
</html>
`;
writeFileSync(path.join(out, "starting.html"), page("starting"));
writeFileSync(path.join(out, "failed.html"), page("failed"));
