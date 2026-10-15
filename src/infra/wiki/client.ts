import "server-only";

import type { ProseSource } from "@/domain/catalog/checks";

const API = "https://wiki.warframe.com/api.php";
const TIMEOUT_MS = 8_000;
const REVALIDATE_SECONDS = 86_400;

const HEADING = /^={2,}\s*(.+?)\s*={2,}$/;
const DISAMBIGUATION = /\bmay refer to\b/i;
const HATNOTE = /^(For |This article is about|Not to be confused with)/;
const BOILERPLATE = /^(All drop rates data|See Mission Rewards|For more detailed|visit here)/i;
const ATTRIBUTION = /—[^—.!?]{1,60}$/;
const QUOTE_LINES = 3;
const MECHANICS = ["Mechanics"] as const;
const ACQUISITION = ["Acquisition"] as const;

interface ExtractResponse {
  query?: { pages?: { title?: string; missing?: boolean; extract?: string }[] };
}

interface FileResponse {
  query?: { pages?: { title?: string; missing?: boolean; imageinfo?: { url?: string }[] }[] };
}

async function query<T>(params: Record<string, string>): Promise<T | null> {
  try {
    const response = await fetch(`${API}?${new URLSearchParams(params).toString()}`, {
      cache: "force-cache",
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchWikiFileUrls(titles: readonly string[]): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  if (titles.length === 0) return found;

  const json = await query<FileResponse>({
    action: "query",
    prop: "imageinfo",
    iiprop: "url",
    titles: titles.map((title) => `File:${title}`).join("|"),
    format: "json",
    formatversion: "2",
  });

  for (const page of json?.query?.pages ?? []) {
    const url = page.imageinfo?.[0]?.url;
    if (!page.title || page.missing || !url) continue;
    found.set(page.title.replace(/^File:/, ""), url);
  }
  return found;
}

async function wholePage(title: string): Promise<string | null> {
  const json = await query<ExtractResponse>({
    action: "query",
    prop: "extracts",
    explaintext: "1",
    redirects: "1",
    titles: title,
    format: "json",
    formatversion: "2",
  });
  const page = json?.query?.pages?.[0];
  if (!page || page.missing || typeof page.extract !== "string") return null;
  return page.extract;
}

export function sectionOf(extract: string, headings: readonly string[]): string | null {
  for (const heading of headings) {
    const body = oneSection(extract, heading.toLowerCase());
    if (body !== null) return body;
  }
  return null;
}

function oneSection(extract: string, wanted: string): string | null {
  const collected: string[] = [];
  let depth = 0;

  for (const line of extract.split("\n")) {
    const trimmed = line.trim();
    const match = HEADING.exec(trimmed);
    if (match) {
      const level = trimmed.match(/^=+/)?.[0].length ?? 2;
      if (depth > 0 && level <= depth) break;
      if (depth === 0 && (match[1] ?? "").toLowerCase() === wanted) depth = level;
      continue;
    }
    if (depth > 0) collected.push(line);
  }

  const body = collected.join("\n").trim();
  return body.length > 0 ? body : null;
}

function leadOf(extract: string): string | null {
  const lead: string[] = [];
  for (const line of extract.split("\n")) {
    if (HEADING.test(line.trim())) break;
    lead.push(line);
  }
  const body = lead.join("\n").trim();
  return body.length > 0 ? body : null;
}

export function paragraphs(body: string): string[] {
  return body
    .split(/\n+/)
    .map(tidy)
    .filter((line) => line.length > 0);
}

function tidy(line: string): string {
  return line
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}

export function leadParagraphs(body: string): string[] {
  const lines = paragraphs(body);
  const quoteEnd = lines.findIndex((line) => ATTRIBUTION.test(line));
  const rest = quoteEnd >= 0 && quoteEnd < QUOTE_LINES ? lines.slice(quoteEnd + 1) : lines;
  return rest.filter((line) => !HATNOTE.test(line));
}

export function acquisitionParagraphs(body: string): string[] {
  return paragraphs(body).filter((line) => !BOILERPLATE.test(line));
}

function lead(extract: string): string[] {
  const body = leadOf(extract);
  if (body === null || DISAMBIGUATION.test(body)) return [];
  return leadParagraphs(body);
}

function fragmentOf(title: string): string | null {
  const hash = title.indexOf("#");
  return hash < 0 ? null : title.slice(hash + 1).replace(/_/g, " ");
}

function passageOf(extract: string, source: ProseSource, fragment: string | null): string[] {
  switch (source) {
    case "mechanics": {
      const body = sectionOf(extract, MECHANICS);
      return body === null ? lead(extract) : paragraphs(body);
    }
    case "acquisition": {
      const body = sectionOf(extract, fragment === null ? ACQUISITION : [fragment]);
      return body === null ? [] : acquisitionParagraphs(body);
    }
    case "lead":
      return lead(extract);
  }
}

export async function wikiPassage(title: string, source: ProseSource): Promise<string[] | null> {
  const extract = await wholePage(title);
  if (extract === null) return null;
  const passage = passageOf(extract, source, fragmentOf(title));
  return passage.length > 0 ? passage : null;
}
