import { readFileSync } from "node:fs";
import path from "node:path";

import { app, Notification, type UtilityProcess } from "electron";
import electronUpdater from "electron-updater";

import { channelOf } from "./channel.js";

const { autoUpdater } = electronUpdater;

const EVERY_MS = 6 * 60 * 60 * 1000;
const WORDS = path.join(import.meta.dirname, "words.json");

type UpdateState =
  | { state: "current" }
  | { state: "downloading" | "ready"; version: string }
  | { state: "unreachable" };

interface Ask {
  kind: "updates";
  id: string;
}

let available: string | null = null;
let downloaded: string | null = null;

function readyWords(version: string): string | null {
  try {
    const words = JSON.parse(readFileSync(WORDS, "utf8")) as { ready?: unknown };
    return typeof words.ready === "string" ? words.ready.replace("{version}", version) : null;
  } catch {
    return null;
  }
}

function tell(version: string): void {
  const body = readyWords(version);
  if (body && Notification.isSupported()) new Notification({ title: app.getName(), body }).show();
}

function updatesItself(): boolean {
  return channelOf(app.isPackaged, process.windowsStore) === "github";
}

function known(version: string): UpdateState {
  return { state: downloaded === version ? "ready" : "downloading", version };
}

async function lookUp(): Promise<UpdateState> {
  if (!updatesItself()) return { state: "current" };
  try {
    const result = await autoUpdater.checkForUpdates();
    if (!result?.isUpdateAvailable) return { state: "current" };
    available = result.updateInfo.version;
    return known(available);
  } catch {
    return { state: "unreachable" };
  }
}

function checkNow(): Promise<UpdateState> {
  return available === null ? lookUp() : Promise.resolve(known(available));
}

export function keepUpdated(): void {
  if (!updatesItself()) return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on("error", (error) => {
    if (downloaded !== available) available = null;
    console.warn(`The update check failed: ${error.message}`);
  });
  autoUpdater.on("update-downloaded", (info) => {
    if (downloaded === info.version) return;
    available = info.version;
    downloaded = info.version;
    tell(info.version);
  });
  void lookUp();
  setInterval(() => void lookUp(), EVERY_MS);
}

function isAsk(message: unknown): message is Ask {
  const ask = message as Partial<Ask> | null;
  return ask?.kind === "updates" && typeof ask.id === "string";
}

function isRestart(message: unknown): boolean {
  return (message as { kind?: unknown } | null)?.kind === "restart";
}

export function answerChecks(server: UtilityProcess): void {
  server.on("message", (message: unknown) => {
    if (isRestart(message) && updatesItself() && downloaded !== null) {
      autoUpdater.quitAndInstall(true, true);
      return;
    }
    if (!isAsk(message)) return;
    void checkNow().then((answer) =>
      server.postMessage({ kind: "updates", id: message.id, answer }),
    );
  });
}
