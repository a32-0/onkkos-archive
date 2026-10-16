import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const say = (line) => process.stdout.write(`${line}\n`);

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "vendor");
const SITE = "https://www.warframe.com";
const INDEX = `${SITE}/en/patch-notes`;
const FEED = (page) => `${SITE}/en/patch-notes/pc/json?page=${page}`;
const FIRST_TRACKED_VERSION = 15;
const PAUSE_MS = 1000;
const MAX_PAGES = 40;
const HEADERS = {
  "User-Agent": "onkkos-archive data refresh",
  "X-Requested-With": "XMLHttpRequest",
};

const VERSION = /\bUpdate (\d+)(?:\.(\d+))?(?:\.\d+)?\b/;
const UPDATE_PHRASE =
  /(\(PC\)\s*|PC\s+|Warframe\s+)?Update \d+(?:\.\d+)*(?:\s*\+\s*\d+(?:\.\d+)*)*/g;
const HOTFIX = /\bHotfix\b/i;
const MONTHS = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

function major(version) {
  return Number(version.split(".")[0]);
}

function later(a, b) {
  const [aMajor, aMinor = 0] = a.split(".").map(Number);
  const [bMajor, bMinor = 0] = b.split(".").map(Number);
  return aMajor - bMajor || aMinor - bMinor;
}

const pause = () => new Promise((resolve) => setTimeout(resolve, PAUSE_MS));

function decode(text) {
  return text
    .replace(/&#0?39;|’/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function isoDate(text) {
  const match = /^([A-Z][a-z]{2})\w* (\d{1,2}), (\d{4})$/.exec((text ?? "").trim());
  const month = match && MONTHS[match[1]];
  if (!match || !month) return null;
  return `${match[3]}-${String(month).padStart(2, "0")}-${match[2].padStart(2, "0")}`;
}

function record(title, date, image, link) {
  const clean = decode(title);
  if (HOTFIX.test(clean)) return null;
  const match = VERSION.exec(clean);
  if (!match) return null;
  const version = match[2] && match[2] !== "0" ? `${match[1]}.${match[2]}` : match[1];
  const name = clean
    .replace(UPDATE_PHRASE, "")
    .replace(/\s*:\s*(-\s*|:\s*)+/g, ": ")
    .replace(/^[\s:\u2013-]+|[\s:\u2013-]+$/g, "")
    .replace(/\s{2,}/g, " ");
  if (name.length === 0) return null;
  return {
    version,
    name,
    date: isoDate(date),
    art: image ?? null,
    url: link ? new URL(link, SITE).href : null,
  };
}

function fromIndex(html) {
  const out = [];
  const records = html.split('<div class="record">').slice(1);
  for (const chunk of records) {
    const link = /<a href="([^"]+)">\s*<figure>/.exec(chunk)?.[1] ?? null;
    const image = /<img src="([^"]+)"/.exec(chunk)?.[1] ?? null;
    const title = /<h3 class="title">[\s\S]*?<\/div>([\s\S]*?)<\/h3>/.exec(chunk)?.[1] ?? "";
    const date = /<date>([^<]+)<\/date>/.exec(chunk)?.[1] ?? null;
    const one = record(title, date, image, link);
    if (one) out.push(one);
  }
  return out;
}

async function get(url, json) {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return json ? response.json() : response.text();
}

async function main() {
  const found = new Map();
  const keep = (one) => {
    const known = found.get(one.version);
    if (!known) return found.set(one.version, one);
    found.set(one.version, {
      ...known,
      date: known.date ?? one.date,
      art: known.art ?? one.art,
      url: known.url ?? one.url,
    });
  };

  for (const one of fromIndex(await get(INDEX, false))) keep(one);

  for (let page = 2; page <= MAX_PAGES; page += 1) {
    await pause();
    const feed = await get(FEED(page), true);
    const groups = Array.isArray(feed.groupedNotes) ? feed.groupedNotes : [];
    for (const group of groups) {
      const main = group.main ?? {};
      const one = record(main.title ?? "", main.release_date, main.image, main.page_link);
      if (one) keep(one);
    }
    const oldest = Math.min(...[...found.keys()].map(major));
    if (!feed.hasMore || oldest < FIRST_TRACKED_VERSION) break;
  }

  const updates = [...found.values()]
    .filter((one) => major(one.version) >= FIRST_TRACKED_VERSION)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || later(b.version, a.version));
  if (updates.length === 0)
    throw new Error("no update read from the patch notes; the file is kept");

  mkdirSync(OUT, { recursive: true });
  writeFileSync(
    path.join(OUT, "patch-notes.json"),
    `${JSON.stringify({ refreshedAt: new Date().toISOString(), updates }, null, 1)}\n`,
  );

  say(`${updates.length} updates from DE's patch notes, newest ${updates[0].version}`);
}

await main();
