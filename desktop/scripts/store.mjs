import { execFileSync } from "node:child_process";
import path from "node:path";

const IDENTITY = {
  identityName: "STORE_IDENTITY_NAME",
  publisher: "STORE_PUBLISHER",
  publisherDisplayName: "STORE_PUBLISHER_NAME",
};

const missing = Object.values(IDENTITY).filter((name) => !process.env[name]);
if (missing.length > 0) {
  throw new Error(`The Store package needs ${missing.join(", ")}, from Partner Center`);
}

const desktop = path.resolve(import.meta.dirname, "..");
const cli = path.join(desktop, "node_modules", "electron-builder", "cli.js");
const identity = Object.entries(IDENTITY).map(
  ([field, name]) => `-c.appx.${field}=${process.env[name]}`,
);

execFileSync(process.execPath, [cli, "--win", "appx", "--publish", "never", ...identity], {
  cwd: desktop,
  stdio: "inherit",
});
