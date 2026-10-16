export const RESUME = {
  title: "RESUME",
  lead: "Tell us which one was your last played. We'll show you what shipped since.",
  search: "Search an update or a date...",
  date: "Date",
  monthHeading: "Month you last played",
  newest: "Newest",
  meta: (version: string, month: string) => `Update ${version} · ${month}`,
  more: (count: number) => `Show ${count} older ${count === 1 ? "update" : "updates"}`,
  noMatch: "No update by that name or date.",
  skip: "Skip",
} as const;
