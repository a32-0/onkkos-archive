export const ROUTES = {
  connect: "/connect",
} as const;

export function connectAfter(reason: string, retryAt: number | null): string {
  const query = new URLSearchParams({ reason });
  if (retryAt !== null) query.set("retry", String(retryAt));
  return `${ROUTES.connect}?${query.toString()}`;
}
