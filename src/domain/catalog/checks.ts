import { circuitStatus, type CircuitMode } from "@/domain/catalog/circuit";
import type { CollectibleView } from "@/domain/catalog/collectibles";
import { findCollectible, isCatalogued, type CatalogData } from "@/domain/catalog/data";
import type { Dossier } from "@/domain/catalog/dossier";
import { BLUEPRINT_ART, type SlotKind } from "@/domain/catalog/items";
import { oneIn } from "@/domain/catalog/odds";
import { rewardRoutes } from "@/domain/catalog/rewards";
import {
  bountyHub,
  chanceOf,
  junctionTo,
  resolveAcquisition,
  type Acquisition,
  type AcquisitionSystem,
  type AdversarySystem,
  type CompanionSystem,
  type Requirement,
  type ResolvedPart,
  type Route,
} from "@/domain/catalog/scenario";
import { curatedFor, vendorGates, type Cost, type CuratedSource } from "@/domain/catalog/sources";
import { researchFor, sameName } from "@/domain/catalog/wiki";
import { questNeeds, questsBefore } from "@/domain/narrative/chain";
import type { Quest } from "@/domain/narrative/schema";
import { placeGap, rankGap, type Reach, type ReachGap } from "@/domain/place/reach";

type None = Record<never, never>;

interface Odds {
  rotation: string | null;
  stage: string | null;
  chance: number | null;
  runs: number | null;
}

interface RelicFacts {
  rarity: string | null;
  intact: number | null;
  radiant: number | null;
  vaulted: boolean;
  farm: { place: string; node: string } | null;
}

interface Says {
  sectionPrerequisites: None;
  sectionHowToGet: None;
  sectionAcquisition: None;
  sectionBlueprints: None;
  sectionComponents: None;
  partSection: { part: string; count: number };
  partTitle: { part: string; count: number };
  groupHere: { places: string[] };
  groupElsewhere: None;
  groupForGear: { gear: string; optional: boolean };

  masteryTitle: { rank: number };
  masteryDetail: { now: number; required: number };
  masteryUnknownDetail: None;
  questTitle: { quest: string };
  questDetail: None;
  questStartTitle: { quest: string };
  intrinsicsTitle: { rank: number | null };
  intrinsicsDetail: None;
  nemesisTitle: { name: string };
  nemesisDetail: None;
  clanTitle: None;
  clanDetail: { item: string; lab: string };
  rankTitle: { rank: string; vendor: string };
  reachTitle: { place: string };
  junctionDetail: { junction: string; from: string };
  slotTitle: { kind: SlotKind };
  slotDetail: None;

  buyTitle: { item: string };
  marketTitle: None;
  marketDetail: { credits: number };
  marketBrief: { credits: number };
  vendorTitle: { vendor: string };
  vendorDetail: {
    vendor: string;
    cost: number | null;
    currency: string | null;
    rank: string | null;
    quest: string | null;
  };
  vendorBrief: {
    vendor: string;
    cost: number | null;
    currency: string | null;
    rank: string | null;
  };
  priceBrief: { cost: number | null; currency: string | null; rank: string | null };
  locatorDetail: { key: string; vendor: string; node: string | null };
  researchTitle: { lab: string };
  researchDetail: { lab: string };

  playTitle: { node: string };
  playBountiesTitle: { place: string };
  bountyTitle: { tier: string; low: string | null; high: string | null };
  bountyTierDetail: { low: string; high: string };
  defeatTitle: { source: string };
  openRelicTitle: { relic: string; vaulted: boolean };
  nodeDetail: { place: string; mission: string | null; boss: string | null };
  odds: Odds;
  oddsBrief: Odds;
  relicOdds: RelicFacts;
  relicBrief: RelicFacts;
  dropDetail: { place: string; node: string };
  nodeOn: { node: string; place: string };
  partsUnknown: None;
  noRouteTitle: { item: string };

  resourceTitle: { name: string; count: number };
  resourceDetail: { rarity: string | null; location: string | null };
  weaponTitle: { name: string; count: number };
  weaponDetail: None;
  partConsumedDetail: None;
  creditsTitle: { credits: number };
  currencyTitle: { cost: number; currency: string; vendor: string };
  ducatsTitle: { ducats: number };

  getTitle: { name: string };
  collectibleDetail: { place: string; mission: string | null };
  foundOnDetail: { regions: string[] };
  relicVaulted: None;
  relicStillDrops: None;

  railjackTitle: None;
  confrontationDetail: { place: string };
  relayTitle: None;
  unlockTitle: { hub: string };
  findTitle: { larva: string };
  vanquishTitle: { adversary: string };
  tradeTitle: { adversary: string };
  baroTitle: None;
  baroDetail: { lastOffered: string | null };
  baroPriceDetail: { credits: number | null; ducats: number | null; lastOffered: string | null };
  baroBrief: { credits: number | null; ducats: number | null };
  invasionTitle: None;

  acquireTitle: { name: string; count: number };
  addTitle: { name: string };
  useIncubatorTitle: None;
  incubateDetail: { item: string };
  cystIncubateDetail: None;
  existingKavatTitle: None;
  existingKavatDetail: None;
  infectTitle: None;
  infectDetail: None;
  lureTitle: { lure: string };
  imprintTitle: None;
  imprintDetail: None;
  secondImprintTitle: None;
  secondImprintDetail: None;
  breedTitle: { item: string };
  breedDetail: None;
  visitSonTitle: None;
  captureTitle: None;
  captureDetail: { species: string };
  mutagenTitle: None;
  antigenTitle: None;
  sonPartsDetail: { rank: string | null; cost: number | null };
  returnTitle: None;
  returnDetail: { species: string };
  gildTitle: None;
  gildDetail: None;
  houndTitle: None;
  houndDetail: None;

  vaultedTitle: None;
  vaultedDetail: { item: string };
  vaultedBrief: None;
  resurgenceDetail: { item: string; expiry: string | null };
  resurgenceBrief: { expiry: string | null };
  ayaTitle: None;
  ayaDetail: { place: string; chance: number | null };
  ayaBrief: { place: string; chance: number | null };
  varziaTitle: None;
  varziaDetail: { location: string | null; expiry: string | null };
  varziaBrief: { location: string | null; expiry: string | null };
  resurgenceRelicTitle: { relic: string };
  resurgenceRelicDetail: {
    aya: number;
    rarity: string;
    intact: number | null;
    radiant: number | null;
  };
  ayaPrice: { aya: number };
  wholeTitle: { item: string };
  wholeDetail: { regalAya: number };
  wholeBrief: { regalAya: number };

  costs: { costs: Cost[] };
  percent: { chance: number };
  approxPercent: { chance: number };
  otherWays: { ways: { title: Phrase; brief: Part[] }[] };
  onPlanet: { planet: string };
  curatedVendorTitle: { vendor: string; thing: string | null };
  curatedVendorDetail: {
    vendor: string;
    place: string | null;
    costs: Cost[];
    rank: string | null;
    built: string | null;
    earned: string | null;
  };
  copiesTitle: { vendor: string };
  copiesDetail: { vendor: string; costs: Cost[] };
  marketTitle2: { blueprint: boolean };
  marketPriceDetail: {
    credits: number | null;
    platinum: number | null;
    bundle: string | null;
    blueprint: boolean;
  };
  marketPriceBrief: { credits: number | null; platinum: number | null };
  questRewardTitle: { quest: string };
  questRewardDetail: { choice: boolean };
  junctionTitle: { junction: string };
  junctionRewardDetail: { from: string | null };
  enigmaTitle: None;
  enigmaDetail: { chance: number };
  anniversaryTitle: None;
  anniversaryDetail: { year: number | null };
  unavailableTitle: None;
  unavailableDetail: { reason: string; event: string | null; until: string | null };
  raceTitle: { race: string };
  raceDetail: { place: string };
  bundledTitle: { things: string[] };
  bundledDetail: { things: string[] };
  primeAccessTitle: { warframe: string };
  primeAccessDetail: {
    from: string;
    until: string | null;
    warframe: string;
    resurgence: boolean;
  };
  adversaryTitle: { adversary: string; element: string | null };
  adversaryDetail: { chance: number };
  nightwaveTitle: None;
  nightwaveDetail: { ranks: { season: string; rank: number }[] };
  nightwaveBrief: { ranks: { season: string; rank: number }[] };
  dropTitle: { source: string };
  dropBlueprintDetail: { chance: number | null };
  scanTitle: { target: string };
  scanDetail: { chance: number };
  cystTitle: { warframe: string };
  cystDetail: { days: number };
  dojoTitle: { room: string };
  dojoDetail: { room: string; credits: number | null };
  eventTitle: { event: string };
  eventDetail: { vendor: string | null; costs: Cost[] | null; progress: number | null };
  goalTitle: { focus: number; wearing: string };
  goalDetail: None;
  circuitModeTitle: { mode: CircuitMode };
  circuitWeeksDetail: { mode: CircuitMode; weeksAway: number | null; tier: number | null };
  circuitBrief: { weeksAway: number };
  cavaleroDetail: { platinum: number; now: boolean };
  honoriaEarnTitle: None;
}

export type Phrase = { [K in keyof Says]: { say: K } & Says[K] }[keyof Says];

export type Part = string | Phrase;

function say<K extends keyof Says>(
  key: K,
  ...fields: [keyof Says[K]] extends [never] ? [] : [Says[K]]
) {
  return { say: key, ...fields[0] } as Phrase;
}

export type ProseSource = "mechanics" | "acquisition" | "lead";

