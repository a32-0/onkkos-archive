export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export type ResolvedSearchParams = Awaited<SearchParams>;

export function readParam(query: ResolvedSearchParams, name: string): string | null {
  const value = query[name];
  return typeof value === "string" ? value : null;
}
