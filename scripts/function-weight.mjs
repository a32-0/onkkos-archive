import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const say = (line) => process.stdout.write(`${line}\n`);

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SERVER = path.join(ROOT, ".next", "server", "app");
const LIMIT_MB = 80;
const MB = 1_000_000;
const TRACE = ".nft.json";
const ROUTE_FILE = /[\\/](page|route)\.js\.nft\.json$/;

function traces(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...traces(full));
    else if (entry.name.endsWith(TRACE) && ROUTE_FILE.test(full)) found.push(full);
  }
  return found;
}

function weight(trace) {
  const { files } = JSON.parse(readFileSync(trace, "utf8"));
  const seen = new Set();
  let bytes = 0;
  for (const file of files) {
    const absolute = path.resolve(path.dirname(trace), file);
    if (!existsSync(absolute)) continue;
    const real = realpathSync(absolute);
    if (seen.has(real)) continue;
    seen.add(real);
    const stat = statSync(real);
    if (stat.isFile()) bytes += stat.size;
  }
  return bytes;
}

function route(trace) {
  const relative = path.relative(SERVER, path.dirname(trace)).split(path.sep).join("/");
  return `/${relative}`.replace(/\/$/, "") || "/";
}

if (!existsSync(SERVER)) {
  say("No build found: run pnpm build first.");
  process.exit(1);
}

const rows = traces(SERVER)
  .map((trace) => ({ route: route(trace), mb: weight(trace) / MB }))
  .sort((a, b) => b.mb - a.mb);
for (const row of rows) say(`${row.mb.toFixed(1).padStart(6)} MB  ${row.route}`);

const heavy = rows.filter((row) => row.mb > LIMIT_MB);
if (heavy.length > 0) {
  say(`${heavy.length} of ${rows.length} functions weigh more than ${LIMIT_MB} MB.`);
  process.exit(1);
}
say(`Every function is under ${LIMIT_MB} MB.`);
