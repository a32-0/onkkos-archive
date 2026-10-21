import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseLuaLocal, parseLuaModule, parseLuaTable } from "./lua.mjs";

const say = (line) => process.stdout.write(`${line}\n`);

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "vendor");
const WIKI = "https://wiki.warframe.com/index.php";

async function source(name) {
  const response = await fetch(`${WIKI}?title=Module:${encodeURIComponent(name)}/data&action=raw`);
  if (!response.ok) throw new Error(`${response.status} Module:${name}/data`);
  return response.text();
}

async function module(name) {
  return parseLuaModule(await source(name));
}

function plain(text) {
  if (typeof text !== "string") return null;
  const out = text
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/\{\{[^}|]*\|([^}|]*)[^}]*\}\}/g, "$1")
    .replace(/'''?/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return out.length > 0 ? out : null;
}

function list(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    return Object.keys(value)
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => value[key]);
  }
  return [];
}

function buildBlueprints(raw) {
  const out = {};
  for (const table of [raw.Blueprints, raw.Suits]) {
    for (const [key, entry] of Object.entries(table ?? {})) {
      out[key] = {
        result: entry.Result ?? key,
        credits: typeof entry.Credits === "number" ? entry.Credits : null,
        bpCost: typeof entry.BPCost === "number" ? entry.BPCost : null,
        marketCost: typeof entry.MarketCost === "number" ? entry.MarketCost : null,
        seconds: typeof entry.Time === "number" ? entry.Time : null,
        parts: list(entry.Parts).map((part) => ({
          name: String(part.Name),
          count: typeof part.Count === "number" ? part.Count : 1,
          type: String(part.Type ?? "Resource"),
        })),
      };
    }
  }
  return out;
}

function buildNodes(raw) {
  return list(raw.MissionDetails)
    .filter((node) => typeof node.Name === "string")
    .map((node) => ({
      name: node.Name,
      planet: typeof node.Planet === "string" ? node.Planet : null,
      type: typeof node.Type === "string" ? node.Type : null,
      boss: typeof node.Boss === "string" ? node.Boss : null,
      link: typeof node.Link === "string" ? node.Link : node.Name,
      requirements: typeof node.Requirements === "string" ? node.Requirements : null,
      drops: list(node.Drops).map(String),
    }));
}

const LOCATION = /Location:\s*([\s\S]+)$/i;
const SOURCE = /Source:\s*([\s\S]+)$/i;
const LIST_HEAD = /:\s*$/;
const SOURCE_VERB =
  /^(Earn|Earned|Obtained|Dropped|Drops|Found|Gained|Rewarded|Acquired|Purchased|Sold|Cut|Dismantled|Harvested|Mined)\b/;

const SOURCE_CLAUSE = /\b(gained|obtained|dropped|earned) (from|by)\b/i;

function lastParagraph(description) {
  const paragraphs = description.split(/\r?\n\s*\r?\n/).map((one) => one.trim());
  const last = paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : "";
  if (SOURCE_VERB.test(last)) return [last, last];
  const told = [...paragraphs].reverse().find((one) => SOURCE_CLAUSE.test(one));
  return told ? [told, told] : null;
}

function listed(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const [head, ...items] = lines;
  if (head === undefined || items.length === 0 || !LIST_HEAD.test(head)) return text;
  const last = items.pop();
  const names = items.length === 0 ? last : `${items.join(", ")} and ${last}`;
  return `${head.trim()} ${names}.`;
}

function buildResources(raw) {
  const out = {};
  for (const [key, entry] of Object.entries(raw)) {
    if (!entry || typeof entry !== "object" || typeof entry.Name !== "string") continue;
    const description = typeof entry.Description === "string" ? entry.Description : "";
    const where =
      LOCATION.exec(description) ?? SOURCE.exec(description) ?? lastParagraph(description);
    out[entry.Name ?? key] = {
      rarity: typeof entry.Rarity === "string" ? entry.Rarity : null,
      type: typeof entry.Type === "string" ? entry.Type : null,
      location: where ? plain(listed(where[1])) : null,
      link: typeof entry.Link === "string" ? entry.Link : entry.Name,
      image: typeof entry.Image === "string" ? entry.Image : null,
    };
  }
  return out;
}

function buildResearch(raw) {
  const labs = {};
  for (const [key, lab] of Object.entries(raw.Labs ?? {})) labs[key] = lab.Name ?? key;
  const out = {};
  for (const [key, entry] of Object.entries(raw.Research ?? {})) {
    out[key] = {
      lab: labs[entry.Lab] ?? entry.Lab ?? null,
      prereq: typeof entry.Prereq === "string" ? entry.Prereq : null,
      credits: typeof entry.Credits === "number" ? entry.Credits : null,
      seconds: typeof entry.Time === "number" ? entry.Time : null,
      resources: list(entry.Resources).map((resource) => ({
        name: String(resource.Name),
        count: typeof resource.Count === "number" ? resource.Count : 1,
      })),
    };
  }
  return out;
}

function buildVendors(raw) {
  return Object.entries(raw.Vendors ?? {}).map(([key, vendor]) => {
    const ranks = vendor.Ranks ? vendor.Ranks : null;
    return {
      name: vendor.Name ?? key,
      key,
      link: typeof vendor.Link === "string" ? vendor.Link : key,
      currency: typeof vendor.Currency === "string" ? vendor.Currency : null,
      kind: typeof vendor.Type === "string" ? vendor.Type : null,
      offers: list(vendor.Offerings).map((offer) => {
        const [item, type, cost] = list(offer);
        const prereq = offer.Prereq;
        return {
          item: String(item),
          type: String(type ?? ""),
          cost: typeof cost === "number" ? cost : null,
          costs:
            cost && typeof cost === "object"
              ? Object.fromEntries(Object.entries(cost).map(([name, n]) => [name, Number(n)]))
              : null,
          rank: typeof prereq === "number" && ranks ? String(ranks[prereq] ?? prereq) : null,
          quest: typeof prereq === "string" ? prereq.replace(/ \(Quest\)$/, "") : null,
        };
      }),
    };
  });
}

const WEAPON_MODULES = ["primary", "secondary", "melee", "archwing", "companion", "misc"];

async function buildTraits(titles) {
  const out = {};
  for (const name of WEAPON_MODULES) {
    const table = parseLuaModule(await page(`Module:Weapons/data/${name}`));
    for (const [key, entry] of Object.entries(table)) {
      if (!entry || typeof entry !== "object") continue;
      const weapon = entry.Name ?? key;
      titles[weapon] = entry.Link ?? weapon;
      const traits = list(entry.Traits).map(String);
      if (traits.length > 0) out[weapon] = traits;
    }
  }
  return out;
}

const RELIC_TABLE = /\nRelicData = \{/;

function buildRelics(source) {
  const raw = parseLuaTable(source, source.search(RELIC_TABLE) + "\nRelicData = ".length);
  const out = {};
  for (const [key, entry] of Object.entries(raw)) {
    if (!entry || typeof entry !== "object") continue;
    out[`${entry.Name ?? key} Relic`] = {
      drops: list(entry.Drops).map((drop) => ({
        item: String(drop.Item),
        part: String(drop.Part),
        rarity: String(drop.Rarity),
      })),
    };
  }
  return out;
}

const WEEK_SECONDS = 604800;
const ROTATIONS = [
  { key: "normal", variable: "RotatingRewardsIndexNormal", choice: /\{\{WF\|([^}|]+)/g },
  { key: "steelPath", variable: "RotatingRewardsIndexHard", choice: /\{\{Resource\|([^}|]+)/g },
];
const CIRCUIT_TIER = /^\|\s*Tier\s*(\d+)\s*$/;
const CIRCUIT_PART = /Warframe (Neuroptics |Chassis |Systems )?Blueprint/;

function buildCircuit(wikitext) {
  const out = { tiers: {} };
  for (const rotation of ROTATIONS) {
    const define = new RegExp(
      `${rotation.variable}\\|\\{\\{#expr: floor \\(\\(\\(\\{\\{#time: U \\| now \\}\\} - \\{\\{#time: U \\| ([^}]+?) \\}\\}\\) mod \\(${WEEK_SECONDS} \\* (\\d+)\\)\\)`,
    ).exec(wikitext);
    if (!define) throw new Error(`no rotation anchor for ${rotation.key}`);
    const weeks = [];
    const rows = wikitext.split(`{{#var:${rotation.variable}}} | `).slice(1);
    for (const chunk of rows) {
      const index = Number(/^(\d+)/.exec(chunk)?.[1]);
      const body = chunk.split(/\{\{#var:|<\/table>|\n\|\}/)[0];
      const choices = [...body.matchAll(rotation.choice)].map((match) => match[1].trim());
      if (choices.length > 0 && !weeks.some((week) => week.index === index)) {
        weeks.push({ index, choices: [...new Set(choices)] });
      }
    }
    out[rotation.key] = {
      anchor: define[1].trim().replace(/ 00:00:00$/, ""),
      period: Number(define[2]),
      weeks,
    };
  }
  let tier = null;
  for (const line of wikitext.split("\n")) {
    const heading = CIRCUIT_TIER.exec(line);
    if (heading) tier = Number(heading[1]);
    const part = CIRCUIT_PART.exec(line);
    if (part && tier !== null) out.tiers[(part[1] ?? "Blueprint").trim() || "Blueprint"] = tier;
  }
  return out;
}

const INSTALL = /Installing the [^.]*? requires ([^.]+)\./;
const INSTALL_COST = /(\d[\d,]*)(?:''')?\s*\{\{Resource\|([^}|]+)/g;
const CAVALERO = /Purchased from Cavalero for \{\{pc\|(\d+)\}\}/;

async function buildIncarnons(names) {
  const out = {};
  for (const name of names) {
    const text = await page(name).catch(() => "");
    const line = INSTALL.exec(text)?.[1] ?? "";
    const platinum = CAVALERO.exec(text)?.[1];
    const upon = /Upon completion of ([^\n]*?), players can/.exec(text)?.[1] ?? "";
    out[name] = {
      requires: [...upon.matchAll(LINK)].map((match) => match[1].trim()),
      install: [...line.matchAll(INSTALL_COST)].map((match) => ({
        name: match[2].trim(),
        count: Number(match[1].replace(/,/g, "")),
      })),
      platinum: platinum === undefined ? null : Number(platinum),
    };
  }
  return out;
}

const HONORIA_PAGE = "Honoria";
const HONORIA_TABLE = /buildHonoriaTable[^}]*tag=([^|}]+)/;
const PURCHASED_FROM =
  /purchased from (?:\{\{SpoilerText\|)?\[\[([^\]|]+)[^\]]*\]\]\}?\}?,\s*\[\[([^\]|]+)/i;
const REQUIRES = /Requires completion of (.+?)\.(?:\s|$)/;

function buildHonoriaTags(wikitext) {
  const out = {};
  let intro = [];
  for (const line of wikitext.split("\n")) {
    if (/^=+/.test(line)) {
      intro = [];
      continue;
    }
    const tag = HONORIA_TABLE.exec(line)?.[1]?.trim();
    if (!tag) {
      if (line.trim() && !line.startsWith("<!--") && !line.startsWith("*")) intro.push(line.trim());
      continue;
    }
    const text = intro.join(" ");
    const seller = PURCHASED_FROM.exec(text);
    const requires = REQUIRES.exec(text)?.[1] ?? "";
    out[tag] = {
      vendor: seller?.[1]?.trim() ?? null,
      place: seller?.[2]?.trim() ?? null,
      quests: [...requires.matchAll(LINK)].map((match) => match[1].trim()),
      line: sentence(text),
    };
  }
  return out;
}

function addTitles(titles, table, suffix = "", page = null) {
  for (const [key, entry] of Object.entries(table ?? {})) {
    if (!entry || typeof entry !== "object") continue;
    const name = `${entry.Name ?? key}${suffix}`;
    titles[name] = page ?? entry.Link ?? entry.Name ?? key;
  }
}

function buildBaro(raw) {
  const out = {};
  for (const [key, entry] of Object.entries(raw.Items ?? {})) {
    if (!entry || typeof entry !== "object") continue;
    const dates = [...list(entry.OfferingDates), ...list(entry.PcOfferingDates)].map(String).sort();
    out[entry.Name ?? key] = {
      credits: typeof entry.CreditCost === "number" ? entry.CreditCost : null,
      ducats: typeof entry.DucatCost === "number" ? entry.DucatCost : null,
      lastOffered: dates.at(-1) ?? null,
    };
  }
  return out;
}

function buildCompanions(raw) {
  const out = {};
  for (const [key, entry] of Object.entries(raw.Companions ?? {})) {
    if (!entry || typeof entry !== "object" || typeof entry.Type !== "string") continue;
    out[entry.Name ?? key] = entry.Type;
  }
  return out;
}

const PRICE_CODES = { cc: "Credits", sc: "Standing" };

function buildHonorias(raw) {
  const out = {};
  for (const [key, entry] of Object.entries(raw)) {
    if (!entry || typeof entry !== "object") continue;
    const price = Object.entries(entry.Price ?? {}).map(([currency, amount]) => ({
      currency: PRICE_CODES[currency] ?? currency,
      amount: typeof amount === "number" ? amount : Number(String(amount).replace(/,/g, "")),
    }));
    out[`${entry.Name ?? key} Honoria`] = {
      description: sentence(entry.Description ?? ""),
      tags: list(entry.Tags).map(String),
      price: price.filter((one) => Number.isFinite(one.amount)),
    };
  }
  return out;
}

const ADVERSARIES = [
  {
    trait: "Kuva Lich",
    name: "Kuva Lich",
    main: "Kuva Lich/Main",
    gameplay: "Kuva Lich/Gameplay",
  },
  {
    trait: "Tenet",
    name: "Sister of Parvos",
    main: "Sisters of Parvos/Main",
    gameplay: "Sisters of Parvos/Gameplay",
  },
];

const LINK = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;
const SENTENCE_END = /(?<=[.!?])\s+(?=[A-Z"(])/;

async function page(title) {
  const response = await fetch(`${WIKI}?title=${encodeURIComponent(title)}&action=raw`);
  if (!response.ok) throw new Error(`${response.status} ${title}`);
  return response.text();
}

function section(wikitext, heading) {
  const out = [];
  let inside = false;
  for (const line of wikitext.split("\n")) {
    const match = /^==\s*([^=].*?)\s*==\s*$/.exec(line);
    if (match) {
      if (inside) break;
      inside = match[1] === heading;
      continue;
    }
    if (inside) out.push(line);
  }
  return out.filter((line) => /^[A-Za-z']/.test(line.trim()));
}

function sentence(text) {
  const flat = plain(text);
  return flat === null ? null : (flat.split(SENTENCE_END)[0] ?? flat);
}

async function buildAdversaries() {
  const out = [];
  for (const adversary of ADVERSARIES) {
    const main = await page(adversary.main);
    const gameplay = await page(adversary.gameplay);
    const [encounter = "", create = ""] = section(main, "Creation");
    const larva = /'''\[\[([^\]|]+)/.exec(encounter)?.[1] ?? null;
    const access = /Accessing the \[\[([^\]|]+)\]\][^\n]*?requires one rank (\d+)/.exec(main);
    const trade = gameplay
      .split("\n")
      .find((line) => line.includes("Crimson Branch"))
      ?.replace(/^\*+/, "");
    const tradeSentence = trade
      ? (plain(trade)
          ?.split(SENTENCE_END)
          .find((one) => one.includes("Crimson Branch")) ?? null)
      : null;
    out.push({
      trait: adversary.trait,
      name: adversary.name,
      page: adversary.main.replace(/\/Main$/, ""),
      larva,
      links: [...new Set([...encounter.matchAll(LINK)].map((match) => match[1].trim()))],
      encounter: sentence(encounter),
      create: sentence(create),
      trade: tradeSentence,
      intrinsics: access ? { place: access[1], rank: Number(access[2]) } : null,
    });
  }
  return out;
}

function write(file, payload) {
  writeFileSync(path.join(OUT, file), `${JSON.stringify(payload, null, 1)}\n`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  const blueprints = buildBlueprints(await module("Blueprints"));
  const nodes = buildNodes(await module("Missions"));
  const resources = buildResources(parseLuaLocal(await source("Resources"), "ResourceData"));
  const research = buildResearch(await module("Research"));
  const vendors = buildVendors(await module("Vendors"));
  const titles = {};
  const traits = await buildTraits(titles);
  const baro = buildBaro(await module("Baro"));
  const adversaries = await buildAdversaries();
  const relics = buildRelics(await source("Void"));
  const circuit = buildCircuit(await page("The Circuit"));
  const honoriaTags = buildHonoriaTags(await page(HONORIA_PAGE));
  const incarnons = await buildIncarnons(circuit.steelPath.weeks.flatMap((week) => week.choices));
  const companionTable = await module("Companions");
  const companions = buildCompanions(companionTable);
  const honoriaTable = await module("Honorias");
  const honorias = buildHonorias(honoriaTable);
  addTitles(titles, companionTable.Companions);
  addTitles(titles, honoriaTable, " Honoria", HONORIA_PAGE);
  addTitles(titles, parseLuaModule(await page("Module:Cosmetics/data/ephemera")));

  write("wiki-companions.json", { companions });
  write("wiki-honorias.json", { honorias });
  write("wiki-titles.json", { titles });
  write("wiki-relics.json", { relics });
  write("wiki-circuit.json", circuit);
  write("wiki-incarnons.json", { incarnons });
  write("wiki-honoria-tags.json", { tags: honoriaTags });
  write("wiki-blueprints.json", { blueprints });
  write("wiki-nodes.json", { nodes });
  write("wiki-resources.json", { resources });
  write("wiki-research.json", { research });
  write("wiki-vendors.json", { vendors });
  write("wiki-traits.json", { traits });
  write("wiki-baro.json", { baro });
  write("wiki-adversaries.json", { adversaries });

  const manifestPath = path.join(OUT, "manifest.json");
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
  const offers = vendors.reduce((sum, vendor) => sum + vendor.offers.length, 0);
  manifest.wiki = {
    refreshedAt: new Date().toISOString(),
    blueprints: Object.keys(blueprints).length,
    nodes: nodes.length,
    resources: Object.keys(resources).length,
    research: Object.keys(research).length,
    vendors: vendors.length,
    offers,
    traits: Object.keys(traits).length,
    baro: Object.keys(baro).length,
    adversaries: adversaries.length,
    companions: Object.keys(companions).length,
    honorias: Object.keys(honorias).length,
    titles: Object.keys(titles).length,
    relics: Object.keys(relics).length,
  };
  write("manifest.json", manifest);

  say(`${Object.keys(blueprints).length} blueprints, ${nodes.length} nodes`);
  say(`${Object.keys(resources).length} resources, ${Object.keys(research).length} research`);
  say(`${vendors.length} vendors carrying ${offers} offers`);
}

await main();
