import "server-only";

export function isDemoSite(): boolean {
  return process.env.WF_EDITION === "demo";
}

export function appVersion(): string | null {
  return process.env.WF_EDITION === "app" ? (process.env.WF_APP_VERSION ?? null) : null;
}

export function fromStore(): boolean {
  return appVersion() !== null && process.env.WF_APP_CHANNEL === "store";
}
