import { BRIEF, briefLine, TITLES } from "@/content/checks";
import type { Part, Phrase } from "@/domain/catalog/checks";

type BriefSay = keyof typeof BRIEF;

type TitleSay = Extract<
  Phrase["say"],
  `${string}Title` | `section${string}` | "partSection" | "marketTitle2"
>;

const SAYS: { [K in BriefSay]: (phrase: Extract<Phrase, { say: K }>) => string | null } = BRIEF;

const TITLE_SAYS: { [K in TitleSay]: (phrase: Extract<Phrase, { say: K }>) => string } = TITLES;

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

export function tileLines(
  reading: readonly Part[],
  where: readonly Part[],
): { reading: string; place: string } {
  const named = (where.length > 0 ? where : reading).filter(
    (part): part is string => typeof part === "string",
  );
  return { reading: readingOf(reading), place: briefLine(named) };
}
