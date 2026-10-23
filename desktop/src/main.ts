import { app, BrowserWindow, screen, utilityProcess } from "electron";
import { createServer } from "node:net";
import path from "node:path";

const WINDOW = { width: 390, widest: 600, height: 844, lowest: 640 } as const;
const GROUND = "#16130e";
const READY_MS = 30_000;

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() =>
        typeof address === "object" && address
          ? resolve(address.port)
          : reject(new Error("No port")),
      );
    });
  });
}

async function answers(url: string): Promise<void> {
  const deadline = Date.now() + READY_MS;
  while (Date.now() < deadline) {
    const ok = await fetch(url).then(
      (response) => response.ok,
      () => false,
    );
    if (ok) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("The server did not answer");
}

function serverFolder(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, "server")
    : path.join(import.meta.dirname, "..", "..", ".next", "standalone");
}

async function start(): Promise<void> {
  const port = await freePort();
  const folder = serverFolder();
  const server = utilityProcess.fork(path.join(folder, "server.js"), [], {
    cwd: folder,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
      WF_EDITION: "app",
      WF_PROFILE_SOURCE: "live",
      WF_STORE_FILE: path.join(app.getPath("userData"), "store.json"),
    },
  });
  app.on("will-quit", () => server.kill());

  const origin = `http://127.0.0.1:${port}`;
  await answers(`${origin}/connect`);

  const height = Math.min(WINDOW.height, screen.getPrimaryDisplay().workAreaSize.height);
  const window = new BrowserWindow({
    width: WINDOW.width,
    height,
    useContentSize: true,
    minWidth: WINDOW.width,
    maxWidth: WINDOW.widest,
    minHeight: WINDOW.lowest,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: GROUND,
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false },
  });
  window.removeMenu();
  await window.loadURL(origin);
}

app.whenReady().then(start, () => app.quit());
app.on("window-all-closed", () => app.quit());
