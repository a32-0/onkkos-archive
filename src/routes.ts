export const ROUTES = {
  connect: "/connect",
  features: "/features",
  system: "/system",
  catchUp: "/catch-up",
  goals: "/goals",
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
