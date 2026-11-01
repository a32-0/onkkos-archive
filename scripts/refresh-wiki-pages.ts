import { writeFileSync } from "node:fs";
import path from "node:path";

import { everyPlan, linkedTitles } from "@/domain/catalog/every-plan";
import { allPlaces } from "@/domain/catalog/places";
import { catalogData } from "@/infra/catalog/data";
import { loadGraph } from "@/infra/graph/load";

const say = (line: string) => process.stdout.write(`${line}\n`);

const API = "https://wiki.warframe.com/api.php";
const OUT = path.join(process.cwd(), "data", "vendor", "wiki-pages.json");
const BATCH = 50;
const PAUSE_MS = 500;
const SMALL_WORDS = /^(Of|The|And|In|On|To|A|An|For|At|By|From|With)$/;
const NUMERAL = /\b(Ii|Iii|Iv|Vi|Vii|Viii|Ix)\b/g;

interface QueryResponse {
  query?: {
    normalized?: { from: string; to: string }[];
    redirects?: { from: string; to: string }[];
    pages?: { title: string; missing?: boolean; invalid?: boolean }[];
  };
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cased(title: string): string {
  return title
    .split(" ")
    .map((word, index) => (index > 0 && SMALL_WORDS.test(word) ? word.toLowerCase() : word))
    .join(" ")
    .replace(NUMERAL, (numeral) => numeral.toUpperCase());
}

function variants(title: string): string[] {
  const out = new Set<string>();
  const base = title.replace(/\s*\([^)]*\)$/, "");
  for (const one of [base, base.replace(/ Rewards$/, ""), base.replace(/ Relic$/, "")]) {
    out.add(one);
    out.add(cased(one));
  }
  out.add(cased(title));
  out.delete(title);
  return [...out];
}

async function existing(titles: readonly string[]): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  for (let at = 0; at < titles.length; at += BATCH) {
    const batch = titles.slice(at, at + BATCH);
    const params = new URLSearchParams({
      action: "query",
      titles: batch.join("|"),
      redirects: "1",
      format: "json",
      formatversion: "2",
    });
    const response = await fetch(`${API}?${params.toString()}`);
    if (!response.ok) throw new Error(`The wiki answered ${response.status}.`);
    const query = ((await response.json()) as QueryResponse).query ?? {};
    const normalized = new Map((query.normalized ?? []).map((one) => [one.from, one.to]));
    const redirects = new Map((query.redirects ?? []).map((one) => [one.from, one.to]));
    const pages = new Map((query.pages ?? []).map((page) => [page.title, page]));
    for (const title of batch) {
      const named = normalized.get(title) ?? title;
      const target = redirects.get(named) ?? named;
      const page = pages.get(target);
      if (page && !page.missing && !page.invalid) found.set(title, target);
    }
    await pause(PAUSE_MS);
  }
  return found;
}

async function main(): Promise<void> {
  const data = catalogData();
  const places = new Set(allPlaces(loadGraph()).map((place) => place.name));
  const plans = everyPlan(data, places, { now: Date.now() });
  const asked = linkedTitles(data, plans);
  const bases = [...new Set(asked.map((title) => title.split("#")[0] ?? title))];
  say(`Checking ${bases.length} wiki pages.`);

  const found = await existing(bases);
  const missing = bases.filter((title) => !found.has(title));
  const tries = new Map(missing.map((title) => [title, variants(title)]));
  const second = await existing([...new Set([...tries.values()].flat())]);
  for (const [title, options] of tries) {
    const hit = options.find((option) => second.has(option));
    if (hit) found.set(title, second.get(hit) ?? hit);
  }

  const pages: Record<string, string | null> = {};
  for (const title of asked) {
    const [base = title, section] = title.split("#");
    const page = found.get(base) ?? null;
    pages[title] = page === null || section === undefined ? page : `${page}#${section}`;
  }
  writeFileSync(OUT, `${JSON.stringify({ pages }, null, 2)}\n`);
  const unknown = asked.filter((title) => pages[title] === null).length;
  say(`Wrote ${asked.length} pages; ${unknown} have no page on the wiki and link elsewhere.`);
}

await main();
