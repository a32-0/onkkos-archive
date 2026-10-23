import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import path from "node:path";

const desktop = path.resolve(import.meta.dirname, "..");
const standalone = path.resolve(desktop, "..", ".next", "standalone");

const port = await new Promise((resolve) => {
  const probe = createServer().listen(0, "127.0.0.1", () => {
    const { port: given } = probe.address();
    probe.close(() => resolve(given));
  });
});
const host = `127.0.0.1:${port}`;
const token = randomBytes(32).toString("hex");
const server = spawn(
  process.execPath,
  [path.join(desktop, "dist", "serve.js"), path.join(standalone, "server.js")],
  {
    cwd: standalone,
    stdio: "ignore",
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
      WF_EDITION: "app",
      WF_PROFILE_SOURCE: "fixture",
      WF_LAUNCH_TOKEN: token,
      WF_LAUNCH_HOST: host,
    },
  },
);

const status = (headers) =>
  fetch(`http://${host}/connect`, { headers }).then(
    (response) => response.status,
    () => null,
  );

try {
  const deadline = Date.now() + 30_000;
  let admitted = null;
  while (admitted !== 200 && Date.now() < deadline) {
    admitted = await status({ "x-launch-token": token });
    if (admitted !== 200) await new Promise((resolve) => setTimeout(resolve, 250));
  }
  const refused = await status({});
  const wrong = await status({ "x-launch-token": "0".repeat(64) });
  if (admitted !== 200 || refused !== 403 || wrong !== 403) {
    throw new Error(
      `The guard does not hold: ${admitted} with the secret, ${refused} without, ${wrong} with another`,
    );
  }
  console.warn("The guard holds: 200 with the secret, 403 without it or with another.");
} finally {
  server.kill();
}