export interface ProseAsk {
  title: string;
  source: ProseSource;
}

export interface StepRow {
  id: string;
  title: Phrase;
  detail: Part[];
  brief: Part[];
  where: Part[];
  prose: ProseAsk | null;
  wikiTitle: string | null;
  imageUrl: string | null;
  best: boolean;
  alternative: boolean;
  optional: boolean;
  thing: string | null;
  gear: { name: string; count: number } | null;
}

interface StepGroup {
  title: Phrase | null;
  rows: StepRow[];
}

export interface StepSection {
  id: string;
  title: Phrase;
  imageUrl: string | null;
  checkable: boolean;
  groups: StepGroup[];
}

export interface StepPlan {
  sections: StepSection[];
}

export interface VarziaStock {
  location: string | null;
  expiry: string | null;
  offers: { uniqueName: string; regalAya: number | null; aya: number | null }[];
}

interface Reader {
  now: number;
  masteryRank?: number;
  varzia?: VarziaStock | null;
  done?: ReadonlySet<string>;
}

const ALTERNATIVES_SHOWN = 4;
const MAIN_PART = "Blueprint";
const JUNCTION = / Junction$/;
const BUY_FIRST = new Set<Route["kind"]>(["market", "vendor", "research"]);
const PLATINUM = "Platinum";
const BOUNTY = "Bounty";
const SON = "Son";
const BOUNTY_LEVELS = /Level\s+(\d+)\s*-\s*(\d+)/;

const INCUBATOR_QUEST = "Howl of the Kubrow";
const KUBROW_EGG = "Kubrow Egg";
const POWER_CORE = "Incubator Power Core";
const KAVAT_SEGMENT = "Kavat Incubator Upgrade Segment";
const KAVAT_CODE = "Kavat Genetic Code";
const KAVAT_CODES = 10;
const TEMPLATE = "Genetic Code Template";
const NUTRIO = "Nutrio Incubator Upgrade Segment";
const SON_QUEST = "Heart of Deimos";
const TRANQ_RIFLE = "Tranq Rifle";
const RAILJACK_QUEST = "Rising Tide";
const MUTAGEN = "Mutagen";
const ANTIGEN = "Antigen";
const HOUND_HUB = "Fortuna";
const STEEL_PATH = "The Steel Path";
const FOCUS_TAG = "Focus";
const FOCUS_STORE = "the Focus Represent Store";
const AYA = "Aya";
const CAVALERO = "Cavalero";
const CREDITS = "Credits";
const CREDITS_ART = "https://wiki.warframe.com/images/Credits.png";
const DUCATS = "Orokin Ducats";

const MASTERY_WIKI = "Mastery Rank";
const INTRINSICS_WIKI = "Intrinsics";
const CLAN_WIKI = "Clan Dojo";
const RAILJACK_WIKI = "Railjack";
const RELAY_WIKI = "Relay";
const BARO_WIKI = "Baro Ki'Teer";
const INVASION_WIKI = "Invasion";
const INCUBATOR_WIKI = "Incubator";
const KAVAT_WIKI = "Kavat";
const INFECT_WIKI = "Plains of Eidolon";
const SON_WIKI = "Son";
const CONSERVATION_WIKI = "Conservation";
const GILD_WIKI = "Gilding";
const HOUND_WIKI = "Hound";
const VAULT_WIKI = "Prime Vault";
const VARZIA_WIKI = "Varzia";
const CIRCUIT_WIKI = "The Circuit";
const HONORIA_WIKI = "Honoria";
const MARKET_WIKI = "Market";

function slotWiki(kind: SlotKind): string {
  return kind === "Companion" ? "Companion" : "Slots";
}

function parts(...values: (Part | null | undefined)[]): Part[] {
  return values.filter((one): one is Part => one !== null && one !== undefined && one !== "");
}

function row(
  id: string,
  title: Phrase,
  rest: Partial<Omit<StepRow, "id" | "title">> = {},
): StepRow {
  return {
    id,
    title,
    detail: rest.detail ?? [],
    brief: rest.brief ?? [],
    where: rest.where ?? [],
    prose: rest.prose ?? null,
    wikiTitle: rest.wikiTitle ?? null,
    imageUrl: rest.imageUrl ?? null,
    best: rest.best ?? false,
    alternative: rest.alternative ?? false,
    optional: rest.optional ?? false,
    thing: rest.thing ?? null,
    gear: rest.gear ?? null,
  };
}

function section(
  id: string,
  title: Phrase,
  rows: StepRow[],
  extra: { imageUrl?: string | null; checkable?: boolean } = {},
): StepSection {
  return {
    id,
    title,
    imageUrl: extra.imageUrl ?? null,
    checkable: extra.checkable ?? false,
    groups: [{ title: null, rows }],
  };
}

function lead(title: string | null): ProseAsk | null {
  return title === null ? null : { title, source: "lead" };
}

function mechanics(title: string | null): ProseAsk | null {
  return title === null ? null : { title, source: "mechanics" };
}

function acquisition(title: string): ProseAsk {
  return { title, source: "acquisition" };
}

function odds(rotation: string | null, stage: string | null, chance: number | null): Odds {
  return { rotation, stage, chance, runs: oneIn(chance) };
}

function hasOdds(value: Odds): boolean {
  return (
    value.rotation !== null || value.stage !== null || (value.chance !== null && value.chance > 0)
  );
}

function oddsDetail(value: Odds): Phrase | null {
  return hasOdds(value) ? say("odds", value) : null;
}

function oddsBrief(value: Odds): Phrase | null {
  return hasOdds(value) ? say("oddsBrief", value) : null;
}

function relicOddsDetail(facts: RelicFacts): Phrase | null {
  const empty =
    facts.rarity === null &&
    facts.intact === null &&
    facts.radiant === null &&
    !facts.vaulted &&
    facts.farm === null;
  return empty ? null : say("relicOdds", facts);
}

function relicBrief(facts: RelicFacts): Phrase | null {
  const empty = facts.rarity === null && facts.intact === null && facts.radiant === null;
  return empty ? null : say("relicBrief", facts);
}

function priceBrief(cost: number | null, currency: string | null, rank: string | null) {
  return cost === null && rank === null ? null : say("priceBrief", { cost, currency, rank });
}

function resourceDetail(rarity: string | null, location: string | null): Phrase | null {
  return rarity === null && location === null ? null : say("resourceDetail", { rarity, location });
}

function levels(tier: string): { low: string; high: string } | null {
  const found = BOUNTY_LEVELS.exec(tier);
  return found?.[1] && found[2] ? { low: found[1], high: found[2] } : null;
}

function relicFacts(route: Extract<Route, { kind: "relic" }>, status: boolean): RelicFacts {
  return {
    rarity: route.offer.rarity,
    intact: route.offer.intact,
    radiant: route.offer.radiant,
    vaulted: status && route.offer.vaulted,
    farm:
      status && route.offer.farm
        ? { place: route.offer.farm.place, node: route.offer.farm.node }
        : null,
  };
}

function junctionFrom(data: CatalogData, name: string): string | null {
  return data.wiki.nodes.find((node) => node.name === name)?.planet ?? null;
}

interface Facts {
  title: Phrase;
  detail: Phrase | null;
  brief: Part[];
}

