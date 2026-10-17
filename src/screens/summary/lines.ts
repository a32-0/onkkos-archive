import { BRIEF, briefLine } from "@/content/checks";
import type { Part, Phrase } from "@/domain/catalog/checks";

type BriefSay = keyof typeof BRIEF;

const SAYS: { [K in BriefSay]: (phrase: Extract<Phrase, { say: K }>) => string | null } = BRIEF;

function said(phrase: Phrase): string | null {
  if (!(phrase.say in SAYS)) return null;
  return (SAYS[phrase.say as BriefSay] as (one: Phrase) => string | null)(phrase);
}

export function tileLines(
  reading: readonly Part[],
  where: readonly Part[],
): { reading: string; place: string } {
  const named = (where.length > 0 ? where : reading).filter(
    (part): part is string => typeof part === "string",
  );
  return {
    reading: briefLine(reading.map((part) => (typeof part === "string" ? null : said(part)))),
    place: briefLine(named),
  };
}
