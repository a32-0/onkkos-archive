import path from "node:path";

import { app, BrowserWindow, screen, session, type UtilityProcess } from "electron";

import { LAUNCH_HEADER } from "./guard.js";
import { holdLinks } from "./links.js";
import { keepLog } from "./log.js";
import { currentServer, refreshData, type DataPlaces } from "./data.js";
import { bundledServer, checkData, startServer } from "./server.js";
import { answerChecks, keepUpdated } from "./updates.js";
import { fitBounds, readBounds, writeBounds, type Bounds } from "./window-bounds.js";
import { isZoomMessage, stepZoom, widthAt, zoomFrom, zoomStepOf, type ZoomLevel } from "./zoom.js";

const WINDOW = { width: 390, widest: 600, height: 844, lowest: 640 } as const;
const APP_ID = "onkkos-archive";
const GROUND = "#16130e";
const RETURNING = "/system";
const STARTING = path.join(import.meta.dirname, "starting");
const ICON = path.join(import.meta.dirname, "icon.png");
const NO_SCROLL_BAR = "html { scrollbar-width: none; }";
const ZOOM_COOKIE = "wf_zoom";
const ZOOM_KEPT_SECONDS = 60 * 60 * 24 * 365;
const DATA_SOURCE =
  process.env.WF_DATA_SOURCE ?? "https://raw.githubusercontent.com/a32-0/onkkos-archive/main/data";

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

function holdContentSize(window: BrowserWindow, wanted: Bounds): void {
  const [contentWidth = wanted.width, contentHeight = wanted.height] = window.getContentSize();
  const [outerWidth = wanted.width, outerHeight = wanted.height] = window.getSize();
  window.setSize(
    outerWidth + wanted.width - contentWidth,
    outerHeight + wanted.height - contentHeight,
  );
}

function openWindow(): BrowserWindow {
  const kept = path.join(app.getPath("userData"), "window.json");
  const bounds = fitBounds(
    readBounds(kept),
    WINDOW,
    screen.getAllDisplays().map((display) => display.workArea),
    screen.getPrimaryDisplay().workArea,
  );
  const window = new BrowserWindow({
    ...bounds,
    useContentSize: true,
    minWidth: WINDOW.width,
    maxWidth: WINDOW.widest,
    minHeight: WINDOW.lowest,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: GROUND,
    icon: ICON,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      devTools: !app.isPackaged,
    },
  });
  window.removeMenu();
  holdContentSize(window, bounds);
  window.webContents.on("dom-ready", () => void window.webContents.insertCSS(NO_SCROLL_BAR));
  let size = { width: bounds.width, height: bounds.height };
  window.on("resize", () => {
    if (window.isMinimized()) return;
    const [width = size.width, height = size.height] = window.getContentSize();
    size = { width, height };
  });
  window.on("close", () => {
    const { x, y } = window.getNormalBounds();
    writeBounds(kept, { ...size, x, y });
  });
  return window;
}

function showZoom(window: BrowserWindow, level: ZoomLevel): void {
  window.webContents.setZoomFactor(level / 100);
  const least = widthAt(level, WINDOW.width);
  const [width = least, height = WINDOW.height] = window.getContentSize();
  const [outerWidth = width] = window.getSize();
  const [, lowest = WINDOW.lowest] = window.getMinimumSize();
  window.setMinimumSize(least + outerWidth - width, lowest);
  if (width < least) window.setContentSize(least, height);
}

function keepZoom(
  window: BrowserWindow,
  server: UtilityProcess,
  origin: string,
  kept: ZoomLevel,
): void {
  let level = kept;
  const choose = async (next: ZoomLevel) => {
    level = next;
    await session.defaultSession.cookies.set({
      url: origin,
      name: ZOOM_COOKIE,
      value: String(level),
      path: "/",
      sameSite: "lax",
      expirationDate: Math.floor(Date.now() / 1000) + ZOOM_KEPT_SECONDS,
    });
    showZoom(window, level);
  };
  window.webContents.on("dom-ready", () => showZoom(window, level));
  window.webContents.on("before-input-event", (event, input) => {
    const step = zoomStepOf(input);
    if (!step) return;
    event.preventDefault();
    void choose(stepZoom(level, step));
  });
  server.on("message", (message: unknown) => {
    if (isZoomMessage(message)) void choose(message.level);
  });
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
    const folder = checksData()
      ? await refreshData(places, checkData)
      : await currentServer(places);
    const server = await startServer(folder);
    origin = server.origin;
    answerChecks(server.child);
    signRequests(server.origin, server.token);
    const remembered = await session.defaultSession.cookies.get({
      url: server.origin,
      name: "wf_account",
    });
    const zoom = await session.defaultSession.cookies.get({
      url: server.origin,
      name: ZOOM_COOKIE,
    });
    keepZoom(window, server.child, server.origin, zoomFrom(zoom[0]?.value));
    await window.loadURL(remembered.length > 0 ? `${server.origin}${RETURNING}` : server.origin);
    keepUpdated();
  } catch (error) {
    console.error(error);
    await window.loadFile(path.join(STARTING, "failed.html"));
  }
}

if (app.requestSingleInstanceLock()) {
  keepLog();
  if (!process.windowsStore) app.setAppUserModelId(APP_ID);
  app.whenReady().then(start, () => app.quit());
  app.on("before-quit", () => void session.defaultSession.cookies.flushStore());
  app.on("window-all-closed", () => app.quit());
} else {
  app.quit();
}