function curatedFacts(
  data: CatalogData,
  reader: Reader,
  source: CuratedSource,
  item: string,
): Facts {
  switch (source.type) {
    case "vendor": {
      const price = say("costs", { costs: source.costs });
      return {
        title: say("curatedVendorTitle", { vendor: source.vendor, thing: source.thing ?? null }),
        detail: say("curatedVendorDetail", {
          vendor: source.vendor,
          place: source.place ?? null,
          costs: source.costs,
          rank: source.rank ?? null,
          built: source.thing ? item : null,
          earned: source.earned ?? null,
        }),
        brief: parts(source.place, price, source.rank),
      };
    }
    case "copies":
      return {
        title: say("copiesTitle", { vendor: source.vendor }),
        detail: say("copiesDetail", { vendor: source.vendor, costs: source.costs }),
        brief: parts(say("costs", { costs: source.costs })),
      };
    case "market":
      return {
        title: say("marketTitle2", { blueprint: source.blueprint ?? false }),
        detail: say("marketPriceDetail", {
          credits: source.credits ?? null,
          platinum: source.platinum ?? null,
          bundle: source.bundle ?? null,
          blueprint: source.blueprint ?? false,
        }),
        brief: parts(
          say("marketPriceBrief", {
            credits: source.credits ?? null,
            platinum: source.platinum ?? null,
          }),
        ),
      };
    case "quest":
      return {
        title: say("questRewardTitle", { quest: source.quest }),
        detail: say("questRewardDetail", { choice: source.choice ?? false }),
        brief: [],
      };
    case "junction": {
      const from = junctionFrom(data, source.junction);
      return {
        title: say("junctionTitle", { junction: source.junction }),
        detail: say("junctionRewardDetail", { from }),
        brief: parts(from),
      };
    }
    case "enigma":
      return {
        title: say("enigmaTitle"),
        detail: say("enigmaDetail", { chance: source.chance }),
        brief: parts(say("percent", { chance: source.chance })),
      };
    case "invasion":
      return { title: say("invasionTitle"), detail: null, brief: [] };
    case "anniversary":
      return {
        title: say("anniversaryTitle"),
        detail: say("anniversaryDetail", { year: source.year ?? null }),
        brief: [],
      };
    case "unavailable":
      return {
        title: say("unavailableTitle"),
        detail: say("unavailableDetail", {
          reason: source.reason,
          event: source.event ?? null,
          until: source.until ?? null,
        }),
        brief: parts(source.event),
      };
    case "race":
      return {
        title: say("raceTitle", { race: source.race }),
        detail: say("raceDetail", { place: source.place }),
        brief: parts(source.place),
      };
    case "bundled":
      return {
        title: say("bundledTitle", { things: source.with }),
        detail: say("bundledDetail", { things: source.with }),
        brief: [],
      };
    case "primeAccess":
      return {
        title: say("primeAccessTitle", { warframe: source.warframe }),
        detail: say("primeAccessDetail", {
          from: source.from,
          until: source.until ?? null,
          warframe: source.warframe,
          resurgence: source.resurgence ?? false,
        }),
        brief: [],
      };
    case "adversary":
      return {
        title: say("adversaryTitle", {
          adversary: source.adversary,
          element: source.element ?? null,
        }),
        detail: say("adversaryDetail", { chance: source.chance }),
        brief: parts(say("approxPercent", { chance: source.chance })),
      };
    case "nightwave":
      return {
        title: say("nightwaveTitle"),
        detail: say("nightwaveDetail", { ranks: source.ranks }),
        brief: parts(say("nightwaveBrief", { ranks: source.ranks })),
      };
    case "drop":
      return {
        title: say("dropTitle", { source: source.source }),
        detail: say("dropBlueprintDetail", { chance: source.chance ?? null }),
        brief: source.chance === undefined ? [] : parts(say("percent", { chance: source.chance })),
      };
    case "scan":
      return {
        title: say("scanTitle", { target: source.target }),
        detail: say("scanDetail", { chance: source.chance }),
        brief: parts(say("percent", { chance: source.chance })),
      };
    case "cyst":
      return {
        title: say("cystTitle", { warframe: source.warframe }),
        detail: say("cystDetail", { days: source.days }),
        brief: [],
      };
    case "dojo":
      return {
        title: say("dojoTitle", { room: source.room }),
        detail: say("dojoDetail", { room: source.room, credits: source.credits ?? null }),
        brief:
          source.credits === undefined
            ? []
            : parts(say("marketPriceBrief", { credits: source.credits, platinum: null })),
      };
    case "event": {
      const price = source.costs ? say("costs", { costs: source.costs }) : null;
      return {
        title: say("eventTitle", { event: source.event }),
        detail: say("eventDetail", {
          vendor: source.vendor ?? null,
          costs: source.costs ?? null,
          progress: source.progress ?? null,
        }),
        brief: parts(price),
      };
    }
    case "goal":
      return {
        title: say("goalTitle", { focus: source.focus, wearing: source.wearing }),
        detail: say("goalDetail"),
        brief: [],
      };
    case "circuit": {
      const status = circuitStatus(data.wiki.circuit, source.mode, item, reader.now);
      const away = status?.weeksAway ?? null;
      return {
        title: say("circuitModeTitle", { mode: source.mode }),
        detail: say("circuitWeeksDetail", {
          mode: source.mode,
          weeksAway: away,
          tier: source.tier ?? null,
        }),
        brief: away === null ? [] : parts(say("circuitBrief", { weeksAway: away })),
      };
    }
  }
}

function routeDetail(data: CatalogData, reader: Reader, route: Route, status = true): Part[] {
  switch (route.kind) {
    case "curated":
      return parts(curatedFacts(data, reader, route.source, route.item).detail);
    case "drop":
      return parts(oddsDetail(odds(route.rotation, null, route.chance)));
    case "bounty":
      return parts(oddsDetail(odds(route.rotation, route.stage, route.chance)));
    case "enemy":
      return parts(oddsDetail(odds(route.rotation, null, route.chance)));
    case "relic":
      return parts(relicOddsDetail(relicFacts(route, status)));
    case "research":
      return parts(say("researchDetail", { lab: route.lab }));
    case "vendor":
      return parts(
        route.key
          ? say("locatorDetail", { key: route.key, vendor: route.vendor, node: route.unlocks })
          : say("vendorDetail", {
              vendor: route.vendor,
              cost: route.cost,
              currency: route.currency,
              rank: route.rank,
              quest: route.quest,
            }),
      );
    case "market":
      return parts(say("marketDetail", { credits: route.credits }));
  }
}

function routeBrief(data: CatalogData, reader: Reader, route: Route): Part[] {
  switch (route.kind) {
    case "curated":
      return curatedFacts(data, reader, route.source, route.item).brief;
    case "drop":
    case "enemy":
      return parts(oddsBrief(odds(route.rotation, null, route.chance)));
    case "bounty":
      return parts(oddsBrief(odds(route.rotation, route.stage, route.chance)));
    case "relic":
      return parts(relicBrief(relicFacts(route, false)));
    case "research":
      return parts(route.lab);
    case "vendor":
      return parts(
        say("vendorBrief", {
          vendor: route.vendor,
          cost: route.cost,
          currency: route.currency,
          rank: route.rank,
        }),
      );
    case "market":
      return parts(say("marketBrief", { credits: route.credits }));
  }
}

function routeRow(
  data: CatalogData,
  reader: Reader,
  id: string,
  route: Route,
  status = true,
): StepRow {
  const shared = {
    detail: routeDetail(data, reader, route, status),
    brief: routeBrief(data, reader, route),
  };
  switch (route.kind) {
    case "drop":
      return row(id, say("playTitle", { node: route.node }), {
        ...shared,
        where: parts(say("nodeOn", { node: route.node, place: route.place }), route.mission),
        prose: mechanics(route.mission),
        wikiTitle: route.node,
      });
    case "bounty": {
      const range = levels(route.tier);
      return row(
        id,
        say("bountyTitle", {
          tier: route.tier,
          low: range?.low ?? null,
          high: range?.high ?? null,
        }),
        { ...shared, where: parts(route.place, BOUNTY), wikiTitle: route.place },
      );
    }
    case "enemy":
      return row(id, say("defeatTitle", { source: route.source }), {
        ...shared,
        wikiTitle: route.source,
      });
    case "relic":
      return row(
        id,
        say("openRelicTitle", { relic: route.offer.relic, vaulted: route.offer.vaulted }),
        {
          ...shared,
          wikiTitle: route.offer.relic,
          imageUrl: route.offer.imageUrl,
          thing: route.offer.relic,
        },
      );
    case "research":
      return row(id, say("researchTitle", { lab: route.lab }), {
        ...shared,
        wikiTitle: route.lab,
      });
    case "vendor":
      return row(id, say("vendorTitle", { vendor: route.vendor }), {
        ...shared,
        wikiTitle: route.link,
      });
    case "market":
      return row(id, say("marketTitle"), { ...shared, wikiTitle: MARKET_WIKI });
    case "curated":
      return row(id, curatedFacts(data, reader, route.source, route.item).title, {
        ...shared,
        wikiTitle: route.cite,
      });
  }
}

function alternativeRows(
  data: CatalogData,
  reader: Reader,
  part: ResolvedPart,
  status: boolean,
): StepRow[] {
  const shown = part.routes.slice(0, ALTERNATIVES_SHOWN);
  const kind = shown[0]?.kind;
  const best = bestFlags(shown.map((route) => (route.kind === kind ? chanceOf(route) : null)));
  return shown.map((route, index) => ({
    ...routeRow(data, reader, `part:${part.name}:${index}`, route, status),
    best: best[index] === true,
    alternative: index > 0,
  }));
}

function bestFlags(chances: readonly (number | null)[]): boolean[] {
  const top = chances[0] ?? null;
  const beaten = top !== null && chances.some((chance) => chance !== null && chance < top);
  return chances.map((chance) => beaten && chance === top);
}

function bestOdds(part: ResolvedPart): number {
  const first = part.routes[0];
  return (first ? chanceOf(first) : null) ?? -1;
}

function byBestOdds(parts: readonly ResolvedPart[]): ResolvedPart[] {
  return [...parts].sort((a, b) => bestOdds(b) - bestOdds(a));
}

const RARITY_ORDER = ["Common", "Uncommon", "Rare"];

function rarityRank(rarity: string | null): number {
  const index = rarity === null ? -1 : RARITY_ORDER.indexOf(rarity);
  return index === -1 ? RARITY_ORDER.length : index;
}

function howRow(data: CatalogData, reader: Reader, route: Route, found: Acquisition): StepRow {
  if (route.kind === "drop") {
    return row("how", say("playTitle", { node: route.node }), {
      detail: parts(
        say("nodeDetail", { place: route.place, mission: route.mission, boss: route.boss }),
      ),
      brief: parts(route.place, route.boss ?? route.mission),
      prose: route.boss ? lead(route.boss) : mechanics(route.mission),
      wikiTitle: route.node,
    });
  }
  if (route.kind === "bounty") {
    const range = levels(route.tier);
    return row("how", say("playBountiesTitle", { place: route.place }), {
      detail: parts(
        range ? say("bountyTierDetail", range) : null,
        ...routeDetail(data, reader, route),
      ),
      brief: routeBrief(data, reader, route),
      prose: mechanics(BOUNTY),
      wikiTitle: found.places[0] ?? route.place,
    });
  }
  if (route.kind === "vendor") {
    return row("how", say("vendorTitle", { vendor: route.vendor }), {
      brief: parts(priceBrief(route.cost, route.currency, route.rank)),
      prose: lead(route.link),
      wikiTitle: route.link,
    });
  }
  if (route.kind === "research") {
    return { ...routeRow(data, reader, "how", route), prose: lead(route.lab) };
  }
  return {
    ...routeRow(data, reader, "how", route),
    prose: lead(route.kind === "enemy" ? route.source : null),
  };
}

