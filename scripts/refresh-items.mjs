import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Items from "@wfcd/items";

const say = (line) => process.stdout.write(`${line}\n`);

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "vendor", "items.json");
const PACKAGE = path.join(ROOT, "node_modules", "@wfcd", "items");
const COMPONENTS = "Components";
const SKIPPED = new Set(["All", "Enemy", COMPONENTS]);

const DROP = { location: true, type: true, chance: true, rarity: true };
const FIELDS = {
  uniqueName: true,
  name: true,
  type: true,
  category: true,
  productCategory: true,
  masteryReq: true,
  maxLevelCap: true,
  imageName: true,
  masterable: true,
  isPrime: true,
  vaulted: true,
  bpCost: true,
  marketCost: true,
  buildPrice: true,
  buildTime: true,
  buildQuantity: true,
  wikiaUrl: true,
  releaseDate: true,
  introduced: { name: true, url: true, date: true, parent: true, aliases: true },
  drops: DROP,
  components: { uniqueName: true, name: true, itemCount: true, imageName: true, drops: DROP },
  rewards: { chance: true, rarity: true, item: { name: true } },
};

function kept(value, fields) {
  if (Array.isArray(value)) return value.map((entry) => kept(entry, fields));
  if (fields === true || value === null || typeof value !== "object") return value;
  const out = {};
  for (const [key, inner] of Object.entries(fields)) {
    if (value[key] !== undefined) out[key] = kept(value[key], inner);
  }
  return out;
}

function categories() {
  const names = readdirSync(path.join(PACKAGE, "data", "json"))
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.slice(0, -".json".length))
    .filter((name) => !SKIPPED.has(name));
  return [...names.filter((name) => name !== COMPONENTS), COMPONENTS];
}

function main() {
  const { version } = JSON.parse(readFileSync(path.join(PACKAGE, "package.json"), "utf8"));
  const blocks = [];
  let count = 0;
  for (const category of categories()) {
    const items = new Items({ category: [category], ignoreEnemies: true });
    count += items.length;
    const lines = items.map((item) => JSON.stringify(kept(item, FIELDS)));
    blocks.push(`  ${JSON.stringify(category)}: [\n${lines.join(",\n")}\n  ]`);
  }
  const head = `{\n "version": ${JSON.stringify(version)},\n "categories": {\n`;
  writeFileSync(OUT, `${head}${blocks.join(",\n")}\n }\n}\n`);
  say(`${count} items from @wfcd/items ${version} in ${blocks.length} categories`);
}

main();
