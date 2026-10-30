import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const say = (line) => process.stdout.write(`${line}\n`);

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "vendor");

const WIKI_API = "https://wiki.warframe.com/api.php";
const STANDING = "Standing";
const STOCK = "Stock (";
const PAGES = ["Credits"];
const ROTATION_SPLIT = /,\s*Rotation\s+/;
const NOT_A_SOURCE = /\/|\bBounty\b| Relic(\s*\(|$)/;

async function getJson(url, tries = 3) {
  const response = await fetch(url, { headers: { accept: "application/json" } }).catch((error) => {
    if (tries > 1) return null;
    throw error;
  });
  if (response === null) return getJson(url, tries - 1);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

function standingVendors() {
  const { vendors } = JSON.parse(readFileSync(path.join(OUT, "wiki-vendors.json"), "utf8"));
  return vendors.filter(
    (vendor) => vendor.currency === STANDING || vendor.currency?.startsWith(STOCK),
  );
}

function sourceNames() {
  const { categories } = JSON.parse(readFileSync(path.join(OUT, "items.json"), "utf8"));
  const names = new Set();
  for (const item of Object.values(categories).flat()) {
    const drops = [
      ...(item.drops ?? []),
      ...(item.components ?? []).flatMap((one) => one.drops ?? []),
    ];
    for (const drop of drops) {
      const location = drop.location?.trim();
      if (!location || NOT_A_SOURCE.test(location)) continue;
      names.add(baseOf(location.split(ROTATION_SPLIT)[0]));
    }
  }
  return [...names].filter((name) => !name.includes(", "));
}

function baseOf(name) {
  return name.replace(/\s*\([^)]*\)$/, "").trim();
}

async function pages(titles) {
  const found = new Map();
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40);
    const url =
      `${WIKI_API}?action=query&prop=pageimages|categories&piprop=original|thumbnail` +
      `&pithumbsize=480&cllimit=max&redirects=1&format=json&titles=${encodeURIComponent(batch.join("|"))}`;
    const payload = await getJson(url);
    const next = new Map();
    for (const entry of payload.query?.normalized ?? []) next.set(entry.from, entry.to);
    for (const entry of payload.query?.redirects ?? []) next.set(entry.from, entry.to);
    const byTitle = new Map();
    for (const page of Object.values(payload.query?.pages ?? {})) {
      if (page.missing !== undefined) continue;
      byTitle.set(page.title, {
        art: page.original?.source ?? page.thumbnail?.source ?? null,
        categories: (page.categories ?? []).map((one) => one.title.replace(/^Category:/, "")),
      });
    }
    for (const asked of batch) {
      let title = asked;
      for (let hop = 0; hop < 3 && next.has(title); hop += 1) title = next.get(title);
      const page = byTitle.get(title);
      if (page) found.set(asked, page);
    }
  }
  return found;
}

const VARIANTS = new Set([
  "Amalgam",
  "Ancient",
  "Apex",
  "Arid",
  "Ashen",
  "Asteroid",
  "Axio",
  "Basal",
  "Bladeswarm",
  "Bloodfrenzy",
  "Carrion",
  "Coastal",
  "Commandeered",
  "Common",
  "Corrupted",
  "Councilor",
  "Deimos",
  "Demolisher",
  "Detron",
  "Drekar",
  "Elite",
  "Exo",
  "Feral",
  "Fog",
  "Frontier",
  "Ghost",
  "Gyre",
  "Juno",
  "Juvenile",
  "Kosma",
  "Kuva",
  "Lt",
  "Manic",
  "Mature",
  "Mite",
  "Mutalist",
  "Narmer",
  "Nascent",
  "Nul",
  "Nullifier",
  "Orm",
  "Prod",
  "Rogue",
  "Scrofa",
  "Slo",
  "Splendid",
  "Taro",
  "Terra",
  "The",
  "Thermic",
  "Tusk",
  "Vapos",
  "Venin",
]);

