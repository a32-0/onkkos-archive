interface Odds {
  runs: number | null;
  rotation: string | null;
  stage: string | null;
  chance: number | null;
}

interface RelicOdds {
  rarity: string | null;
  intact: number | null;
  radiant: number | null;
}

interface Price {
  cost: number | null;
  currency: string | null;
  rank: string | null;
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

function number(value: number): string {
  return value.toLocaleString("en-US");
}

function listOf(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function joined(parts: readonly (string | null | undefined)[]): string | null {
  const kept = parts.filter((part): part is string => typeof part === "string" && part.length > 0);
  return kept.length > 0 ? kept.join(" · ") : null;
}

function price(cost: number | null, currency: string | null): string | null {
  return cost === null ? null : `${number(cost)} ${currency ?? ""}`.trim();
}

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function dayMonth(iso: string): string {
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
}

function counted(name: string, count: number): string {
  return count > 1 ? `${name} ×${number(count)}` : name;
}

interface Season {
  season: string;
  rank: number;
}

export const BRIEF = {
  oddsBrief: ({ runs, rotation, stage, chance }: Odds) =>
    runs !== null
      ? joined([
          `~${runs} ${plural(runs, "Run", "Runs")}`,
          rotation ? `Rotation ${rotation}` : stage,
        ])
      : joined([chance !== null && chance > 0 ? `${chance}%` : null, rotation, stage]),
  relicBrief: ({ rarity, intact, radiant }: RelicOdds) =>
    joined([
      rarity,
      intact === null ? null : `${intact}% Intact`,
      radiant === null ? null : `${radiant}% Radiant`,
    ]),
  vendorBrief: ({ vendor, cost, currency, rank }: Price & { vendor: string }) =>
    joined([vendor, price(cost, currency), rank]),
  priceBrief: ({ cost, currency, rank }: Price) => joined([price(cost, currency), rank]),
  marketBrief: ({ credits }: { credits: number }) => `Market · ${number(credits)} credits`,
  marketPriceBrief: ({ credits, platinum }: { credits: number | null; platinum: number | null }) =>
    credits === null ? `${number(platinum ?? 0)} platinum` : `${number(credits)} credits`,
  costs: ({ costs }: { costs: readonly { currency: string; amount: number }[] }) =>
    listOf(costs.map((one) => `${number(one.amount)} ${one.currency}`)),
  percent: ({ chance }: { chance: number }) => `${chance}%`,
  circuitBrief: ({ weeksAway }: { weeksAway: number }) =>
    weeksAway === 0 ? "This week" : `In ${weeksAway} ${plural(weeksAway, "week", "weeks")}`,
  approxPercent: ({ chance }: { chance: number }) => `~${chance}%`,
  nightwaveBrief: ({ ranks }: { ranks: readonly Season[] }) =>
    ranks.map((one) => `${one.season} R${one.rank}`).join(" · "),
  ayaBrief: ({ place, chance }: { place: string; chance: number | null }) =>
    joined([`${place} bounties`, chance === null ? null : `${chance}%`]),
  ayaPrice: ({ aya }: { aya: number }) => `${aya} Aya`,
  vaultedBrief: () => "Out of Prime Resurgence",
  resurgenceBrief: ({ expiry }: { expiry: string | null }) =>
    expiry === null ? "In Prime Resurgence" : `In Prime Resurgence until ${dayMonth(expiry)}`,
  varziaBrief: ({ location, expiry }: { location: string | null; expiry: string | null }) =>
    joined([location, expiry === null ? null : `until ${dayMonth(expiry)}`]),
  wholeBrief: ({ regalAya }: { regalAya: number }) => `${regalAya} Regal Aya`,
  baroBrief: ({ credits, ducats }: { credits: number | null; ducats: number | null }) =>
    joined([
      credits === null ? null : `${number(credits)} credits`,
      ducats === null ? null : `${number(ducats)} ducats`,
    ]),
} as const;

export const TITLES = {
  sectionPrerequisites: () => "Prerequisites",
  sectionHowToGet: () => "How to get",
  sectionAcquisition: () => "Acquisition",
  sectionBlueprints: () => "Blueprints",
  sectionComponents: () => "Components",
  partSection: ({ part, count }: { part: string; count: number }) => counted(part, count),
  partTitle: ({ part, count }: { part: string; count: number }) => counted(part, count),

  masteryTitle: ({ rank }: { rank: number }) => `Mastery Rank ${rank}`,
  questTitle: ({ quest }: { quest: string }) => `Complete ${quest}`,
  intrinsicsTitle: ({ rank }: { rank: number | null }) =>
    rank === null ? "Railjack Intrinsics" : `Railjack Intrinsics rank ${rank}`,
  nemesisTitle: ({ name }: { name: string }) => `An active ${name}`,
  clanTitle: () => "Join or create a clan",
  rankTitle: ({ rank, vendor }: { rank: string; vendor: string }) => `${rank} with ${vendor}`,
  reachTitle: ({ place }: { place: string }) => `Reach ${place}`,
  slotTitle: ({ kind }: { kind: string }) => `${kind} Slot`,

  buyTitle: ({ item }: { item: string }) => `Buy the ${item} Blueprint`,
  marketTitle: () => "Buy it in your ship's Market",
  vendorTitle: ({ vendor }: { vendor: string }) => `Buy it from ${vendor}`,
  researchTitle: ({ lab }: { lab: string }) => `Research it in the ${lab}`,

  playTitle: ({ node }: { node: string }) => `Play ${node}`,
  playBountiesTitle: ({ place }: { place: string }) => `Play ${place} bounties`,
  bountyTitle: ({ tier, low, high }: { tier: string; low: string | null; high: string | null }) =>
    low !== null && high !== null ? `Play a bounty, level ${low}–${high}` : `Play ${tier}`,
  defeatTitle: ({ source }: { source: string }) => `Defeat ${source}`,
  openRelicTitle: ({ relic }: { relic: string }) => `Open the ${relic}`,
  noRouteTitle: ({ item }: { item: string }) => `How ${item} is obtained`,

  resourceTitle: ({ name, count }: { name: string; count: number }) => `${name} ×${number(count)}`,
  weaponTitle: ({ name, count }: { name: string; count: number }) => `${name} ×${number(count)}`,
  creditsTitle: ({ credits }: { credits: number }) => `${number(credits)} Credits`,
  currencyTitle: ({
    cost,
    currency,
    vendor,
  }: {
    cost: number;
    currency: string;
    vendor: string;
  }) =>
    currency === "Standing"
      ? `${number(cost)} standing with ${vendor}`
      : `${number(cost)} ${currency}`,
  ducatsTitle: ({ ducats }: { ducats: number }) => `${number(ducats)} Orokin Ducats`,

  getTitle: ({ name }: { name: string }) => name,

  railjackTitle: () => "Acquire a Railjack",
  relayTitle: () => "Reach a Tenno Relay",
  unlockTitle: ({ hub }: { hub: string }) => `Unlock ${hub}`,
  findTitle: ({ larva }: { larva: string }) => `Find a ${larva}`,
  vanquishTitle: ({ adversary }: { adversary: string }) => `Vanquish a ${adversary}`,
  tradeTitle: ({ adversary }: { adversary: string }) => `Or trade for a converted ${adversary}`,
  baroTitle: () => "Visit Baro Ki'Teer",
  invasionTitle: () => "Play Invasions",

  acquireTitle: ({ name, count }: { name: string; count: number }) =>
    count > 1 ? `Acquire ${count} ${name}s` : `Acquire ${article(name)} ${name}`,
  addTitle: ({ name }: { name: string }) => `Add ${article(name)} ${name}`,
  useIncubatorTitle: () => "Use the Incubator",
  existingKavatTitle: () => "An existing Kavat",
  infectTitle: () => "Get it bitten in the Plains of Eidolon",
  lureTitle: ({ lure }: { lure: string }) => `Lure one with a ${lure} (Optional)`,
  imprintTitle: () => "Imprint the infected Kavat",
  secondImprintTitle: () => "Make a second imprint",
  breedTitle: ({ item }: { item: string }) => `Breed a ${item}`,
  visitSonTitle: () => "Visit Son",
  captureTitle: () => "Capture a Weakened Subspecies",
  mutagenTitle: () => "Buy a Mutagen",
  antigenTitle: () => "Buy an Antigen",
  returnTitle: () => "Return to Son",
  gildTitle: () => "Gild it (Optional)",
  houndTitle: () => "Assemble the Hound",

  vaultedTitle: () => "Prime Vaulted",
  ayaTitle: () => "Acquire Aya",
  varziaTitle: () => "Visit Varzia",
  resurgenceRelicTitle: ({ relic }: { relic: string }) => `Buy the ${relic} from Varzia`,
  wholeTitle: ({ item }: { item: string }) => `Or buy ${item} whole`,

  curatedVendorTitle: ({ vendor, thing }: { vendor: string; thing: string | null }) =>
    `Buy ${thing ?? "it"} from ${vendor}`,
  copiesTitle: ({ vendor }: { vendor: string }) => `Buy another copy from ${vendor}`,
  marketTitle2: ({ blueprint }: { blueprint: boolean }) =>
    blueprint ? "Buy the blueprint in your ship's Market" : "Buy it in your ship's Market",
  questRewardTitle: ({ quest }: { quest: string }) => `Complete ${quest}`,
  junctionTitle: ({ junction }: { junction: string }) => `Clear the ${junction}`,
  enigmaTitle: () => "Solve Enigma puzzles in Duviri",
  anniversaryTitle: () => "Claim it from the anniversary alerts",
  unavailableTitle: () => "No longer obtainable",
  raceTitle: ({ race }: { race: string }) => `Win the ${race} K-Drive race`,
  bundledTitle: ({ things }: { things: readonly string[] }) => `Claim a ${things.join(" or ")}`,
  primeAccessTitle: ({ warframe }: { warframe: string }) =>
    `Buy the ${warframe} Access Accessories pack`,
  adversaryTitle: ({ adversary, element }: { adversary: string; element: string | null }) =>
    `Vanquish or convert ${element ? `${article(element)} ${element}` : article(adversary)} ${adversary}`,
  nightwaveTitle: () => "Earn it in Nightwave",
  dropTitle: ({ source }: { source: string }) => `Defeat ${source}`,
  scanTitle: ({ target }: { target: string }) => `Scan a live ${target}`,
  cystTitle: ({ warframe }: { warframe: string }) =>
    `Get infected by ${warframe} in the Helminth room`,
  dojoTitle: ({ room }: { room: string }) => `Buy it in ${room}`,
  eventTitle: ({ event }: { event: string }) => `Play ${event}`,
  goalTitle: ({ focus, wearing }: { focus: number; wearing: string }) =>
    `Earn ${number(focus)} Focus wearing the ${wearing}`,
  circuitModeTitle: ({ mode }: { mode: string }) =>
    mode === "steelPath" ? "Play the Steel Path Circuit" : "Play the Circuit",
  honoriaEarnTitle: () => "Earn it",
} as const;

export function briefLine(parts: readonly (string | null)[]): string {
  return joined(parts) ?? "";
}
