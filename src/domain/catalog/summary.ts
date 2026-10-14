import type { Part, Phrase, StepPlan } from "@/domain/catalog/checks";

type Section = StepPlan["sections"][number];
type Row = Section["groups"][number]["rows"][number];

interface BriefLine {
  id: string;
  title: Phrase;
  route: Phrase | null;
  reading: Part[];
  where: Part[];
  imageUrl: string | null;
  more: number;
}

interface BriefBlock {
  id: "blueprints" | "components" | "how";
  title: Phrase;
  lines: BriefLine[];
}

const HOW = "how";
const BLUEPRINTS = "blueprints";
const PART = "part:";
const WEAPON = "weapon:";

function rowsOf(section: Section): Row[] {
  return section.groups.flatMap((group) => group.rows);
}

function line(row: Row): BriefLine {
  return {
    id: row.id,
    title: row.title,
    route: null,
    reading: row.brief,
    where: row.where,
    imageUrl: row.imageUrl,
    more: 0,
  };
}

export function briefOf(plan: StepPlan): BriefBlock[] {
  const blueprints: BriefLine[] = [];
  const components: BriefBlock[] = [];
  let how: BriefBlock | null = null;

  for (const section of plan.sections) {
    const rows = rowsOf(section);
    if (section.id === HOW) {
      how = { id: "how", title: section.title, lines: rows.map(line) };
    } else if (section.id === BLUEPRINTS) {
      blueprints.push(...rows.map(line));
    } else if (section.id.startsWith(PART)) {
      const [first] = rows;
      if (!first) continue;
      blueprints.push({
        id: section.id,
        title: section.title,
        route: first.title,
        reading: first.brief,
        where: first.where,
        imageUrl: section.imageUrl,
        more: rows.length - 1,
      });
    } else if (section.checkable) {
      const lines = rows.filter((row) => !row.id.startsWith(WEAPON)).map(line);
      if (lines.length > 0) components.push({ id: "components", title: section.title, lines });
    }
  }

  const blocks: BriefBlock[] = [
    ...(blueprints.length === 0
      ? []
      : [
          {
            id: "blueprints" as const,
            title: { say: "sectionBlueprints" } as Phrase,
            lines: blueprints,
          },
        ]),
    ...components,
  ];
  if (blocks.length > 0) return blocks;
  return how === null ? [] : [how];
}