const MASTERY_ROW = "mastery";

function masteryRows(required: number, masteryRank: number | undefined): StepRow[] {
  if (required === 0) return [];
  return [
    row(MASTERY_ROW, say("masteryTitle", { rank: required }), {
      detail: parts(
        masteryRank === undefined
          ? say("masteryUnknownDetail")
          : say("masteryDetail", { now: masteryRank, required }),
      ),
      wikiTitle: MASTERY_WIKI,
    }),
  ];
}

function headRows(item: Dossier["item"], masteryRank: number | undefined): StepRow[] {
  return [
    ...masteryRows(item.masteryReq, masteryRank),
    ...(item.slot === null ? [] : [slotRow(item.slot)]),
  ];
}

function withoutRepeats(rows: readonly StepRow[]): StepRow[] {
  const seen = new Set<string>();
  return rows.filter((entry) => !seen.has(entry.id) && seen.add(entry.id));
}

function junctionRow(data: CatalogData, junction: string): StepRow {
  const from = junctionFrom(data, junction);
  return row(`junction:${junction}`, say("junctionTitle", { junction }), {
    detail: from === null ? [] : parts(say("onPlanet", { planet: from })),
    wikiTitle: junction,
  });
}

function questRowsFor(data: CatalogData, quests: readonly string[]): StepRow[] {
  return questsBefore(data.spine, quests).flatMap((quest) => [
    ...questNeeds(data.spine, quest).junctions.map((junction) => junctionRow(data, junction)),
    row(`quest:${quest}`, say("questTitle", { quest }), {
      detail: parts(say("questDetail")),
      wikiTitle: quest,
    }),
  ]);
}

function requirementRows(
  data: CatalogData,
  requirements: readonly Requirement[],
  item: string,
): StepRow[] {
  const out: StepRow[] = [];
  const named = requirements.filter((one) => one.kind === "quest").map((one) => one.name);
  const junctions = named.filter((name) => JUNCTION.test(name));
  const quests = named.filter((name) => !JUNCTION.test(name));
  out.push(...questRowsFor(data, quests));
  out.push(...junctions.map((junction) => junctionRow(data, junction)));
  for (const one of requirements) {
    if (one.kind === "intrinsics") {
      out.push(
        row(`intrinsics:${one.rank ?? 0}`, say("intrinsicsTitle", { rank: one.rank }), {
          detail: parts(say("intrinsicsDetail")),
          wikiTitle: INTRINSICS_WIKI,
        }),
      );
    }
    if (one.kind === "nemesis") {
      out.push(
        row(`nemesis:${one.name}`, say("nemesisTitle", { name: one.name }), {
          detail: parts(say("nemesisDetail")),
          wikiTitle: one.name,
        }),
      );
    }
    if (one.kind === "clan") {
      out.push(
        row(`clan:${one.name}`, say("clanTitle"), {
          detail: parts(say("clanDetail", { item, lab: one.name })),
          wikiTitle: CLAN_WIKI,
        }),
      );
    }
    if (one.kind === "rank" && one.label !== null) {
      out.push(
        row(`rank:${one.name}`, say("rankTitle", { rank: one.label, vendor: one.name }), {
          wikiTitle: one.name,
        }),
      );
    }
  }
  return out;
}

function reachRows(data: CatalogData, places: readonly string[]): StepRow[] {
  return places.map((place) => {
    const junction = junctionTo(data.wiki, place);
    return row(`place:${place}`, say("reachTitle", { place }), {
      detail: junction
        ? parts(say("junctionDetail", { junction: junction.name, from: junction.from }))
        : [],
      wikiTitle: junction?.name ?? place,
    });
  });
}

function partTitle(part: ResolvedPart): Phrase {
  return say("partTitle", { part: part.main ? MAIN_PART : part.name, count: part.count });
}

function partSection(part: ResolvedPart): Phrase {
  return say("partSection", { part: part.main ? MAIN_PART : part.name, count: part.count });
}

const resourceImages = new WeakMap<CatalogData, Map<string, string | null>>();
const arsenalImages = new WeakMap<CatalogData, Map<string, string | null>>();

function resourceImage(data: CatalogData, name: string): string | null {
  let images = resourceImages.get(data);
  if (!images) {
    images = new Map();
    for (const entry of data.resources) {
      if (entry.imageUrl && !images.has(entry.name)) images.set(entry.name, entry.imageUrl);
    }
    resourceImages.set(data, images);
  }
  return images.get(name) ?? null;
}

function arsenalImage(data: CatalogData, name: string): string | null {
  let images = arsenalImages.get(data);
  if (!images) {
    images = new Map(data.arsenal.map((entry) => [entry.name, entry.imageUrl]));
    arsenalImages.set(data, images);
  }
  return images.get(name) ?? null;
}

function partImage(data: CatalogData, name: string): string | null {
  for (const item of data.arsenal) {
    if (!name.startsWith(`${item.name} `)) continue;
    const part = name.slice(item.name.length + 1);
    const art = item.recipe?.parts.find((one) => one.name === part)?.imageUrl;
    if (art) return art;
  }
  return null;
}

function thingImage(data: CatalogData, name: string): string | null {
  if (name === MAIN_PART) return BLUEPRINT_ART;
  return (
    resourceImage(data, name) ??
    findCollectible(data, name)?.imageUrl ??
    arsenalImage(data, name) ??
    partImage(data, name)
  );
}

function gearFacts(
  data: CatalogData,
  reader: Reader,
  name: string,
): Pick<StepRow, "detail" | "brief" | "prose"> {
  const curated = curatedFor(data.curated, name, null);
  if (curated.length > 0) {
    const facts = curated.map((source) => curatedFacts(data, reader, source, name));
    const [first, ...rest] = facts;
    return {
      detail: parts(
        first?.detail,
        rest.length > 0
          ? say("otherWays", { ways: rest.map((one) => ({ title: one.title, brief: one.brief })) })
          : null,
      ),
      brief: first?.brief ?? [],
      prose: null,
    };
  }
  const offers = data.wiki.vendors.flatMap((vendor) =>
    vendor.offers
      .filter((offer) => sameName(offer.item, name) || sameName(offer.item, `${name} Blueprint`))
      .map((offer) => ({ vendor, offer })),
  );
  offers.sort(
    (a, b) => Number(a.vendor.currency === PLATINUM) - Number(b.vendor.currency === PLATINUM),
  );
  const sold = offers[0];
  if (sold) {
    return {
      detail: parts(
        say("vendorDetail", {
          vendor: sold.vendor.name,
          cost: sold.offer.cost,
          currency: sold.vendor.currency,
          rank: sold.offer.rank,
          quest: sold.offer.quest,
        }),
      ),
      brief: parts(
        say("vendorBrief", {
          vendor: sold.vendor.name,
          cost: sold.offer.cost,
          currency: sold.vendor.currency,
          rank: sold.offer.rank,
        }),
      ),
      prose: null,
    };
  }
  const research = researchFor(data.wiki, name);
  if (research?.lab) {
    return {
      detail: parts(say("researchDetail", { lab: research.lab })),
      brief: parts(research.lab),
      prose: null,
    };
  }
  const drop = rewardRoutes(data.rewards, name)[0];
  if (drop) {
    const value = odds(drop.rotation, drop.stage, drop.chance);
    return {
      detail: parts(say("dropDetail", { place: drop.place, node: drop.node }), oddsDetail(value)),
      brief: parts(oddsBrief(value)),
      prose: null,
    };
  }
  return { detail: [], brief: [], prose: acquisition(name) };
}

function gearRow(
  data: CatalogData,
  reader: Reader,
  id: string,
  title: Phrase,
  name: string,
  count = 1,
  optional = false,
): StepRow {
  return row(id, title, {
    ...gearFacts(data, reader, name),
    wikiTitle: name,
    imageUrl: thingImage(data, name),
    thing: name,
    gear: { name, count },
    optional,
  });
}

function gearGroups(data: CatalogData, sections: readonly StepSection[]): StepGroup[] {
  const groups: StepGroup[] = [];
  const seen = new Set<string>();
  const resources = data.wiki.resources;
  for (const used of sections.flatMap((one) => one.groups.flatMap((group) => group.rows))) {
    if (used.gear === null || seen.has(used.gear.name)) continue;
    const recipe = data.gear.get(used.gear.name) ?? null;
    if (recipe === null) continue;
    seen.add(used.gear.name);
    const { name, count } = used.gear;
    const rows = [...recipe.ingredients]
      .map((one) => ({ ...one, fact: resources.get(one.name) }))
      .sort((a, b) => rarityRank(a.fact?.rarity ?? null) - rarityRank(b.fact?.rarity ?? null))
      .map((one) =>
        row(
          `gear:${name}:${one.name}`,
          say("resourceTitle", { name: one.name, count: one.count * count }),
          {
            detail: one.fact ? parts(resourceDetail(one.fact.rarity, one.fact.location)) : [],
            wikiTitle: one.fact?.link ?? one.name,
            imageUrl: thingImage(data, one.name),
            thing: one.name,
          },
        ),
      );
    if (recipe.credits !== null && recipe.credits > 0) {
      rows.push(
        row(`gear:${name}:credits`, say("creditsTitle", { credits: recipe.credits * count }), {
          wikiTitle: CREDITS,
          imageUrl: CREDITS_ART,
          thing: CREDITS,
        }),
      );
    }
    groups.push({ title: say("groupForGear", { gear: name, optional: used.optional }), rows });
  }
  return groups;
}

