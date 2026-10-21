import { REVIEW } from "@/content/review";
import type { Finding, Review, ReviewedUpdate } from "@/domain/catalog/review";
import { titled } from "@/screens/summary/lines";

export interface ReportFacts {
  date: string;
  catalogFrom: string;
  catalogTo: string;
  passed: boolean;
  drops: { changed: number; added: number; removed: number };
  modules: readonly string[];
}

function cell(text: string): string {
  return text.replace(/\|/g, "\\|");
}

function table(head: readonly string[], rows: readonly string[][]): string[] {
  return [
    `| ${head.join(" | ")} |`,
    `| ${head.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ];
}

function levels(findings: readonly Finding[]): string[] {
  const lines: string[] = [];
  const fresh = findings.filter((one) => one.level === "new");
  const source = findings.filter((one) => one.level === "source");
  const own = findings.filter((one) => one.level === "own");
  if (fresh.length > 0) {
    lines.push("", REVIEW.newToApp, "", ...fresh.map((one) => REVIEW.fresh(one.name, one.kind)));
  }
  if (source.length > 0) {
    lines.push(
      "",
      REVIEW.needsSource,
      "",
      ...table(
        REVIEW.sourceHead,
        source.map((one) => {
          const missing = one.missing ?? "route";
          return [one.name, one.kind, REVIEW.missing[missing], REVIEW.lookIn[missing]];
        }),
      ),
    );
  }
  if (own.length > 0) {
    lines.push(
      "",
      REVIEW.ownLevel,
      "",
      ...table(
        REVIEW.ownHead,
        own.map((one) => [
          one.name,
          one.kind,
          (one.route ? titled(one.route) : "") || REVIEW.noRoute,
        ]),
      ),
    );
  }
  return lines;
}

function updateSection(update: ReviewedUpdate): string[] {
  const lines = ["", REVIEW.update(update.version, update.name), ""];
  lines.push(REVIEW.released(update.date, update.hotfixes));
  if (update.findings.length === 0) lines.push("", REVIEW.empty);
  return [...lines, ...levels(update.findings)];
}

export function isEmpty(review: Review): boolean {
  return review.updates.length === 0 && review.late.length === 0 && review.nodes.length === 0;
}

export function renderReport(review: Review, facts: ReportFacts): string {
  const all = [...review.updates.flatMap((one) => one.findings), ...review.late, ...review.nodes];
  const count = (level: Finding["level"]) => all.filter((one) => one.level === level).length;
  const lines = [
    REVIEW.title(facts.date),
    "",
    `${REVIEW.catalog(facts.catalogFrom, facts.catalogTo)} ${REVIEW.checked(facts.passed)}`,
    "",
    REVIEW.glance,
    "",
    isEmpty(review) ? REVIEW.nothing : REVIEW.counts(count("own"), count("source"), count("new")),
  ];
  for (const update of review.updates) lines.push(...updateSection(update));
  if (review.late.length > 0) {
    lines.push("", REVIEW.late, "", REVIEW.lateLead, ...levels(review.late));
  }
  if (review.nodes.length > 0) lines.push("", REVIEW.places, ...levels(review.nodes));
  lines.push(
    "",
    REVIEW.changed,
    "",
    REVIEW.drops(facts.drops.changed, facts.drops.added, facts.drops.removed),
    "",
    REVIEW.wiki(facts.modules.map((name) => REVIEW.wikiNames[name] ?? name)),
  );
  return `${lines.join("\n")}\n`;
}