const SMALL = new Set(["Of", "The", "And", "For", "To", "In"]);
const ACTIVITY = new Set([
  "Missions",
  "Mission Nodes",
  "Assassination Missions",
  "Event",
  "Mechanics",
  "Planets",
  "Landscape",
  "Quests",
]);
const OBJECT = new Set(["Objects", "Resources", "Key Resources", "Mission Locator"]);
const OBJECT_NAME =
  /\b(Container|Crate|Cache|Caches|Chests|Coffer|Carrypod|Omnipak|Hoard|Reserve|Cannister|Cluster|Formation|Clump|Cask)$/;
const ACTIVITY_NAME =
  /:|\bRewards$|^(Void Storm|Faceoff|Duviri |Granum|Extended Granum|Nightmare Granum|Derelict|Recover |Help |Sentient Eidolons)|Assassinat/;
const NEW_WAR_STAGES = new Set([
  "Another Betrayer",
  "Family Reunion",
  "Hot Mess",
  "Table For Two",
  "The Aftermath",
  "Time's Up",
]);

const FILE = "File:";
const WIKI_ART = {
  "Anarch Arcus Lustratus": "Anarch Arcus",
  "Bladeswarm Derivator": "File:DerivatorCrewman.png",
  "Bloodfrenzy Powerclaw": "File:NightwatchPowerclaw.png",
  "Bloodfrenzy Vertec": "File:AuraxVertec.png",
  "Brachiolyst Disperser": "File:Brachiolyst.png",
  "Commandeered Ash Prime": "Ash Prime",
  "Commandeered Caliban Prime": "Caliban Prime",
  "Commandeered Ember Prime": "Ember Prime",
  "Commandeered Mesa Prime": "Mesa Prime",
  "Commandeered Protea Prime": "Protea Prime",
  "Commandeered Trinity Prime": "Trinity Prime",
  "Commandeered Volt Prime": "Volt Prime",
  "Corpus Mining Turret": "File:Corpus Mining Turret.jpg",
  Erra: "File:Erra.png",
  "Eximus Enemy": "Eximus",
  "Gox Scavenger": "File:GOX SCAVENGER (CALL OF THE TEMPESTARII).jpg",
  "Grokdrul Drum": "File:GrokdrulDrum.png",
  "Infested Corpus": "File:Infested Corpus WB.png",
  "Infested Grineer": "File:Infested Grineer WB.png",
  "Kuva Lich Agor Rok": "Kuva Lich",
  "Narmer Crewman Warden": "Narmer Crewman",
  "Narmer Demolisher Gunner": "File:DemolisherHeavyGunner.png",
  "Narmer Gunner Warden": "File:Narmer Gunner Warden.jpg",
  "Narmer Sensolyst Drone": "File:Narmer Sensolyst Drone.png",
  "Narmer Tech Ranger": "File:NarmerTechRanger.png",
  "Nauseous Void Shade": "File:Void Shade.jpg",
  "Orb Vallis - Enrichment Labs Enemies": "Orb Vallis",
  "Orb Vallis - Spaceport Enemies": "Orb Vallis",
  "Orb Vallis - Temple of Profit Enemies": "Orb Vallis",
  "Profit-Taker": "Profit-Taker Orb",
  "Ryoku Shadow Clone Master": "File:Ryoku Shadow Clone Master.png",
  "Scaldra Ti-92": "Scaldra TI-92",
  "Scrofa Provisor": "Terra Provisor",
  "Shield Drone": "Shield Osprey",
  "Special Duty Coildrive": "File:Special Duty Coildrive (Orb Vallis).jpg",
  "Terra Cestra Manker": "Terra Manker",
  "Vallis Surveillance Drone": "File:VallisSurveillanceDrone.png",
};