function withGear(data: CatalogData, sections: StepSection[]): StepSection[] {
  const groups = gearGroups(data, sections);
  if (groups.length === 0) return sections;
  const index = sections.findIndex((one) => one.id === "components");
  if (index === -1) {
    return [
      ...sections,
      {
        id: "components",
        title: say("sectionComponents"),
        imageUrl: null,
        checkable: true,
        groups,
      },
    ];
  }
  return sections.map((one, at) =>
    at === index ? { ...one, groups: [...one.groups, ...groups] } : one,
  );
}

function specificTo(
  data: CatalogData,
  name: string,
  location: string | null,
  places: readonly string[],
): boolean {
  if (location === null) return false;
  return places.some(
    (place) => location.includes(place) && !(data.regions[place] ?? []).includes(name),
  );
}

function componentsSection(data: CatalogData, found: Acquisition): StepSection | null {
  const here: StepRow[] = [];
  const elsewhere: StepRow[] = [];

  const resources = [...found.totals.resources].sort(
    (a, b) => rarityRank(a.rarity) - rarityRank(b.rarity),
  );
  for (const tally of resources) {
    const entry = row(
      `resource:${tally.name}`,
      say("resourceTitle", { name: tally.name, count: tally.count }),
      {
        detail: parts(resourceDetail(tally.rarity, tally.location)),
        wikiTitle: tally.link,
        imageUrl: thingImage(data, tally.name),
        thing: tally.name,
      },
    );
    (specificTo(data, tally.name, tally.location, found.places) ? here : elsewhere).push(entry);
  }

  for (const weapon of found.totals.consumes) {
    elsewhere.push(
      row(`weapon:${weapon.name}`, say("weaponTitle", { name: weapon.name, count: weapon.count }), {
        detail: parts(say("weaponDetail")),
        wikiTitle: weapon.name,
        imageUrl: arsenalImage(data, weapon.name),
        thing: weapon.name,
      }),
    );
  }

  const currencies = new Map<string, { cost: number; vendor: string }>();
  for (const part of found.parts) {
    const route = part.routes[0];
    if (route?.kind !== "vendor" || route.cost === null || route.currency === null) continue;
    if (route.currency === PLATINUM) continue;
    const key = route.currency === "Standing" ? `Standing:${route.vendor}` : route.currency;
    const known = currencies.get(key);
    currencies.set(key, { cost: (known?.cost ?? 0) + route.cost, vendor: route.vendor });
  }
  for (const [key, { cost, vendor }] of currencies) {
    const currency = key.startsWith("Standing:") ? "Standing" : key;
    elsewhere.push(
      row(`currency:${key}`, say("currencyTitle", { cost, currency, vendor }), {
        wikiTitle: currency === "Standing" ? vendor : currency,
        imageUrl:
          currency === "Standing"
            ? (data.vendorArt[vendor] ?? null)
            : (thingImage(data, currency) ?? data.vendorArt[currency] ?? null),
        thing: currency === "Standing" ? null : currency,
      }),
    );
  }

  if (found.totals.credits !== null && found.totals.credits > 0) {
    elsewhere.push(
      row("credits", say("creditsTitle", { credits: found.totals.credits }), {
        wikiTitle: CREDITS,
        imageUrl: CREDITS_ART,
        thing: CREDITS,
      }),
    );
  }

  const groups = [
    { title: say("groupHere", { places: found.places }), rows: here },
    { title: here.length > 0 ? say("groupElsewhere") : null, rows: elsewhere },
  ].filter((group) => group.rows.length > 0);
  if (groups.length === 0) return null;
  return {
    id: "components",
    title: say("sectionComponents"),
    imageUrl: null,
    checkable: true,
    groups,
  };
}

function slotRow(kind: SlotKind): StepRow {
  return row("slot", say("slotTitle", { kind }), {
    detail: parts(say("slotDetail")),
    wikiTitle: slotWiki(kind),
  });
}

function adversaryPrerequisites(data: CatalogData, system: AdversarySystem): StepRow[] {
  const rows: StepRow[] = [];
  if (system.hound) rows.push(slotRow("Companion"));
  rows.push(
    ...questRowsFor(data, system.railjack ? [...system.quests, RAILJACK_QUEST] : system.quests),
  );
  if (system.railjack) {
    rows.push(
      row("railjack", say("railjackTitle"), {
        prose: lead(RAILJACK_WIKI),
        wikiTitle: RAILJACK_WIKI,
      }),
    );
  }
  if (system.intrinsics) {
    rows.push(
      row(
        `intrinsics:${system.intrinsics.rank}`,
        say("intrinsicsTitle", { rank: system.intrinsics.rank }),
        {
          detail: parts(say("confrontationDetail", { place: system.intrinsics.place })),
          wikiTitle: INTRINSICS_WIKI,
        },
      ),
    );
  }
  if (system.hound) {
    rows.push(
      row(`hub:${HOUND_HUB}`, say("unlockTitle", { hub: HOUND_HUB }), {
        prose: lead(HOUND_HUB),
        wikiTitle: HOUND_HUB,
      }),
    );
  }
  return rows;
}

function adversarySteps(system: AdversarySystem, item: string): StepRow[] {
  const rows = [
    row("find", say("findTitle", { larva: system.larva ?? system.name }), {
      detail: parts(system.encounter),
      wikiTitle: system.larva ?? system.page,
    }),
    row("vanquish", say("vanquishTitle", { adversary: system.name }), {
      detail: parts(system.create),
      prose: system.hound ? null : acquisition(item),
      wikiTitle: system.page,
    }),
  ];
  if (system.trade) {
    rows.push(
      row("trade", say("tradeTitle", { adversary: system.name }), {
        detail: parts(system.trade),
        wikiTitle: system.page,
      }),
    );
  }
  if (system.hound) {
    rows.push(
      row("hound", say("houndTitle"), {
        detail: parts(say("houndDetail")),
        prose: acquisition(item),
        wikiTitle: HOUND_WIKI,
      }),
    );
  }
  return rows;
}

function sonOffers(data: CatalogData, word: string): { rank: string | null; cost: number | null } {
  const son = data.wiki.vendors.find((vendor) => vendor.name === SON);
  const offers = (son?.offers ?? [])
    .filter((offer) => offer.item.endsWith(`${word} Blueprint`) && offer.cost !== null)
    .sort((a, b) => (a.cost ?? 0) - (b.cost ?? 0));
  return { rank: offers[0]?.rank ?? null, cost: offers[0]?.cost ?? null };
}

function curatedSource(data: CatalogData, item: string): string[] {
  const from = data.acquisition.find((entry) => entry.item === item)?.from ?? null;
  return from === null || from === KUBROW_EGG ? [] : [from];
}

function companionPrerequisites(
  data: CatalogData,
  reader: Reader,
  system: CompanionSystem,
  item: string,
): StepRow[] {
  const gear = (id: string, name: string, count = 1) =>
    gearRow(data, reader, id, say("acquireTitle", { name, count }), name, count);
  const rows = [slotRow("Companion")];
  switch (system.mechanism) {
    case "kubrow":
      rows.push(
        ...questRowsFor(data, [INCUBATOR_QUEST]),
        gear("egg", KUBROW_EGG),
        ...curatedSource(data, item).map((from) => gear(`from:${from}`, from)),
        gear("core", POWER_CORE),
      );
      break;
    case "kavat":
      rows.push(
        ...questRowsFor(data, [INCUBATOR_QUEST]),
        gear("segment", KAVAT_SEGMENT),
        gear("codes", KAVAT_CODE, KAVAT_CODES),
        gear("core", POWER_CORE),
      );
      break;
    case "vasca":
      rows.push(
        row("kavat", say("existingKavatTitle"), {
          detail: parts(say("existingKavatDetail")),
          wikiTitle: KAVAT_WIKI,
        }),
        gear("template", TEMPLATE, 2),
      );
      break;
    case "son":
      rows.push(...questRowsFor(data, [SON_QUEST]), gear("tranq", TRANQ_RIFLE));
      break;
  }
  return rows;
}

function lureRow(data: CatalogData, reader: Reader, lure: string | null): StepRow[] {
  return lure === null
    ? []
    : [gearRow(data, reader, "lure", say("lureTitle", { lure }), lure, 1, true)];
}

