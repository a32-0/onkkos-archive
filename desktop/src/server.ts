import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";

import { app, utilityProcess } from "electron";

import { LAUNCH_HEADER } from "./guard.js";

const READY_MS = 30_000;

export interface Server {
  origin: string;
  token: string;
}

function listenable(port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(port, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() =>
        typeof address === "object" && address
          ? resolve(address.port)
          : reject(new Error("No port")),
      );
    });
  });
}

async function keptPort(): Promise<number> {
  const file = path.join(app.getPath("userData"), "port");
  const kept = Number.parseInt(readFileSync(file, { encoding: "utf8", flag: "a+" }), 10);
  const port = await listenable(kept > 0 ? kept : 0).catch(() => listenable(0));
  if (port !== kept) writeFileSync(file, String(port));
  return port;
}

async function answers(url: string, token: string): Promise<void> {
  const deadline = Date.now() + READY_MS;
  while (Date.now() < deadline) {
    const ok = await fetch(url, { headers: { [LAUNCH_HEADER]: token } }).then(
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

export async function startServer(): Promise<Server> {
  const port = await keptPort();
  const host = `127.0.0.1:${port}`;
  const token = randomBytes(32).toString("hex");
  const folder = serverFolder();
  const server = utilityProcess.fork(
    path.join(import.meta.dirname, "serve.js"),
    [path.join(folder, "server.js")],
    {
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
        WF_LAUNCH_TOKEN: token,
        WF_LAUNCH_HOST: host,
        WF_APP_VERSION: app.getVersion(),
      },
    },
  );
  app.on("will-quit", () => server.kill());
  const origin = `http://${host}`;
  await answers(`${origin}/connect`, token);
  return { origin, token };
}
