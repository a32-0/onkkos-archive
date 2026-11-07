import { readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const VERSION = /(\d+)\.(\d+)\.(\d+)/;
const CACHE_NAME = /^updaterCacheDirName:\s*(\S+)\s*$/m;

export function cacheBase(): string {
  return process.platform === "win32"
    ? process.env.LOCALAPPDATA || path.join(homedir(), "AppData", "Local")
    : process.env.XDG_CACHE_HOME || path.join(homedir(), ".cache");
}

export function pendingFolder(updateConfig: string, base: string): string | null {
  try {
    const name = CACHE_NAME.exec(readFileSync(updateConfig, "utf8"))?.[1];
    return name ? path.join(base, name, "pending") : null;
  } catch {
    return null;
  }
}

export function isInstalled(fileName: unknown, current: string): boolean {
  if (typeof fileName !== "string") return false;
  const kept = VERSION.exec(fileName);
  const running = VERSION.exec(current);
  if (!kept || !running) return false;
  for (const at of [1, 2, 3]) {
    const gap = Number(kept[at]) - Number(running[at]);
    if (gap !== 0) return gap < 0;
  }
  return true;
}

export function dropInstalledUpdate(pending: string, current: string): void {
  let info: unknown;
  try {
    info = JSON.parse(readFileSync(path.join(pending, "update-info.json"), "utf8"));
  } catch {
    return;
  }
  if (!isInstalled((info as { fileName?: unknown } | null)?.fileName, current)) return;
  try {
    rmSync(pending, { recursive: true, force: true });
  } catch (error) {
    console.warn(
      `The installed update was not cleared: ${error instanceof Error ? error.message : error}`,
    );
  }
}
