import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import Items from "@wfcd/items";
import worldstateData from "warframe-worldstate-data";
import { parse as parseYaml } from "yaml";

import { INVENTORY_FIELDS, PRESENCE_FIELDS, PROFILE_FIELDS } from "../src/domain/profile/fields.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const say = (line) => process.stdout.write(`${line}\n`);

const PRESETS = {
  cy: { name: "Cy", out: "fixtures/profile-cy.json" },
  ordis: {
    name: "Ordis",
    until: "Mercury",
    mr: "2",
    created: "2026-08-01",
    out: "fixtures/profile-ordis.json",
  },
};

const STARTERS = [
  "Excalibur",
  "Mk1-Braton",
  "Mk1-Paris",
  "Mk1-Strun",
  "Mk1-Kunai",
  "Mk1-Furis",
  "Mk1-Bo",
  "Mk1-Furax",
];

const RANK_HEADROOM = 15;

const CATEGORIES = [
  "Warframes",
  "Primary",
  "Secondary",
  "Melee",
  "Arch-Gun",
  "Arch-Melee",
  "Archwing",
  "Sentinels",
  "SentinelWeapons",
  "Pets",
  "Misc",
];

const SUIT_CATEGORIES = new Set(["Suits", "MechSuits", "SpaceSuits", "Sentinels", "KubrowPets"]);
const STAR_CHART_TAG = /^(SolNode|SettlementNode|ClanNode)\d+$/;
const REGION_RE = /\(([^)]+)\)$/;
const NIGHTWAVE_TAG = /^(RadioLegion|EventSyndicate)/;

const { values } = parseArgs({
  options: {
    preset: { type: "string" },
    from: { type: "string" },
    out: { type: "string" },
    name: { type: "string" },
    until: { type: "string" },
    mr: { type: "string" },
    created: { type: "string" },
    operator: { type: "boolean", default: false },
  },
});

const options = { ...(values.preset ? PRESETS[values.preset] : {}), ...definedOnly(values) };
if (values.preset && !PRESETS[values.preset]) fail(`unknown preset ${values.preset}`);
if (!options.from || !options.out || !options.name) {
  fail("needs --from, --out and --name (or --preset cy|ordis with --from)");
}

const source = JSON.parse(readFileSync(path.resolve(ROOT, options.from), "utf8"));
const full = source.Results?.[0];
if (!full) fail(`${options.from} has no Results[0]`);

const order = parseYaml(
  readFileSync(path.join(ROOT, "data", "grafo.yaml"), "utf8"),
).star_chart_order;
const cutIndex = options.until ? order.findIndex((entry) => entry.planet === options.until) : -1;
if (options.until && cutIndex < 0) fail(`${options.until} is not on star_chart_order`);
const cut = cutIndex >= 0;
const mastery = options.mr === undefined ? null : Number.parseInt(options.mr, 10);
const evidence = evidenceOf(
  parseYaml(readFileSync(path.join(ROOT, "data", "quest_evidence.yaml"), "utf8")).rules,
);
if (mastery !== null && !(mastery >= 0 && mastery <= 40)) fail("--mr must be 0..40");

const inventory = { XPInfo: trimArsenal(full.LoadOutInventory?.XPInfo ?? []) };
const kept = {
  DisplayName: options.name,
  PlayerLevel: mastery ?? full.PlayerLevel,
  Created: options.created ? mongoDate(options.created) : full.Created,
  Missions: cut ? trimMissions(full.Missions ?? []) : (full.Missions ?? []),
  Affiliations: trimAffiliations(full.Affiliations ?? []),
  LoadOutInventory: Object.fromEntries(INVENTORY_FIELDS.map((field) => [field, inventory[field]])),
  UnlockedOperator:
    (!cut || options.operator) && typeof full.UnlockedOperator === "boolean"
      ? full.UnlockedOperator
      : undefined,
  GuildId: !cut && full.GuildId ? full.GuildId : undefined,
};
const unbuilt = [
  ...PROFILE_FIELDS.filter((field) => !(field in kept)),
  ...INVENTORY_FIELDS.filter((field) => !(field in inventory)),
];
if (unbuilt.length > 0)
  fail(`fields.ts lists ${unbuilt.join(", ")}, which this script does not build`);

for (const field of PRESENCE_FIELDS) if (kept[field] !== undefined) kept[field] = true;
const out = Object.fromEntries(
  PROFILE_FIELDS.filter((field) => kept[field] !== undefined).map((field) => [field, kept[field]]),
);

