import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";

import { app, utilityProcess, type UtilityProcess } from "electron";

import { channelOf } from "./channel.js";
import { LAUNCH_HEADER } from "./guard.js";
import { logFrom } from "./log.js";

const READY_MS = 30_000;

export interface Server {
  origin: string;
  token: string;
  child: UtilityProcess;
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

export function bundledServer(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, "server")
    : path.join(import.meta.dirname, "..", "..", ".next", "standalone");
}

interface Launch {
  folder: string;
  port: number;
  token: string;
  env: NodeJS.ProcessEnv;
}

function launch({ folder, port, token, env }: Launch): UtilityProcess {
  const server = utilityProcess.fork(
    path.join(import.meta.dirname, "serve.js"),
    [path.join(folder, "server.js")],
    {
      cwd: folder,
      stdio: "pipe",
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: String(port),
        HOSTNAME: "127.0.0.1",
        WF_EDITION: "app",
        WF_LAUNCH_TOKEN: token,
        WF_LAUNCH_HOST: `127.0.0.1:${port}`,
        WF_APP_VERSION: app.getVersion(),
        WF_APP_CHANNEL: channelOf(app.isPackaged, process.windowsStore),
        ...env,
      },
    },
  );
  logFrom(server.stdout, process.stdout);
  logFrom(server.stderr, process.stderr);
  return server;
}

const STOP_MS = 5_000;

function stopped(server: UtilityProcess): Promise<void> {
  return new Promise((resolve) => {
    const late = setTimeout(resolve, STOP_MS);
    server.once("exit", () => {
      clearTimeout(late);
      resolve();
    });
    server.kill();
  });
}

export async function startServer(folder: string): Promise<Server> {
  const port = await keptPort();
  const token = randomBytes(32).toString("hex");
  const server = launch({
    folder,
    port,
    token,
    env: {
      WF_PROFILE_SOURCE: "live",
      WF_STORE_FILE: path.join(app.getPath("userData"), "store.json"),
    },
  });
  app.on("will-quit", () => server.kill());
  const origin = `http://127.0.0.1:${port}`;
  await answers(`${origin}/connect`, token);
  return { origin, token, child: server };
}

async function dataAnswer(url: string, token: string): Promise<string | null> {
  const deadline = Date.now() + READY_MS;
  while (Date.now() < deadline) {
    const answer = await fetch(url, { headers: { [LAUNCH_HEADER]: token } }).then(
      async (response) =>
        response.ok
          ? null
          : (((await response.json().catch(() => ({}))) as { reason?: string }).reason ??
            `the check answered ${response.status}`),
      () => undefined,
    );
    if (answer !== undefined) return answer;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("The data check did not answer");
}

export async function checkData(folder: string): Promise<string | null> {
  const port = await listenable(0);
  const token = randomBytes(32).toString("hex");
  const server = launch({ folder, port, token, env: { WF_PROFILE_SOURCE: "fixture" } });
  try {
    return await dataAnswer(`http://127.0.0.1:${port}/api/data-check`, token);
  } finally {
    await stopped(server);
  }
}
