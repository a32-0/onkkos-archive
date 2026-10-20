export const ROUTES = {
  connect: "/connect",
  features: "/features",
  system: "/system",
  catchUp: "/catch-up",
  goals: "/goals",
  item: "/item",
  profile: "/profile",
  search: "/api/search",
} as const;

export function connectAfter(reason: string, retryAt: number | null): string {
  const query = new URLSearchParams({ reason });
  if (retryAt !== null) query.set("retry", String(retryAt));
  return `${ROUTES.connect}?${query.toString()}`;
}

export function placeRoute(system: string, place: string): string {
  return `${ROUTES.system}?${new URLSearchParams({ system, place }).toString()}`;
}

export type CatchUpStep = "resume" | "summary";

export function catchUpAt(step: CatchUpStep | null): string {
  return step ? `${ROUTES.catchUp}?step=${step}` : ROUTES.catchUp;
}

export type ItemView = "summary" | "steps";

export function stepAnchor(id: string): string {
  return id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function itemRoute(name: string, from: string, view?: ItemView, section?: string): string {
  const query = new URLSearchParams({ name, from });
  if (view) query.set("view", view);
  const anchor = section ? `#${stepAnchor(section)}` : "";
  return `${ROUTES.item}?${query.toString()}${anchor}`;
}

export function searchRoute(term: string): string {
  return `${ROUTES.search}?${new URLSearchParams({ q: term }).toString()}`;
}

function withQuery(path: string, query: Record<string, string | null>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value !== null) params.set(key, value);
  const text = params.toString();
  return text ? `${path}?${text}` : path;
}

export function profileRoute(from: string | null): string {
  return withQuery(ROUTES.profile, { from });
}

export function catchUpCategoryRoute(category: string, step: CatchUpStep | null): string {
  return withQuery(`${ROUTES.catchUp}/${category}`, { step });
}

export type UpdatesFrom = "resume" | "navigation";

export function updatesRoute(from: UpdatesFrom, step: CatchUpStep | null): string {
  return withQuery(`${ROUTES.catchUp}/updates`, { from, step });
}

export function mapCategoryRoute(
  category: string,
  system: string,
  place: string,
  view: string | null = null,
): string {
  return withQuery(`${ROUTES.system}/${category}`, { system, place, view });
}

export function placesRoute(system: string, place: string, list: string | null = null): string {
  return withQuery(`${ROUTES.system}/places`, { system, place, list });
}

export function systemsRoute(system: string, place: string, list: string | null = null): string {
  return withQuery(`${ROUTES.system}/systems`, { system, place, list });
}
