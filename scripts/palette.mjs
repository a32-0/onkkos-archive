import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const say = (line) => process.stdout.write(`${line}\n`);

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSS = readFileSync(path.join(ROOT, "src", "ui", "tokens.css"), "utf8");

const TEXT_FLOOR = 4.5;
const NON_TEXT_FLOOR = 3;
const DICHROMAT_FLOOR = 28;

const STATE_FAMILY = [
  ["mastered", "--state-mastered"],
  ["rank", "--state-rank"],
  ["absent", "--state-absent"],
  ["prime", "--state-prime"],
];

const SEMANTIC = [
  ["ink", "--ink"],
  ["muted", "--ink-muted"],
  ["dim", "--ink-dim"],
  ["accent", "--accent"],
  ["link", "--link"],
  ["mastered", "--state-mastered"],
  ["rank", "--state-rank"],
  ["absent", "--state-absent"],
  ["danger ink", "--danger-ink"],
];

const BRAND_EXCLUSIVE = [
  ["accent", "--accent"],
  ["ink", "--ink"],
  ["muted", "--ink-muted"],
  ["dim", "--ink-dim"],
  ["link", "--link"],
  ["mastered", "--state-mastered"],
  ["rank", "--state-rank"],
  ["absent", "--state-absent"],
  ["timeline", "--timeline"],
];

const CONTRAST = [
  ["text on canvas", "--ink", "--canvas", TEXT_FLOOR],
  ["text on the header", "--ink", "--surface-header", TEXT_FLOOR],
  ["text on a card", "--ink", "--surface", TEXT_FLOOR],
  ["text on a value field", "--ink", "--surface-sunken", TEXT_FLOOR],
  ["text on a raised surface", "--ink", "--surface-raised", TEXT_FLOOR],
  ["text on the featured card", "--ink", "--surface-raised-strong", TEXT_FLOOR],
  ["text on a title band", "--ink", "--surface-band", TEXT_FLOOR],
  ["text on a choice card", "--ink", "--surface-card", TEXT_FLOOR],
  ["muted text on canvas", "--ink-muted", "--canvas", TEXT_FLOOR],
  ["muted text on a card", "--ink-muted", "--surface", TEXT_FLOOR],
  ["dim text on canvas", "--ink-dim", "--canvas", TEXT_FLOOR],
  ["dim text on a card", "--ink-dim", "--surface", TEXT_FLOOR],
  ["dim text on a value field", "--ink-dim", "--surface-sunken", TEXT_FLOOR],
  ["primary button label", "--ink-inverse", "--fill-strong", TEXT_FLOOR],
  ["accent on canvas", "--accent", "--canvas", TEXT_FLOOR],
  ["accent on a card", "--accent", "--surface", TEXT_FLOOR],
  ["link on canvas", "--link", "--canvas", TEXT_FLOOR],
  ["link on a card", "--link", "--surface", TEXT_FLOOR],
  ["Disconnect label on canvas", "--danger", "--canvas", TEXT_FLOOR],
  ["Disconnect outline on canvas", "--danger", "--canvas", NON_TEXT_FLOOR],
  ["place card system name on its band", "--ink-muted", "--surface-raised-strong", TEXT_FLOOR],
  ["error band text", "--danger-ink", "--danger", TEXT_FLOOR],
  ["mastered on its ground", "--state-mastered", "--state-mastered-ground", TEXT_FLOOR],
  ["rank on its ground", "--state-rank", "--state-rank-ground", TEXT_FLOOR],
  ["not obtained on a card", "--state-absent", "--surface", TEXT_FLOOR],
  ["brand mark on canvas", "--brand", "--canvas", NON_TEXT_FLOOR],
  ["header rule on the header", "--brand", "--surface-header", NON_TEXT_FLOOR],
  ["focus ring on canvas", "--focus", "--canvas", NON_TEXT_FLOOR],
  ["focus ring on a card", "--focus", "--surface", NON_TEXT_FLOOR],
  ["field outline on its ground", "--line-strong", "--surface-sunken", NON_TEXT_FLOOR],
  ["line on canvas", "--line", "--canvas", NON_TEXT_FLOOR],
  ["timeline on canvas", "--timeline", "--canvas", NON_TEXT_FLOOR],
];

const declared = new Map(
  [...CSS.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gm)].map(([, name, value]) => [
    name,
    value.trim(),
  ]),
);

function colour(name) {
  const value = declared.get(name);
  if (value === undefined) throw new Error(`token ${name} is not in tokens.css`);
  const alias = /^var\((--[a-z0-9-]+)\)$/.exec(value);
  if (alias) return colour(alias[1]);
  const mix = /^color-mix\(in srgb, var\((--[a-z0-9-]+)\) (\d+)%, transparent\)$/.exec(value);
  if (mix) {
    const base = colour(mix[1]);
    return { rgb: base.rgb, alpha: base.alpha * (Number(mix[2]) / 100) };
  }
  const hex = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(value);
  if (!hex) throw new Error(`token ${name} is not a colour this script reads: ${value}`);
  const rgb = [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16) / 255);
  return { rgb, alpha: hex[2] ? parseInt(hex[2], 16) / 255 : 1 };
}

