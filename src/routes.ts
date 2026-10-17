export const ROUTES = {
  connect: "/connect",
  features: "/features",
  system: "/system",
  catchUp: "/catch-up",
  goals: "/goals",
  item: "/item",
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

export type ItemView = "steps";

export function itemRoute(name: string, from: string, view?: ItemView): string {
  const query = new URLSearchParams({ name, from });
  if (view) query.set("view", view);
  return `${ROUTES.item}?${query.toString()}`;
}

export function searchRoute(term: string): string {
  return `${ROUTES.search}?${new URLSearchParams({ q: term }).toString()}`;
}
