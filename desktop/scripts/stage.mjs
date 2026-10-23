import { execSync } from "node:child_process";
import { cpSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "..");
const standalone = path.join(root, ".next", "standalone");

execSync("pnpm build", {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, WF_BUILD_TARGET: "app", WF_PROFILE_SOURCE: "live" },
});

if (!existsSync(path.join(standalone, "server.js"))) {
  throw new Error("The standalone build wrote no server.js");
}
cpSync(path.join(root, "public"), path.join(standalone, "public"), { recursive: true });
cpSync(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"), {
  recursive: true,
});