async function files(titles) {
  const found = new Map();
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40);
    const url =
      `${WIKI_API}?action=query&prop=imageinfo&iiprop=url&iiurlwidth=480` +
      `&format=json&titles=${encodeURIComponent(batch.join("|"))}`;
    const payload = await getJson(url);
    const back = new Map();
    for (const entry of payload.query?.normalized ?? []) back.set(entry.to, entry.from);
    for (const page of Object.values(payload.query?.pages ?? {})) {
      const info = page.imageinfo?.[0];
      if (info) found.set(back.get(page.title) ?? page.title, info.thumburl ?? info.url);
    }
  }
  return found;
}

async function wikiArt(names) {
  const titles = names.map((name) => WIKI_ART[name]);
  const drawn = await files(titles.filter((title) => title.startsWith(FILE)));
  const found = await pages(titles.filter((title) => !title.startsWith(FILE)));
  return new Map(
    names.map((name) => {
      const title = WIKI_ART[name];
      return [name, (title.startsWith(FILE) ? drawn.get(title) : found.get(title)?.art) ?? null];
    }),
  );
}

function spelled(name) {
  const words = name.replace(/^Lt /, "Lieutenant ").split(" ");
  return words
    .map((word, index) => {
      if (index > 0 && SMALL.has(word)) return word.toLowerCase();
      if (index > 0 && index === words.length - 1 && /^[A-Z][a-z]$/.test(word))
        return word.toUpperCase();
      if (word === "Moa") return "MOA";
      return word
        .replace(/-([A-Z][a-z])$/, (_, end) => `-${end.toUpperCase()}`)
        .replace(/'([A-Z])/, (_, letter) => `'${letter.toLowerCase()}`);
    })
    .join(" ");
}

function shorter(name) {
  const [first, ...rest] = name.split(" ");
  return rest.length > 0 && VARIANTS.has(first) ? rest.join(" ") : null;
}

function kindOf(categories) {
  if (categories.includes("Enemies")) return "enemy";
  if (categories.some((one) => ACTIVITY.has(one))) return "activity";
  if (categories.some((one) => OBJECT.has(one))) return "object";
  return "enemy";
}

function guessed(name) {
  if (OBJECT_NAME.test(name)) return "object";
  if (ACTIVITY_NAME.test(name) || NEW_WAR_STAGES.has(name)) return "activity";
  return "enemy";
}

async function sources() {
  const names = sourceNames();
  const out = new Map();
  let asking = new Map(names.map((name) => [name, [name, spelled(name)]]));
  while (asking.size > 0) {
    const found = await pages([...new Set([...asking.values()].flat())]);
    const next = new Map();
    for (const [name, titles] of asking) {
      const page = titles.map((title) => found.get(title)).find(Boolean);
      if (page) {
        const named = guessed(name);
        out.set(name, { kind: named === "enemy" ? kindOf(page.categories) : named, art: page.art });
        continue;
      }
      const less = shorter(titles[0]);
      if (less) next.set(name, [less, spelled(less)]);
      else out.set(name, { kind: guessed(name), art: null });
    }
    asking = next;
  }
  const missing = [...out].filter(([name, one]) => one.art === null && WIKI_ART[name]);
  const chosen = await wikiArt(missing.map(([name]) => name));
  for (const [name, one] of missing) one.art = chosen.get(name);
  const sorted = Object.fromEntries([...out].sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(
    path.join(OUT, "drop-sources.json"),
    `${JSON.stringify({ sources: sorted }, null, 1)}\n`,
  );
  const kinds = {};
  for (const { kind } of out.values()) kinds[kind] = (kinds[kind] ?? 0) + 1;
  const drawn = [...out.values()].filter((one) => one.art !== null).length;
  say(`${out.size} drop sources read from the wiki, ${drawn} with art: ${JSON.stringify(kinds)}`);
}

async function main() {
  const vendors = standingVendors();
  const byLink = new Map(vendors.map((vendor) => [vendor.link, vendor]));
  const links = [...byLink.keys(), ...PAGES];
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
      const asked = back.get(page.title) ?? page.title;
      if (source !== null && PAGES.includes(asked)) art[asked] = source;
      const vendor = byLink.get(asked);
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
await sources();
