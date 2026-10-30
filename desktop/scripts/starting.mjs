import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { APP } from "../../src/content/app.ts";
import { DESKTOP } from "../../src/content/desktop.ts";

const root = path.resolve(import.meta.dirname, "..", "..");
const out = path.join(root, "desktop", "dist", "starting");
const chunks = path.join(root, ".next", "static", "chunks");

const tokens = readFileSync(path.join(root, "src", "ui", "tokens.css"), "utf8");
const card = path.join(root, "src", "ui", "LoadingCard");
const motion = readFileSync(path.join(card, "LoadingCard.module.css"), "utf8");
const stroke = /const STROKE = "([^"]+)"/.exec(
  readFileSync(path.join(card, "LoadingCard.tsx"), "utf8"),
)[1];
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

const opening = `<div class="overlay" role="status"><div class="card"><span class="stage" aria-hidden="true"><span class="pen">${quillSvg('class="quill"')}</span><svg class="stroke" viewBox="0 0 88 8" preserveAspectRatio="none" focusable="false"><path d="${stroke}" pathLength="1"/></svg></span><p class="line">${escape(DESKTOP.opening)}</p></div></div>`;
const failing = `<div class="overlay"><div class="failing" role="alert"><span class="still">${quillSvg('class="mark"')}</span><p class="reason">${DESKTOP.cantStart.map(escape).join("<br>")}</p><a class="restart" href="app:restart">${escape(DESKTOP.restart)}</a></div></div>`;

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
body { background: var(--canvas); color: var(--ink); }
${motion}
.failing { display: flex; flex-direction: column; align-items: center; gap: var(--space-6); }
.still { display: block; width: calc(var(--space-8) * 2); height: calc(var(--space-8) * 3); }
.mark { display: block; width: 100%; height: 100%; }
.reason { margin: 0; color: var(--danger-ink); font: 400 16px var(--font-jetbrains-mono), monospace; text-align: center; }
.restart { display: flex; align-self: stretch; align-items: center; justify-content: center; box-sizing: border-box; min-height: 45px; padding: var(--space-5); border: var(--border-1) solid var(--line-strong); border-radius: var(--radius-full); color: var(--ink); font: 700 16px var(--font-inter), sans-serif; text-decoration: none; }
.restart:hover { background-image: linear-gradient(var(--hover), var(--hover)); }
.restart:focus-visible { outline: var(--border-2) solid var(--focus); outline-offset: calc(var(--border-2) * -1); }
</style>
</head>
<body>
${state === "starting" ? opening : failing}
</body>
</html>
`;
writeFileSync(path.join(out, "starting.html"), page("starting"));
writeFileSync(path.join(out, "failed.html"), page("failed"));
copyFileSync(path.join(root, "desktop", "icon.png"), path.join(out, "..", "icon.png"));
writeFileSync(path.join(out, "..", "words.json"), JSON.stringify({ ready: DESKTOP.ready }));