function companionSteps(
  data: CatalogData,
  reader: Reader,
  system: CompanionSystem,
  item: string,
): StepRow[] {
  switch (system.mechanism) {
    case "kubrow":
    case "kavat":
      return [
        gearRow(data, reader, "template", say("addTitle", { name: TEMPLATE }), TEMPLATE, 1, true),
        gearRow(data, reader, "nutrio", say("addTitle", { name: NUTRIO }), NUTRIO, 1, true),
        row("incubate", say("useIncubatorTitle"), {
          detail: parts(
            curatedSource(data, item).length > 0
              ? say("cystIncubateDetail")
              : say("incubateDetail", { item }),
          ),
          wikiTitle: INCUBATOR_WIKI,
        }),
      ];
    case "vasca":
      return [
        row("infect", say("infectTitle"), {
          detail: parts(say("infectDetail")),
          wikiTitle: INFECT_WIKI,
        }),
        ...lureRow(data, reader, system.lure),
        row("imprint", say("imprintTitle"), {
          detail: parts(say("imprintDetail")),
          wikiTitle: TEMPLATE,
        }),
        row("again", say("secondImprintTitle"), {
          detail: parts(say("secondImprintDetail")),
          wikiTitle: item,
        }),
        row("breed", say("breedTitle", { item }), {
          detail: parts(say("breedDetail")),
          wikiTitle: INCUBATOR_WIKI,
        }),
      ];
    case "son": {
      const mutagen = sonOffers(data, MUTAGEN);
      const antigen = sonOffers(data, ANTIGEN);
      return [
        row("son", say("visitSonTitle"), { prose: lead(SON_WIKI), wikiTitle: SON_WIKI }),
        ...lureRow(data, reader, system.lure),
        row("capture", say("captureTitle"), {
          detail: parts(say("captureDetail", { species: system.species })),
          wikiTitle: CONSERVATION_WIKI,
        }),
        row("mutagen", say("mutagenTitle"), {
          detail: parts(say("sonPartsDetail", mutagen)),
          wikiTitle: system.species,
        }),
        row("antigen", say("antigenTitle"), {
          detail: parts(say("sonPartsDetail", antigen)),
          wikiTitle: system.species,
        }),
        row("return", say("returnTitle"), {
          detail: parts(say("returnDetail", { species: system.species })),
          wikiTitle: system.species,
        }),
        row("gild", say("gildTitle"), {
          detail: parts(say("gildDetail")),
          wikiTitle: GILD_WIKI,
          optional: true,
        }),
      ];
    }
  }
}

function systemPrerequisites(
  data: CatalogData,
  reader: Reader,
  system: AcquisitionSystem,
  item: string,
): StepRow[] {
  if (system.kind === "adversary") return adversaryPrerequisites(data, system);
  if (system.kind === "companion") return companionPrerequisites(data, reader, system, item);
  if (system.kind === "baro") {
    return [row("relay", say("relayTitle"), { prose: lead(RELAY_WIKI), wikiTitle: RELAY_WIKI })];
  }
  return [];
}

function systemSteps(
  data: CatalogData,
  reader: Reader,
  system: AcquisitionSystem,
  item: string,
): StepRow[] {
  if (system.kind === "adversary") return adversarySteps(system, item);
  if (system.kind === "companion") return companionSteps(data, reader, system, item);
  if (system.kind === "baro") {
    return [
      row("baro", say("baroTitle"), {
        detail: parts(say("baroDetail", { lastOffered: system.lastOffered })),
        wikiTitle: BARO_WIKI,
      }),
    ];
  }
  return [
    row("invasion", say("invasionTitle"), {
      prose: mechanics(INVASION_WIKI),
      wikiTitle: INVASION_WIKI,
    }),
  ];
}

function baroComponents(data: CatalogData, system: AcquisitionSystem): StepSection | null {
  if (system.kind !== "baro") return null;
  const rows: StepRow[] = [];
  if (system.ducats !== null) {
    rows.push(
      row(`currency:${DUCATS}`, say("ducatsTitle", { ducats: system.ducats }), {
        wikiTitle: DUCATS,
        imageUrl: thingImage(data, DUCATS),
        thing: DUCATS,
      }),
    );
  }
  if (system.credits !== null) {
    rows.push(
      row("credits", say("creditsTitle", { credits: system.credits }), {
        wikiTitle: CREDITS,
        imageUrl: CREDITS_ART,
        thing: CREDITS,
      }),
    );
  }
  return rows.length === 0
    ? null
    : section("components", say("sectionComponents"), rows, { checkable: true });
}

function systemPlan(
  data: CatalogData,
  reader: Reader,
  item: Dossier["item"],
  found: Acquisition,
  system: AcquisitionSystem,
): StepPlan {
  const sections = [
    section(
      "prerequisites",
      say("sectionPrerequisites"),
      withoutRepeats([
        ...headRows(item, reader.masteryRank),
        ...systemPrerequisites(data, reader, system, item.name),
      ]),
    ),
    section("how", say("sectionAcquisition"), systemSteps(data, reader, system, item.name)),
  ];
  const components =
    system.kind === "baro" ? baroComponents(data, system) : componentsSection(data, found);
  if (components) sections.push(components);
  return { sections };
}

function ayaRow(data: CatalogData): StepRow {
  const best = rewardRoutes(data.rewards, AYA).find((route) => route.mission === BOUNTY);
  const place = best ? (bountyHub(best.node) ?? best.place) : null;
  return row("aya", say("ayaTitle"), {
    detail: best && place !== null ? parts(say("ayaDetail", { place, chance: best.chance })) : [],
    brief: best && place !== null ? parts(say("ayaBrief", { place, chance: best.chance })) : [],
    wikiTitle: AYA,
    imageUrl: thingImage(data, AYA),
    thing: AYA,
  });
}

const RELIC_ODDS: Record<string, { intact: number; radiant: number }> = {
  Common: { intact: 25.33, radiant: 16.67 },
  Uncommon: { intact: 11, radiant: 20 },
  Rare: { intact: 2, radiant: 10 },
};

function resurgenceRows(
  data: CatalogData,
  item: string,
  part: ResolvedPart,
  varzia: VarziaStock | null,
): StepRow[] {
  if (varzia === null) return [];
  const byUnique = new Map([...data.relics.values()].map((relic) => [relic.uniqueName, relic]));
  const wanted = part.main ? [MAIN_PART] : [part.name, `${part.name} ${MAIN_PART}`];
  const rows: StepRow[] = [];
  for (const offer of varzia.offers) {
    if (offer.aya === null) continue;
    const relic = byUnique.get(offer.uniqueName);
    if (!relic) continue;
    const drop = data.wiki.relics
      .get(relic.name)
      ?.drops.find(
        (one) => sameName(one.item, item) && wanted.some((name) => sameName(one.part, name)),
      );
    if (!drop) continue;
    const chances = RELIC_ODDS[drop.rarity] ?? null;
    rows.push(
      row(`resurgence:${relic.name}`, say("resurgenceRelicTitle", { relic: relic.name }), {
        detail: parts(
          say("resurgenceRelicDetail", {
            aya: offer.aya,
            rarity: drop.rarity,
            intact: chances?.intact ?? null,
            radiant: chances?.radiant ?? null,
          }),
        ),
        brief: parts(say("ayaPrice", { aya: offer.aya }), drop.rarity),
        wikiTitle: relic.name,
        imageUrl: relic.imageUrl,
        thing: relic.name,
      }),
    );
  }
  return rows;
}

function vaultedPlan(
  data: CatalogData,
  reader: Reader,
  view: Dossier,
  found: Acquisition,
): StepPlan {
  const item = view.item;
  const varzia = reader.varzia ?? null;
  const whole = varzia?.offers.find((offer) => offer.uniqueName === item.uniqueName) ?? null;
  const images = new Map(view.parts.map((part) => [part.name, part.imageUrl]));
  const expiry = varzia?.expiry ?? null;

  const status = row("vaulted", say("vaultedTitle"), {
    detail: parts(
      whole === null
        ? say("vaultedDetail", { item: item.name })
        : say("resurgenceDetail", { item: item.name, expiry }),
    ),
    brief: parts(whole === null ? say("vaultedBrief") : say("resurgenceBrief", { expiry })),
    wikiTitle: VAULT_WIKI,
  });
  const location = varzia?.location ?? null;
  const steps = [
    ayaRow(data),
    row("varzia", say("varziaTitle"), {
      detail: parts(say("varziaDetail", { location, expiry })),
      brief:
        location === null && expiry === null ? [] : parts(say("varziaBrief", { location, expiry })),
      wikiTitle: VARZIA_WIKI,
    }),
  ];
  if (whole?.regalAya !== null && whole?.regalAya !== undefined) {
    steps.push(
      row("whole", say("wholeTitle", { item: item.name }), {
        detail: parts(say("wholeDetail", { regalAya: whole.regalAya })),
        brief: parts(say("wholeBrief", { regalAya: whole.regalAya })),
        wikiTitle: AYA,
      }),
    );
  }

  const sections = [
    section("prerequisites", say("sectionPrerequisites"), [
      ...headRows(item, reader.masteryRank),
      status,
    ]),
    section("how", say("sectionHowToGet"), steps),
    ...found.parts.map((part) => {
      const resurgence = resurgenceRows(data, item.name, part, varzia);
      const rows = [...resurgence, ...alternativeRows(data, reader, part, false)]
        .slice(0, Math.max(ALTERNATIVES_SHOWN, resurgence.length))
        .map((one, index) => ({ ...one, alternative: index > 0 }));
      return section(`part:${part.name}`, partSection(part), rows, {
        imageUrl: images.get(part.name) ?? null,
      });
    }),
  ];
  const components = componentsSection(data, found);
  if (components) sections.push(components);
  return { sections };
}

const QUEST_ROW = "quest:";
const JUNCTION_ROW = "junction:";
const PREREQUISITES = "prerequisites";

interface Settled {
  quests: Set<string>;
  junctions: Set<string>;
}

function settled(data: CatalogData, done: ReadonlySet<string>): Settled {
  const quests = new Set(questsBefore(data.spine, [...done]));
  const junctions = new Set(
    [...quests].flatMap((quest) => questNeeds(data.spine, quest).junctions),
  );
  return { quests, junctions };
}

function pending(entry: StepRow, past: Settled): boolean {
  if (entry.id.startsWith(QUEST_ROW)) return !past.quests.has(entry.id.slice(QUEST_ROW.length));
  if (entry.id.startsWith(JUNCTION_ROW))
    return !past.junctions.has(entry.id.slice(JUNCTION_ROW.length));
  return true;
}

