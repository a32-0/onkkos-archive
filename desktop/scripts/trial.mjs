import { execFileSync } from "node:child_process";
import {
  cpSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parse as parseYaml } from "yaml";

const desktop = path.resolve(import.meta.dirname, "..");
const root = path.resolve(desktop, "..");
const trials = path.join(desktop, "release-trial");
const cli = path.join(desktop, "node_modules", "electron-builder", "cli.js");
const PORT = 8789;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const NAME = "Onkko's Archive Trial";

function build(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) {
    throw new Error("trial build needs a version, like 0.0.1");
  }
  const own = parseYaml(readFileSync(path.join(desktop, "electron-builder.yml"), "utf8"));
  const output = path.join(trials, version);
  const config = path.join(trials, `electron-builder-${version}.json`);
  mkdirSync(trials, { recursive: true });
  writeFileSync(
    config,
    JSON.stringify({
      ...own,
      appId: "onkkos-archive-trial",
      productName: NAME,
      extraMetadata: { name: "onkkos-archive-trial", productName: NAME, version },
      afterPack: path.join(desktop, own.afterPack),
      directories: { ...own.directories, output },
      nsis: { ...own.nsis, artifactName: "onkkos-archive-trial-${version}-setup.${ext}" },
      publish: { provider: "generic", url: `${ORIGIN}/updates` },
    }),
  );
  execFileSync(process.execPath, [cli, "--win", "nsis", "--publish", "never", "--config", config], {
    cwd: desktop,
    stdio: "inherit",
  });
}

const CHANGES = {
  broken: (text) => text.replace("type: weekly", "type: monthly"),
  changed: (text) => `${text}# A change the trial serves\n`,
};

async function changedData(kind) {
  const folder = path.join(trials, `data-${kind}`);
  rmSync(folder, { recursive: true, force: true });
  cpSync(path.join(root, "data"), folder, { recursive: true });
  const sources = path.join(folder, "sources.yaml");
  writeFileSync(sources, CHANGES[kind](readFileSync(sources, "utf8")));
  const { writeManifest } = await import(
    pathToFileURL(path.join(root, "scripts", "data-manifest.ts")).href
  );
  writeManifest(folder);
  return folder;
}

async function serve(version, data) {
  const folders = {
    "/updates/": path.join(trials, version ?? ""),
    "/data/": data in CHANGES ? await changedData(data) : path.join(root, "data"),
  };
  if (!version || !existsSync(path.join(folders["/updates/"], "latest.yml"))) {
    throw new Error(`trial serve needs a version built with trial build: ${version}`);
  }
  createServer((request, response) => {
    const url = decodeURIComponent(new URL(request.url ?? "/", ORIGIN).pathname);
    const prefix = Object.keys(folders).find((one) => url.startsWith(one));
    const file = prefix && path.join(folders[prefix], url.slice(prefix.length));
    const inside = file && path.relative(folders[prefix], file).split(path.sep)[0] !== "..";
    if (!inside || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404).end();
      return;
    }
    process.stdout.write(`${request.method} ${url}\n`);
    response.writeHead(200, { "content-length": statSync(file).size });
    createReadStream(file).pipe(response);
  }).listen(PORT, "127.0.0.1", () => {
    process.stdout.write(
      `Serving ${version} at ${ORIGIN}/updates and ${data in CHANGES ? `${data}` : "this tree's"} data at ${ORIGIN}/data\n`,
    );
  });
}

const [command, version, data] = process.argv.slice(2);
if (command === "build") build(version);
else if (command === "serve") await serve(version, data);
else throw new Error("Use: trial build <version> | trial serve <version> [broken | changed]");