writeFileSync(
  path.join(ROOT, options.out),
  `${JSON.stringify({ Results: [out] }, null, 2)}\n`,
  "utf8",
);
say(
  `${options.out}: ${out.DisplayName}, MR ${out.PlayerLevel}, ${out.Missions.length} missions, ` +
    `${out.LoadOutInventory.XPInfo.length} items, ${out.Affiliations.length} syndicates`,
);

function trimMissions(missions) {
  const allowed = new Set(order.slice(0, cutIndex + 1).map((entry) => entry.planet));
  const junctions = new Set(
    order
      .slice(0, cutIndex + 1)
      .map((entry) => entry.junction_tag)
      .filter(Boolean),
  );
  return missions
    .filter((mission) => {
      if (junctions.has(mission.Tag)) return true;
      if (!STAR_CHART_TAG.test(mission.Tag) || evidence.missions.has(mission.Tag)) return false;
      const node = worldstateData.solNodes[mission.Tag];
      if (evidence.types.some((type) => node?.type?.includes(type))) return false;
      const region = REGION_RE.exec(node?.value ?? "")?.[1];
      return region !== undefined && allowed.has(region);
    })
    .map(({ Tag, Completes }) => ({ Tag, Completes: Math.min(Completes ?? 1, 3) }));
}

function trimAffiliations(affiliations) {
  if (!cut && mastery === null) return affiliations;
  const cap = mastery === null ? Infinity : Math.floor(mastery / 6);
  return affiliations
    .filter((entry) => !evidence.affiliations.has(entry.Tag) && !NIGHTWAVE_TAG.test(entry.Tag))
    .map((entry) => {
      const title = Math.max(-cap, Math.min(cap, entry.Title ?? 0));
      return title === entry.Title ? entry : { Tag: entry.Tag, Standing: 0, Title: title };
    })
    .filter((entry) => entry.Title !== 0);
}

function evidenceOf(rules) {
  const pick = (kind, key) =>
    rules.filter((rule) => rule.evidence?.kind === kind).map((rule) => rule.evidence[key]);
  return {
    affiliations: new Set(pick("affiliation", "tag")),
    missions: new Set(pick("mission", "tag")),
    types: pick("mission_type", "type"),
    items: new Set(pick("item", "type")),
  };
}

function trimArsenal(xpInfo) {
  const kept = cut ? xpInfo.filter((entry) => !evidence.items.has(entry.ItemType)) : xpInfo;
  return mastery === null ? kept : fitMastery(kept);
}

function fitMastery(xpInfo) {
  const catalog = new Map();
  for (const item of new Items({ category: CATEGORIES, ignoreEnemies: true })) {
    if (item.uniqueName && !catalog.has(item.uniqueName)) catalog.set(item.uniqueName, item);
  }

  const floor = 2500 * mastery * mastery;
  const ceiling = 2500 * (mastery + 1) * (mastery + 1) - 1;
  const starterRank = (name) => {
    const index = STARTERS.indexOf(name);
    return index < 0 ? STARTERS.length : index;
  };

  const candidates = xpInfo
    .map((entry) => ({ entry, item: catalog.get(entry.ItemType) }))
    .filter(({ item }) => item && (item.masteryReq ?? 0) <= mastery)
    .sort(
      (a, b) =>
        starterRank(a.item.name) - starterRank(b.item.name) ||
        Number(a.item.isPrime === true) - Number(b.item.isPrime === true) ||
        (a.item.masteryReq ?? 0) - (b.item.masteryReq ?? 0) ||
        a.item.name.localeCompare(b.item.name),
    );

  const kept = [];
  let total = 0;
  for (const { entry, item } of candidates) {
    if (total >= floor) break;
    const factor = SUIT_CATEGORIES.has(item.productCategory) ? 1000 : 500;
    const perRank = factor === 1000 ? 200 : 100;
    const maxRank = item.maxLevelCap > 0 ? item.maxLevelCap : 30;
    const rank = Math.min(maxRank, Math.floor(Math.sqrt((entry.XP ?? 0) / factor)));
    const room = Math.floor((ceiling - total) / perRank);
    const use = Math.min(rank, room, RANK_HEADROOM + mastery);
    if (use <= 0) continue;
    kept.push({ ItemType: entry.ItemType, XP: use === rank ? entry.XP : factor * use * use });
    total += use * perRank;
  }
  return kept;
}

function mongoDate(day) {
  const time = Date.parse(`${day}T00:00:00Z`);
  if (!Number.isFinite(time)) fail(`--created ${day} is not a date`);
  return { $date: { $numberLong: String(time) } };
}

function definedOnly(record) {
  return Object.fromEntries(
    Object.entries(record).filter(
      ([key, value]) => value !== undefined && key !== "preset" && value !== false,
    ),
  );
}

function fail(message) {
  process.stderr.write(`trim-profile: ${message}\n`);
  process.exit(1);
}
