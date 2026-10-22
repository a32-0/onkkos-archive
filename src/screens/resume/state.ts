export interface ResumeUpdate {
  since: string;
  name: string;
  version: string;
  versions: readonly string[];
  dates: readonly string[];
  meta: string;
  art: string | null;
  newest: boolean;
}

export type ResumeAction = (form: FormData) => Promise<void>;

interface Searchable {
  name: string;
  versions: readonly string[];
  dates: readonly string[];
}

export function matchesUpdate(update: Searchable, query: string): boolean {
  const name = update.name.toLowerCase();
  const dates = update.dates.map((date) => date.toLowerCase());
  const rest = query
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((word) => word.length > 0)
    .filter(
      (word) =>
        !name.includes(word) && !update.versions.some((version) => version.startsWith(word)),
    );
  return rest.length === 0 || dates.some((date) => rest.every((word) => date.includes(word)));
}
