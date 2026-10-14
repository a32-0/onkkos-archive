import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

import Items from "@wfcd/items";
import path from "node:path";
import { fileURLToPath } from "node:url";

const say = (line) => process.stdout.write(`${line}\n`);

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "vendor");

const DROPS = "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data";
const WIKI = "https://wiki.warframe.com/index.php";
const WIKI_API = "https://wiki.warframe.com/api.php";

const BOUNTY_PLACES = {
  "cetusBountyRewards.json": "Earth",
  "solarisBountyRewards.json": "Venus",
  "deimosRewards.json": "Deimos",
  "entratiLabRewards.json": "Deimos",
  "zarimanRewards.json": "Zariman",
  "hexRewards.json": "Höllvania",
};

async function getJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function getText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

function collectRewards(value, into) {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const entry of value) {
      if (entry && typeof entry.itemName === "string") into.push(entry);
      else collectRewards(entry, into);
    }
    return;
  }
  if (typeof value === "object")
    for (const inner of Object.values(value)) collectRewards(inner, into);
}

function rotationRows(rewards) {
  const rows = [];
  if (!rewards) return rows;
  if (Array.isArray(rewards)) {
    for (const entry of rewards) {
      if (entry && typeof entry.itemName === "string") {
        rows.push({
          rotation: null,
          item: entry.itemName,
          chance: entry.chance ?? null,
          rarity: entry.rarity ?? null,
        });
      }
    }
    return rows;
  }
  for (const [rotation, list] of Object.entries(rewards)) {
    const flat = [];
    collectRewards(list, flat);
    for (const entry of flat) {
      rows.push({
        rotation,
        item: entry.itemName,
        chance: entry.chance ?? null,
        rarity: entry.rarity ?? null,
        stage: entry.stage ?? null,
      });
    }
  }
  return rows;
}

function buildMissions(raw) {
  const places = {};
  for (const [place, nodes] of Object.entries(raw.missionRewards)) {
    const entries = [];
    for (const [node, detail] of Object.entries(nodes)) {
      const rows = rotationRows(detail.rewards);
      if (rows.length === 0) continue;
      entries.push({
        node,
        mission: detail.gameMode ?? null,
        isEvent: detail.isEvent === true,
        rewards: rows,
      });
    }
    if (entries.length > 0) places[place] = entries;
  }
  return places;
}

function buildBounty(raw, place) {
  const root = raw[Object.keys(raw)[0]];
  const entries = [];
  for (const tier of root) {
    const rows = rotationRows(tier.rewards);
    if (rows.length === 0) continue;
    entries.push({ node: tier.bountyLevel, mission: "Bounty", isEvent: false, rewards: rows });
  }
  return { place, entries };
}

function parseRegionResources(lua) {
  const start = lua.indexOf('["RegionResources"]');
  if (start < 0) throw new Error("RegionResources not found");
  const open = lua.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (let i = open; i < lua.length; i += 1) {
    if (lua[i] === "{") depth += 1;
    if (lua[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const body = lua.slice(open + 1, end);
  const out = {};
  const rowRe = /(?:\[['"](.+?)['"]\]|(\w+))\s*=\s*\{([^}]*)\}/g;
  let match = rowRe.exec(body);
  while (match !== null) {
    const place = (match[1] ?? match[2]).trim();
    const items = [...match[3].matchAll(/"(.*?)"/g)].map((m) => m[1]).filter(Boolean);
    if (items.length > 0) out[place] = items;
    match = rowRe.exec(body);
  }
  return out;
}

function updateNames() {
  const names = new Set();
  const yaml = readFileSync(path.join(ROOT, "data", "grafo.yaml"), "utf8");
  const block = yaml.slice(yaml.indexOf("update_names:"));
  for (const match of block.matchAll(/^\s*name:\s*"(.+?)"/gm)) names.add(match[1]);

  const spine = readFileSync(path.join(ROOT, "data", "narrative_spine.yaml"), "utf8");
  for (const match of spine.matchAll(/^\s*-?\s*quest:\s*"(.+?)"/gm)) names.add(match[1]);
  for (const match of spine.matchAll(/^\s*-?\s*wiki:\s*"(.+?)"/gm)) names.add(match[1]);

  const raw = new Items({ ignoreEnemies: true });
  for (const item of raw) {
    for (const alias of item.introduced?.aliases ?? []) {
      if (typeof alias !== "string") continue;
      if (alias.length <= 3 || /^[0-9]/.test(alias) || /^Update /.test(alias)) continue;
      names.add(alias);
    }
  }
  return [...names];
}

async function updateArt() {
  const names = updateNames();
  const art = {};
  for (let i = 0; i < names.length; i += 40) {
    const batch = names.slice(i, i + 40);
    const url =
      `${WIKI_API}?action=query&prop=pageimages&piprop=original|thumbnail` +
      `&pithumbsize=960&redirects=1&format=json&titles=${encodeURIComponent(batch.join("|"))}`;
    const payload = await getJson(url);
    const back = new Map();
    for (const entry of payload.query?.normalized ?? []) back.set(entry.to, entry.from);
    for (const entry of payload.query?.redirects ?? []) back.set(entry.to, entry.from);
    for (const page of Object.values(payload.query?.pages ?? {})) {
      const source = page.original?.source ?? page.thumbnail?.source ?? null;
      if (source === null) continue;
      art[back.get(page.title) ?? page.title] = source;
    }
  }
  return { art, asked: names.length };
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  const info = await getJson(`${DROPS}/info.json`);
  const missions = buildMissions(await getJson(`${DROPS}/missionRewards.json`));

  for (const [file, place] of Object.entries(BOUNTY_PLACES)) {
    const { entries } = buildBounty(await getJson(`${DROPS}/${file}`), place);
    missions[place] = [...(missions[place] ?? []), ...entries];
  }

  const lua = await getText(`${WIKI}?title=Module:Missions/data&action=raw`);
  const regionResources = parseRegionResources(lua);

  const { art, asked } = await updateArt();

  const placeCount = Object.keys(missions).length;
  const nodeCount = Object.values(missions).reduce((sum, list) => sum + list.length, 0);
  const rewardCount = Object.values(missions).reduce(
    (sum, list) => sum + list.reduce((inner, node) => inner + node.rewards.length, 0),
    0,
  );

  writeFileSync(
    path.join(OUT, "place-rewards.json"),
    `${JSON.stringify({ places: missions }, null, 1)}\n`,
  );
  writeFileSync(
    path.join(OUT, "region-resources.json"),
    `${JSON.stringify({ regions: regionResources }, null, 1)}\n`,
  );
  writeFileSync(
    path.join(OUT, "update-art.json"),
    `${JSON.stringify({ art }, null, 1)}
`,
  );

  writeFileSync(
    path.join(OUT, "manifest.json"),
    `${JSON.stringify(
      {
        dropDataHash: info.hash,
        dropDataModified: new Date(info.modified).toISOString(),
        refreshedAt: new Date().toISOString(),
        places: placeCount,
        nodes: nodeCount,
        rewards: rewardCount,
        regions: Object.keys(regionResources).length,
        updateArt: Object.keys(art).length,
        updateNamesAsked: asked,
      },
      null,
      1,
    )}\n`,
  );

  say(
    `drop tables built ${new Date(info.modified).toISOString().slice(0, 10)} (hash ${info.hash.slice(0, 8)})`,
  );
  say(`${placeCount} places, ${nodeCount} nodes, ${rewardCount} rewards`);
  say(`${Object.keys(regionResources).length} regions with a canonical resource list`);
  say(`${Object.keys(art).length} of ${asked} update names resolved to wiki art`);
}

await main();
