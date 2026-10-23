import "server-only";

export function isDemoSite(): boolean {
  return process.env.WF_EDITION === "demo";
}