const over = (top, ground) => top.rgb.map((c, i) => c * top.alpha + ground[i] * (1 - top.alpha));

const canvas = colour("--canvas").rgb;
const flat = (name) => over(colour(name), canvas);
const on = (fg, bg) => [over(colour(fg), flat(bg)), flat(bg)];

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const apply = (m, v) => m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);

const PROTAN = [
  [0.11238, 0.88762, 0],
  [0.11238, 0.88762, 0],
  [0.00401, -0.00401, 1],
];
const DEUTAN = [
  [0.29275, 0.70725, 0],
  [0.29275, 0.70725, 0],
  [-0.02234, 0.02234, 1],
];
const TRITAN = [
  [1, 0.1273, -0.1273],
  [0, 0.8739, 0.1261],
  [0, 0.8739, 0.1261],
];
const XYZ = [
  [0.4124, 0.3576, 0.1805],
  [0.2126, 0.7152, 0.0722],
  [0.0193, 0.1192, 0.9505],
];

const pivot = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27) * t + 16 / 116);

function lab(linearRgb) {
  const [x, y, z] = apply(XYZ, linearRgb);
  const [fx, fy, fz] = [pivot(x / 0.95047), pivot(y), pivot(z / 1.08883)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

const deltaE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const seen = (rgb, matrix) => lab(apply(matrix, rgb.map(toLinear)));

function luminance(rgb) {
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

const worstPair = (a, b) =>
  Math.min(deltaE(seen(a, PROTAN), seen(b, PROTAN)), deltaE(seen(a, DEUTAN), seen(b, DEUTAN)));

const tritanPair = (a, b) => deltaE(seen(a, TRITAN), seen(b, TRITAN));

let failures = 0;

say("Contrast\n");
for (const [label, fg, bg, floor] of CONTRAST) {
  const value = ratio(...on(fg, bg));
  const ok = value >= floor;
  if (!ok) failures += 1;
  say(
    `  ${ok ? "pass" : "under"}  ${label.padEnd(28)} ${value.toFixed(2).padStart(6)}:1   floor ${floor}`,
  );
}

say("\nThe four state colours, protan and deutan\n");
for (let i = 0; i < STATE_FAMILY.length; i += 1) {
  for (let j = i + 1; j < STATE_FAMILY.length; j += 1) {
    const [a, b] = [flat(STATE_FAMILY[i][1]), flat(STATE_FAMILY[j][1])];
    const worst = worstPair(a, b);
    const ok = worst >= DICHROMAT_FLOOR;
    if (!ok) failures += 1;
    const pair = `${STATE_FAMILY[i][0]} vs ${STATE_FAMILY[j][0]}`;
    say(
      `  ${ok ? "pass" : "under"}  ${pair.padEnd(20)} worst ΔE ${worst.toFixed(1).padStart(6)}   floor ${DICHROMAT_FLOOR}   tritan ${tritanPair(a, b).toFixed(1)}`,
    );
  }
}

say("\nThe brand red against every other ink\n");
for (const [label, other] of BRAND_EXCLUSIVE) {
  const worst = worstPair(flat("--brand"), flat(other));
  const ok = worst >= DICHROMAT_FLOOR;
  if (!ok) failures += 1;
  say(
    `  ${ok ? "pass" : "under"}  brand vs ${label.padEnd(12)} worst ΔE ${worst.toFixed(1).padStart(6)}   floor ${DICHROMAT_FLOOR}`,
  );
}

say("\nEvery semantic ink against every other, reported\n");
let closest = { value: Infinity, pair: "" };
let below = 0;
for (let i = 0; i < SEMANTIC.length; i += 1) {
  for (let j = i + 1; j < SEMANTIC.length; j += 1) {
    const value = worstPair(flat(SEMANTIC[i][1]), flat(SEMANTIC[j][1]));
    const pair = `${SEMANTIC[i][0]} vs ${SEMANTIC[j][0]}`;
    if (value < closest.value) closest = { value, pair };
    if (value < DICHROMAT_FLOOR) {
      below += 1;
      say(`  under  ${pair.padEnd(22)} ΔE ${value.toFixed(1).padStart(5)}`);
    }
  }
}
say(
  `  ${below === 1 ? "1 pair" : `${below} pairs`} under ${DICHROMAT_FLOOR}; closest is ${closest.pair} at ΔE ${closest.value.toFixed(1)}`,
);

say(
  failures === 0
    ? "\nEverything clears its floor."
    : `\n${failures} measurement(s) below floor: feedback for the owner, not a gate.`,
);