interface Linking {
  self: string;
  masteryReq: number;
  masteryRank: number | undefined;
  done: ReadonlySet<string>;
}

function prerequisitesRead(data: CatalogData, rows: StepRow[], linking: Linking): StepRow[] {
  const past = settled(data, linking.done);
  const kept = withoutRepeats(rows.filter((one) => pending(one, past)));
  const questMastery = kept
    .filter((one) => one.id.startsWith(QUEST_ROW))
    .map((one) => questNeeds(data.spine, one.id.slice(QUEST_ROW.length)).mastery);
  const needed = Math.max(linking.masteryReq, ...questMastery);
  return [
    ...masteryRows(needed, linking.masteryRank),
    ...kept.filter((one) => one.id !== MASTERY_ROW),
  ];
}

function linked(data: CatalogData, plan: StepPlan, linking: Linking): StepPlan {
  const own = (thing: string | null) =>
    thing !== null && thing !== linking.self && isCatalogued(data, thing) ? thing : null;
  return {
    sections: plan.sections
      .map((entry) => ({
        ...entry,
        groups: entry.groups.map((group) => {
          const rows =
            entry.id === PREREQUISITES ? prerequisitesRead(data, group.rows, linking) : group.rows;
          return { ...group, rows: rows.map((one) => ({ ...one, thing: own(one.thing) })) };
        }),
      }))
      .filter((entry) => entry.groups.some((group) => group.rows.length > 0)),
  };
}

export function stepPlan(data: CatalogData, view: Dossier, reader: Reader): StepPlan {
  const plan = itemPlan(data, reader, view);
  return linked(
    data,
    { sections: withGear(data, plan.sections) },
    {
      self: view.item.name,
      masteryReq: view.item.masteryReq,
      masteryRank: reader.masteryRank,
      done: reader.done ?? new Set(),
    },
  );
}

export function collectibleStepPlan(
  data: CatalogData,
  view: CollectibleView,
  reader: Reader,
): StepPlan {
  return linked(data, collectiblePlan(data, reader, view), {
    self: view.collectible.name,
    masteryReq: 0,
    masteryRank: reader.masteryRank,
    done: reader.done ?? new Set(),
  });
}

function itemPlan(data: CatalogData, reader: Reader, view: Dossier): StepPlan {
  const item = view.item;
  const found = resolveAcquisition(data, item);
  if (found.system?.kind === "vaulted") return vaultedPlan(data, reader, view, found);
  if (found.system) return systemPlan(data, reader, item, found, found.system);
  const images = new Map(view.parts.map((part) => [part.name, part.imageUrl]));
  const main = found.parts.find((part) => part.main) ?? null;
  const mainRoute = main?.routes[0] ?? null;
  const others = found.parts.filter((part) => !part.main);
  const shape = found.layout.parts;
  const buyFirst =
    mainRoute !== null && found.layout.blueprint === "apart" && BUY_FIRST.has(mainRoute.kind);

  const prerequisites = [
    ...headRows(item, reader.masteryRank),
    ...requirementRows(data, found.prerequisites, item.name),
    ...reachRows(data, found.places),
  ];
  if (buyFirst && mainRoute) {
    prerequisites.push({
      ...routeRow(data, reader, "buy", mainRoute),
      title: say("buyTitle", { item: item.name }),
      imageUrl: images.get(MAIN_PART) ?? null,
    });
  }

  const sections: StepSection[] = [
    section("prerequisites", say("sectionPrerequisites"), prerequisites),
  ];

  const listed = found.parts.filter((part) => !(part.main && buyFirst));
  const sharedRoute = others[0]?.routes[0] ?? null;

  if (shape === "none" || shape === "unknown" || found.scenario === "no-recipe") {
    const routes = shape === "unknown" ? [] : (found.parts[0]?.routes ?? []);
    const [only, ...rest] = routes.slice(0, ALTERNATIVES_SHOWN);
    sections.push(
      section("how", say("sectionHowToGet"), [
        only
          ? only.kind === "vendor"
            ? { ...howRow(data, reader, only, found), detail: routeDetail(data, reader, only) }
            : howRow(data, reader, only, found)
          : row("how", say("noRouteTitle", { item: item.name }), {
              prose: acquisition(item.name),
              wikiTitle: item.name,
            }),
        ...rest.map((route, index) => ({
          ...routeRow(data, reader, `how:${index}`, route),
          alternative: true,
        })),
      ]),
    );
  } else if (shape === "one-source" && sharedRoute) {
    sections.push(
      section("how", say("sectionHowToGet"), [howRow(data, reader, sharedRoute, found)]),
    );
    sections.push(
      section(
        "blueprints",
        say("sectionBlueprints"),
        listed.map((part) => {
          const route = part.routes[0];
          return row(`part:${part.name}`, partTitle(part), {
            detail: !route
              ? parts(say("partsUnknown"))
              : route.kind === "research"
                ? []
                : routeDetail(data, reader, route),
            brief: route ? routeBrief(data, reader, route) : [],
            where: route ? routeRow(data, reader, `part:${part.name}`, route).where : [],
            imageUrl: images.get(part.name) ?? null,
          });
        }),
      ),
    );
  } else {
    if (shape === "one-place" && sharedRoute?.kind === "bounty") {
      sections.push(
        section("how", say("sectionHowToGet"), [howRow(data, reader, sharedRoute, found)]),
      );
    }
    for (const part of byBestOdds(listed)) {
      const rows =
        part.routes.length === 0
          ? [row(`part:${part.name}:none`, say("partsUnknown"), { wikiTitle: item.name })]
          : alternativeRows(data, reader, part, true);
      sections.push(
        section(`part:${part.name}`, partSection(part), rows, {
          imageUrl: images.get(part.name) ?? null,
        }),
      );
    }
  }

  const components = componentsSection(data, found);
  if (components) sections.push(components);

  return { sections: sections.filter((entry) => entry.groups.some((g) => g.rows.length > 0)) };
}

function dropRows(view: CollectibleView): StepRow[] {
  const { collectible, routes } = view;
  if (collectible.relic?.vaulted) {
    return [
      row(`get:${collectible.name}`, say("getTitle", { name: collectible.name }), {
        detail: parts(say("relicVaulted")),
        wikiTitle: collectible.name,
        imageUrl: collectible.imageUrl,
      }),
    ];
  }
  const placed = routes.slice(0, ALTERNATIVES_SHOWN);
  const flags = bestFlags(placed.map((route) => route.chance));
  const rows = placed.map((route, index) => {
    const value = odds(route.rotation, null, route.chance);
    const title =
      route.place === null
        ? route.mission === null
          ? say("getTitle", { name: collectible.name })
          : say("defeatTitle", { source: route.mission })
        : route.node === null
          ? say("getTitle", { name: collectible.name })
          : say("playTitle", { node: route.node });
    return row(`route:${index}`, title, {
      best: flags[index] === true,
      detail: parts(
        route.place
          ? say("collectibleDetail", { place: route.place, mission: route.mission })
          : null,
        oddsDetail(value),
      ),
      brief: parts(route.place, route.mission, oddsBrief(value)),
      where: parts(
        route.node && route.place && !route.node.includes(", ")
          ? say("nodeOn", { node: route.node, place: route.place })
          : (route.node ?? route.place),
        route.mission,
      ),
      prose: mechanics(route.place ? route.mission : null),
      wikiTitle: route.node ?? collectible.name,
      imageUrl: index === 0 ? collectible.imageUrl : null,
    });
  });
  if (placed.length === 0 && collectible.regions.length > 0) {
    rows.push(
      row(`get:${collectible.name}`, say("getTitle", { name: collectible.name }), {
        detail: parts(say("foundOnDetail", { regions: collectible.regions })),
        brief: parts(...collectible.regions),
        wikiTitle: collectible.name,
        imageUrl: collectible.imageUrl,
      }),
    );
  }
  if (placed.length === 0 && collectible.relic) {
    rows.push(
      row(`get:${collectible.name}`, say("getTitle", { name: collectible.name }), {
        detail: parts(say("relicStillDrops")),
        wikiTitle: collectible.name,
        imageUrl: collectible.imageUrl,
      }),
    );
  }
  return rows;
}

function incarnonRows(data: CatalogData, reader: Reader, name: string): StepRow[] {
  const facts = data.wiki.incarnons.get(name);
  const status = circuitStatus(data.wiki.circuit, "steelPath", name, reader.now);
  const away = status?.weeksAway ?? null;
  const rows = [
    row("circuit", say("circuitModeTitle", { mode: "steelPath" }), {
      detail: parts(say("circuitWeeksDetail", { mode: "steelPath", weeksAway: away, tier: null })),
      brief: away === null ? [] : parts(say("circuitBrief", { weeksAway: away })),
      prose: lead(CIRCUIT_WIKI),
      wikiTitle: CIRCUIT_WIKI,
    }),
  ];
  if (facts?.platinum !== null && facts?.platinum !== undefined) {
    rows.push(
      row("cavalero", say("vendorTitle", { vendor: CAVALERO }), {
        detail: parts(say("cavaleroDetail", { platinum: facts.platinum, now: away === 0 })),
        brief: parts(say("marketPriceBrief", { credits: null, platinum: facts.platinum })),
        wikiTitle: CAVALERO,
        alternative: true,
      }),
    );
  }
  return rows;
}

function vendorByCurrency(data: CatalogData, currency: string): string | null {
  return (
    data.wiki.vendors.find((vendor) => sameName(vendor.currency ?? "", currency))?.name ?? null
  );
}

