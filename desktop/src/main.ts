import path from "node:path";

import { app, BrowserWindow, screen, session } from "electron";

import { LAUNCH_HEADER } from "./guard.js";
import { holdLinks } from "./links.js";
import { currentServer, refreshData, type DataPlaces } from "./data.js";
import { bundledServer, startServer } from "./server.js";
import { fitSize, readSize, writeSize } from "./window-size.js";

const WINDOW = { width: 390, widest: 600, height: 844, lowest: 640 } as const;
const GROUND = "#16130e";
const RETURNING = "/system";
const STARTING = path.join(import.meta.dirname, "starting");
const NO_SCROLL_BAR = "html { scrollbar-width: none; }";
const DATA_SOURCE = "https://raw.githubusercontent.com/a32-0/onkkos-archive/main/data";

function dataPlaces(): DataPlaces {
  return {
    bundled: bundledServer(),
    ownRoot: path.join(app.getPath("userData"), "server"),
    version: app.getVersion(),
    source: DATA_SOURCE,
  };
}

function checksData(): boolean {
  return app.isPackaged || process.env.WF_DATA_CHECK === "1";
}

function openWindow(): BrowserWindow {
  const kept = path.join(app.getPath("userData"), "window.json");
  const size = fitSize(readSize(kept), WINDOW, screen.getPrimaryDisplay().workAreaSize.height);
  const window = new BrowserWindow({
    width: size.width,
    height: size.height,
    useContentSize: true,
    minWidth: WINDOW.width,
    maxWidth: WINDOW.widest,
    minHeight: WINDOW.lowest,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: GROUND,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      devTools: !app.isPackaged,
    },
  });
  window.removeMenu();
  window.webContents.on("dom-ready", () => void window.webContents.insertCSS(NO_SCROLL_BAR));
  window.on("close", () => {
    const [width = size.width, height = size.height] = window.getContentSize();
    writeSize(kept, { width, height });
  });
  return window;
}

function signRequests(origin: string, token: string): void {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const own = URL.parse(details.url)?.origin === origin;
    callback({
      requestHeaders: own
        ? { ...details.requestHeaders, [LAUNCH_HEADER]: token }
        : details.requestHeaders,
    });
  });
}

async function start(): Promise<void> {
  let origin: string | null = null;
  const window = openWindow();
  holdLinks(window, () => origin);
  app.on("second-instance", () => {
    if (window.isMinimized()) window.restore();
    window.focus();
  });
  await window.loadFile(path.join(STARTING, "starting.html"));
  try {
    const places = dataPlaces();
    const folder = checksData() ? await refreshData(places) : await currentServer(places);
    const server = await startServer(folder);
    origin = server.origin;
    signRequests(server.origin, server.token);
    const remembered = await session.defaultSession.cookies.get({
      url: server.origin,
      name: "wf_account",
    });
    await window.loadURL(remembered.length > 0 ? `${server.origin}${RETURNING}` : server.origin);
  } catch (error) {
    console.error(error);
    await window.loadFile(path.join(STARTING, "failed.html"));
  }
}

if (app.requestSingleInstanceLock()) {
  app.whenReady().then(start, () => app.quit());
  app.on("before-quit", () => void session.defaultSession.cookies.flushStore());
  app.on("window-all-closed", () => app.quit());
} else {
  app.quit();
}
