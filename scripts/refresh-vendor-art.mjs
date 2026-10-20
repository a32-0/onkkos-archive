import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const say = (line) => process.stdout.write(`${line}\n`);

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "vendor");

const WIKI_API = "https://wiki.warframe.com/api.php";
const STANDING = "Standing";
const STOCK = "Stock (";

async function getJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

function standingVendors() {
  const { vendors } = JSON.parse(readFileSync(path.join(OUT, "wiki-vendors.json"), "utf8"));
  return vendors.filter(
    (vendor) => vendor.currency === STANDING || vendor.currency?.startsWith(STOCK),
  );
}

async function main() {
  const vendors = standingVendors();
  const byLink = new Map(vendors.map((vendor) => [vendor.link, vendor]));
  const links = [...byLink.keys()];
  const art = {};
  for (let i = 0; i < links.length; i += 40) {
    const batch = links.slice(i, i + 40);
    const url =
      `${WIKI_API}?action=query&prop=pageimages&piprop=original|thumbnail` +
      `&pithumbsize=480&redirects=1&format=json&titles=${encodeURIComponent(batch.join("|"))}`;
    const payload = await getJson(url);
    const back = new Map();
    for (const entry of payload.query?.normalized ?? []) back.set(entry.to, entry.from);
    for (const entry of payload.query?.redirects ?? []) back.set(entry.to, entry.from);
    for (const page of Object.values(payload.query?.pages ?? {})) {
      const source = page.original?.source ?? page.thumbnail?.source ?? null;
      const vendor = byLink.get(back.get(page.title) ?? page.title);
      if (source === null || !vendor) continue;
      art[vendor.name] = source;
      if (vendor.currency !== STANDING) art[vendor.currency] = source;
    }
  }
  const sorted = Object.fromEntries(Object.entries(art).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(path.join(OUT, "vendor-art.json"), `${JSON.stringify({ art: sorted }, null, 1)}\n`);
  say(`${Object.keys(sorted).length} names resolved to wiki art for ${vendors.length} vendors`);
}

await main();