function honoriaRows(
  data: CatalogData,
  collectible: CollectibleView["collectible"],
): { rows: StepRow[]; quests: string[] } {
  const honoria = collectible.honoria;
  if (!honoria) return { rows: [], quests: [] };
  const tag = honoria.tags.map((one) => data.wiki.honoriaTags.get(one)).find(Boolean) ?? null;
  const price = honoria.price.length > 0 ? say("costs", { costs: honoria.price }) : null;
  const vendor =
    tag?.vendor ??
    honoria.price.map((one) => vendorByCurrency(data, one.currency)).find(Boolean) ??
    (honoria.tags.includes(FOCUS_TAG) ? FOCUS_STORE : null);
  if (price !== null && vendor !== null) {
    return {
      rows: [
        row("honoria", say("curatedVendorTitle", { vendor, thing: null }), {
          detail: parts(
            say("curatedVendorDetail", {
              vendor,
              place: tag?.place ?? null,
              costs: honoria.price,
              rank: null,
              built: null,
              earned: null,
            }),
          ),
          brief: parts(tag?.place, price),
          wikiTitle: tag?.vendor ?? vendor,
        }),
      ],
      quests: tag?.quests ?? [],
    };
  }
  const line = honoria.description ?? tag?.line ?? null;
  if (line === null) return { rows: [], quests: [] };
  return {
    rows: [
      row("honoria", say("honoriaEarnTitle"), {
        detail: parts(line),
        brief: parts(price),
        wikiTitle: HONORIA_WIKI,
      }),
    ],
    quests: tag?.quests ?? [],
  };
}

function curatedCollectibleRows(data: CatalogData, reader: Reader, name: string): StepRow[] {
  const cite = data.curated.items.get(name)?.cite ?? name;
  return curatedFor(data.curated, name, null).map((source, index) => {
    const facts = curatedFacts(data, reader, source, name);
    return row(`curated:${index}`, facts.title, {
      detail: parts(facts.detail),
      brief: facts.brief,
      wikiTitle: cite,
      alternative: index > 0,
    });
  });
}

function baroRows(data: CatalogData, name: string): StepRow[] {
  const offer = data.wiki.baro.get(name);
  if (!offer) return [];
  return [
    row("baro", say("baroTitle"), {
      detail: parts(say("baroPriceDetail", offer)),
      brief:
        offer.credits === null && offer.ducats === null
          ? []
          : parts(say("baroBrief", { credits: offer.credits, ducats: offer.ducats })),
      wikiTitle: BARO_WIKI,
    }),
  ];
}

function vendorRows(collectible: CollectibleView["collectible"], room: number): StepRow[] {
  return collectible.offers.slice(0, room).map((offer, index) =>
    row(`vendor:${index}`, say("vendorTitle", { vendor: offer.vendor }), {
      detail: parts(
        say("vendorDetail", {
          vendor: offer.vendor,
          cost: offer.cost,
          currency: offer.currency,
          rank: offer.rank,
          quest: offer.quest,
        }),
      ),
      brief: parts(priceBrief(offer.cost, offer.currency, offer.rank)),
      prose: lead(offer.link),
      wikiTitle: offer.link,
    }),
  );
}

function recipeSection(
  data: CatalogData,
  collectible: CollectibleView["collectible"],
): StepSection | null {
  const facts = collectible.incarnon ? data.wiki.incarnons.get(collectible.name) : undefined;
  const ingredients = facts?.install ?? collectible.recipe?.ingredients ?? [];
  const credits = facts ? null : (collectible.recipe?.credits ?? null);
  const resources = data.wiki.resources;
  const rows = ingredients.map((one) => {
    const fact = resources.get(one.name);
    return row(`resource:${one.name}`, say("resourceTitle", { name: one.name, count: one.count }), {
      detail: fact
        ? parts(resourceDetail(fact.rarity, fact.location))
        : arsenalImage(data, one.name.replace(/ (Systems|Chassis|Neuroptics)$/, "")) !== null
          ? parts(say("partConsumedDetail"))
          : [],
      wikiTitle: fact?.link ?? one.name,
      imageUrl: thingImage(data, one.name),
      thing: one.name,
    });
  });
  if (credits !== null && credits > 0) {
    rows.push(
      row("credits", say("creditsTitle", { credits }), { wikiTitle: CREDITS, thing: CREDITS }),
    );
  }
  return rows.length === 0
    ? null
    : section("components", say("sectionComponents"), rows, { checkable: true });
}

function titleKey(entry: StepRow): string {
  const title = entry.title;
  const base =
    title.say === "vendorTitle" || (title.say === "curatedVendorTitle" && title.thing === null)
      ? `buy:${title.vendor}`
      : JSON.stringify(title);
  return `${entry.best ? "best:" : ""}${entry.alternative ? "or:" : ""}${base}`;
}

function collectiblePlan(data: CatalogData, reader: Reader, view: CollectibleView): StepPlan {
  const { collectible, routes } = view;
  const place =
    routes.find((route) => route.place !== null)?.place ?? collectible.regions[0] ?? null;

  const honoria = honoriaRows(data, collectible);
  const curated = curatedCollectibleRows(data, reader, collectible.name);
  const how = [
    ...dropRows(view),
    ...(collectible.incarnon ? incarnonRows(data, reader, collectible.name) : []),
    ...baroRows(data, collectible.name),
    ...curated,
    ...honoria.rows,
  ];
  const sold = new Set(how.map(titleKey));
  how.push(
    ...vendorRows(collectible, Math.max(ALTERNATIVES_SHOWN - how.length, 0)).filter(
      (entry) => !sold.has(titleKey(entry)),
    ),
  );
  if (how.length === 0) {
    how.push(
      row(`get:${collectible.name}`, say("getTitle", { name: collectible.name }), {
        prose: acquisition(collectible.name),
        wikiTitle: collectible.name,
        imageUrl: collectible.imageUrl,
      }),
    );
  }

  const incarnon = collectible.incarnon ? data.wiki.incarnons.get(collectible.name) : undefined;
  const curatedQuests = [
    ...curatedFor(data.curated, collectible.name, null).flatMap((source) =>
      "quest" in source && source.quest && source.type !== "quest" ? [source.quest] : [],
    ),
    ...collectible.offers.slice(0, 1).flatMap((offer) => vendorGates(data.curated, offer.vendor)),
  ];
  const requires = incarnon?.requires ?? [];
  const unlocks = requires.filter((name) => sameName(name, STEEL_PATH));
  const prerequisites = [
    ...questRowsFor(data, [
      ...requires.filter((name) => !unlocks.includes(name)),
      ...honoria.quests,
      ...curatedQuests,
    ]),
    ...unlocks.map((name) =>
      row(`unlock:${name}`, say("unlockTitle", { hub: name }), {
        prose: lead(name),
        wikiTitle: name,
      }),
    ),
    ...(baroRows(data, collectible.name).length > 0
      ? [row("relay", say("relayTitle"), { prose: lead(RELAY_WIKI), wikiTitle: RELAY_WIKI })]
      : []),
    ...(place === null ? [] : reachRows(data, [place])),
  ];

  const sections = [
    section("prerequisites", say("sectionPrerequisites"), prerequisites),
    section("how", say("sectionHowToGet"), how),
  ];
  const recipe = recipeSection(data, collectible);
  if (recipe) sections.push(recipe);
  return { sections: sections.filter((entry) => entry.groups.some((g) => g.rows.length > 0)) };
}

export function questStepPlan(data: CatalogData, quest: Quest, reader: Reader): StepPlan {
  const needs = questNeeds(data.spine, quest.name);
  const prerequisites = [
    ...questRowsFor(data, needs.quests),
    ...needs.junctions.map((junction) => junctionRow(data, junction)),
    ...reachRows(data, quest.availableAt),
  ];
  const start = row(`start:${quest.name}`, say("questStartTitle", { quest: quest.name }), {
    detail: parts(quest.start),
    prose: lead(quest.wikiTitle),
    wikiTitle: quest.wikiTitle,
  });
  return linked(
    data,
    {
      sections: [
        section(PREREQUISITES, say("sectionPrerequisites"), prerequisites),
        section("how", say("sectionHowToGet"), [start]),
      ],
    },
    {
      self: quest.name,
      masteryReq: needs.mastery,
      masteryRank: reader.masteryRank,
      done: reader.done ?? new Set(),
    },
  );
}

export interface PlanLock {
  row: string;
  gap: ReachGap;
}

const PLACE_ROW = "place:";

function junctionGap(reach: Reach, place: string): ReachGap | null {
  const gap = placeGap(reach, place);
  return gap?.kind === "junction" ? gap : null;
}

function rowGap(entry: StepRow, reach: Reach): ReachGap | null {
  if (entry.id === MASTERY_ROW && entry.title.say === "masteryTitle") {
    return rankGap(reach, entry.title.rank);
  }
  if (entry.id.startsWith(PLACE_ROW)) return junctionGap(reach, entry.id.slice(PLACE_ROW.length));
  if (entry.id.startsWith(JUNCTION_ROW)) {
    return junctionGap(reach, entry.id.slice(JUNCTION_ROW.length).replace(JUNCTION, ""));
  }
  return null;
}

export function planLock(plan: StepPlan, reach: Reach): PlanLock | null {
  const rows = plan.sections
    .filter((entry) => entry.id === PREREQUISITES)
    .flatMap((entry) => entry.groups.flatMap((group) => group.rows));
  for (const entry of rows) {
    const gap = rowGap(entry, reach);
    if (gap) return { row: entry.id, gap };
  }
  return null;
}
