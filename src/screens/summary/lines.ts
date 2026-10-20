import { BRIEF, briefLine, DETAILS, detailLine, TITLES } from "@/content/checks";
import type { Part, Phrase } from "@/domain/catalog/checks";

type BriefSay = keyof typeof BRIEF;

type TitleSay = Extract<
  Phrase["say"],
  `${string}Title` | `section${string}` | "partSection" | "marketTitle2"
>;

type DetailSay = Exclude<Phrase["say"], TitleSay | BriefSay | "otherWays">;

const SAYS: { [K in BriefSay]: (phrase: Extract<Phrase, { say: K }>) => string | null } = BRIEF;

const TITLE_SAYS: { [K in TitleSay]: (phrase: Extract<Phrase, { say: K }>) => string } = TITLES;

const DETAIL_SAYS: { [K in DetailSay]: (phrase: Extract<Phrase, { say: K }>) => string | null } =
  DETAILS;

function said(phrase: Phrase): string | null {
  if (!(phrase.say in SAYS)) return null;
  return (SAYS[phrase.say as BriefSay] as (one: Phrase) => string | null)(phrase);
}

export function titled(phrase: Phrase): string {
  if (!(phrase.say in TITLE_SAYS)) return "";
  return (TITLE_SAYS[phrase.say as TitleSay] as (one: Phrase) => string)(phrase);
}

function readingOf(reading: readonly Part[]): string {
  return briefLine(reading.map((part) => (typeof part === "string" ? null : said(part))));
}

function wordsOf(phrase: Phrase): string | null {
  if (phrase.say === "otherWays") {
    return DETAILS.otherWays({
      ways: phrase.ways.map((way) => ({
        title: titled(way.title),
        brief: readingOf(way.brief) || null,
      })),
    });
  }
  if (phrase.say in DETAIL_SAYS) {
    return (DETAIL_SAYS[phrase.say as DetailSay] as (one: Phrase) => string | null)(phrase);
  }
  return said(phrase) ?? (titled(phrase) || null);
}

export function detailOf(parts: readonly Part[]): string | null {
  return detailLine(parts.map((part) => (typeof part === "string" ? part : wordsOf(part))));
}

export function tileLines(
  reading: readonly Part[],
  where: readonly Part[],
): { reading: string; place: string } {
  const named = (where.length > 0 ? where : reading).map((part) =>
    typeof part === "string" ? part : part.say === "nodeOn" ? said(part) : null,
  );
  return { reading: readingOf(reading), place: briefLine(named) };
}
