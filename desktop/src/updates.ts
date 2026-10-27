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

let downloaded: string | null = null;

function readyWords(): string | null {
  try {
    const words = JSON.parse(readFileSync(WORDS, "utf8")) as { ready?: unknown };
    return typeof words.ready === "string" ? words.ready : null;
  } catch {
    return null;
  }
}

function tell(): void {
  const body = readyWords();
  if (body && Notification.isSupported()) new Notification({ title: app.getName(), body }).show();
}

function updatesItself(): boolean {
  return channelOf(app.isPackaged, process.windowsStore) === "github";
}

async function checkNow(): Promise<UpdateState> {
  if (!updatesItself()) return { state: "current" };
  try {
    const result = await autoUpdater.checkForUpdates();
    if (!result?.isUpdateAvailable) return { state: "current" };
    const version = result.updateInfo.version;
    return { state: downloaded === version ? "ready" : "downloading", version };
  } catch {
    return { state: "unreachable" };
  }
}

export function keepUpdated(): void {
  if (!updatesItself()) return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on("error", (error) => console.warn(`The update check failed: ${error.message}`));
  autoUpdater.on("update-downloaded", (info) => {
    if (downloaded === info.version) return;
    downloaded = info.version;
    tell();
  });
  void checkNow();
  setInterval(() => void checkNow(), EVERY_MS);
}

function isAsk(message: unknown): message is Ask {
  const ask = message as Partial<Ask> | null;
  return ask?.kind === "updates" && typeof ask.id === "string";
}

export function answerChecks(server: UtilityProcess): void {
  server.on("message", (message: unknown) => {
    if (!isAsk(message)) return;
    void checkNow().then((answer) =>
      server.postMessage({ kind: "updates", id: message.id, answer }),
    );
  });
}
