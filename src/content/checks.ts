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

interface Cost {
  currency: string;
  amount: number;
}

interface Place {
  place: string;
  node: string;
}

const SENTENCE_LOCATION =
  /^(Rewarded|Obtained|Dropped|Purchased|Awarded|Earned|Found|Sold|Bought|Acquired|Can|Only|Given)\b/;

function capital(text: string): string {
  return text.length > 0 ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function ordinal(value: number): string {
  const tail = value % 100;
  if (tail >= 11 && tail <= 13) return `${value}th`;
  return `${value}${["th", "st", "nd", "rd"][value % 10] ?? "th"}`;
}

function longDate(iso: string): string {
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function costsOf(costs: readonly Cost[]): string {
  return listOf(costs.map((one) => `${number(one.amount)} ${one.currency}`));
}

interface PlaceStop {
  place: string;
  junction: string | null;
  from: string | null;
}

function placeThrough({ place, junction, from }: PlaceStop): string {
  return junction === null || from === null ? place : `${place}, past the ${junction} on ${from}`;
}

function junctionOn({ junction, from }: { junction: string; from: string | null }): string {
  return from === null ? junction : `the ${junction} on ${from}`;
}

function commaList(parts: readonly (string | null | undefined)[]): string | null {
  const kept = parts.filter((part): part is string => typeof part === "string" && part.length > 0);
  return kept.length > 0 ? kept.join(", ") : null;
}

function runsLine(runs: number | null): string | null {
  return runs === null
    ? null
    : `so about ${runs} ${plural(runs, "run", "runs")} for an even chance`;
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
  nodeOn: ({ node, place }: { node: string; place: string }) => `${node} (${place})`,
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
  sectionAcquisition: () => "How to get",
  sectionBlueprints: () => "Blueprints",
  sectionComponents: () => "Components",
  partSection: ({ part, count }: { part: string; count: number }) => counted(part, count),
  partTitle: ({ part, count }: { part: string; count: number }) => counted(part, count),

  masteryTitle: ({ rank }: { rank: number }) => `Mastery Rank ${rank}`,
  questTitle: ({ quest }: { quest: string }) => `Complete ${quest}`,
  questsTitle: ({ count }: { count: number }) => `Complete ${count} quests`,
  junctionsTitle: ({ count }: { count: number }) => `Clear ${count} Junctions`,
  placesTitle: ({ count }: { count: number }) => `Reach ${count} places`,
  questStartTitle: ({ quest }: { quest: string }) => `Start ${quest}`,
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
  openRelicTitle: ({ relic, vaulted }: { relic: string; vaulted: boolean }) =>
    vaulted ? `Open ${relic} (Vaulted)` : `Open ${relic}`,
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

export const DETAILS = {
  groupHere: ({ places }: { places: readonly string[] }) => `${listOf(places)} specific`,
  groupElsewhere: () => "Different locations",
  groupForGear: ({ gear, optional }: { gear: string; optional: boolean }) =>
    optional ? `For the ${gear} (Optional)` : `For the ${gear}`,

  masteryDetail: ({ now, required }: { now: number; required: number }) =>
    now >= required
      ? `You are Mastery Rank ${now}.`
      : `Needs Mastery Rank ${required}. You are Mastery Rank ${now}.`,
  masteryUnknownDetail: () =>
    "Mastery comes from ranking weapons, Warframes, companions and vehicles you have never levelled.",
  questDetail: () => "You will find it in your Codex.",
  questsDetail: ({ quests }: { quests: string[] }) =>
    `In this order: ${listOf(quests)}. You will find them in your Codex.`,
  junctionsDetail: ({ junctions }: { junctions: { junction: string; from: string | null }[] }) =>
    `${capital(listOf(junctions.map(junctionOn)))}.`,
  placesDetail: ({ places }: { places: PlaceStop[] }) => `${listOf(places.map(placeThrough))}.`,
  intrinsicsDetail: () => "Earned by flying Railjack missions.",
  nemesisDetail: () => "The node only opens while one is hunting you.",
  clanDetail: ({ item, lab }: { item: string; lab: string }) =>
    `${item} is researched in the ${lab} of a clan dojo.`,
  junctionDetail: ({ junction, from }: { junction: string; from: string }) =>
    `Clear the ${junction} on ${from}.`,
  slotDetail: () => "Make sure you have an empty slot for it.",
  onPlanet: ({ planet }: { planet: string }) => `On ${planet}.`,

  marketDetail: ({ credits }: { credits: number }) =>
    `Sold in your ship's Market for ${number(credits)} credits.`,
  vendorDetail: ({
    vendor,
    cost,
    currency,
    rank,
    quest,
  }: Price & { vendor: string; quest: string | null }) => {
    const sold = price(cost, currency);
    const at = rank ? `, at ${rank}` : "";
    const after = quest ? `, once ${quest} is done` : "";
    return `${vendor} sells it${sold ? ` for ${sold}` : ""}${at}${after}.`;
  },
  locatorDetail: ({ key, vendor, node }: { key: string; vendor: string; node: string | null }) =>
    node ? `Buy the ${key} from ${vendor}, then play ${node}.` : `Buy the ${key} from ${vendor}.`,
  researchDetail: ({ lab }: { lab: string }) =>
    `Researched in the ${lab}, then replicated in the dojo.`,

  bountyTierDetail: ({ low, high }: { low: string; high: string }) =>
    `Best odds in the level ${low}–${high} bounty.`,
  nodeDetail: ({
    place,
    mission,
    boss,
  }: {
    place: string;
    mission: string | null;
    boss: string | null;
  }) => {
    const what = boss ? `${mission ?? "Assassination"} against ${boss}` : mission;
    return what ? `${place}: ${what}.` : `${place}.`;
  },
  odds: ({ runs, rotation, stage, chance }: Odds) => {
    const where = commaList([rotation ? `rotation ${rotation}` : null, stage?.toLowerCase()]);
    const odds =
      chance !== null && chance > 0 ? commaList([`${chance}% a run`, runsLine(runs)]) : null;
    if (where !== null) return `It drops at ${commaList([where, odds])}.`;
    return odds === null ? null : `${capital(odds)}.`;
  },
  relicOdds: ({
    rarity,
    intact,
    radiant,
    vaulted,
    farm,
  }: RelicOdds & { vaulted: boolean; farm: Place | null }) => {
    const odds = [
      intact === null ? null : `${intact}% intact`,
      radiant === null ? null : `${radiant}% radiant`,
    ].filter((one): one is string => one !== null);
    const head = [rarity, odds.join(" and ")].filter(Boolean).join(". ");
    const tail = vaulted
      ? "Vaulted: the relic no longer drops."
      : farm
        ? `The relic drops on ${farm.node}, ${farm.place}.`
        : "";
    const line = [head ? `${head}.` : "", tail].filter(Boolean).join(" ");
    return line.length > 0 ? line : null;
  },
  dropDetail: ({ place, node }: Place) => `It drops on ${node}, ${place}.`,
  partsUnknown: () => "No known source for this part yet.",

  resourceDetail: ({ rarity, location }: { rarity: string | null; location: string | null }) => {
    const where = location ? location.replace(/\.$/, "") : null;
    if (where && SENTENCE_LOCATION.test(where)) return `${where}.`;
    const kind = rarity ? `${capital(article(rarity))} ${rarity.toLowerCase()} resource` : null;
    if (kind && where) return `${kind} from ${where}.`;
    if (where) return `From ${where}.`;
    return kind ? `${kind}.` : null;
  },
  weaponDetail: () => "Built in your foundry, then used up by this recipe.",
  partConsumedDetail: () => "Built in your foundry, then used up by this recipe.",

  collectibleDetail: ({ place, mission }: { place: string; mission: string | null }) =>
    mission ? `${place}, ${mission}.` : `${place}.`,
  foundOnDetail: ({ regions }: { regions: readonly string[] }) =>
    `Any mission on ${listOf(regions)} drops it.`,
  relicVaulted: () => "Vaulted: it no longer drops.",
  relicStillDrops: () => "Not vaulted, but no current drop table lists it.",

  confrontationDetail: ({ place }: { place: string }) =>
    `Needed to reach ${place} for the final confrontation.`,
  baroDetail: ({ lastOffered }: { lastOffered: string | null }) =>
    lastOffered === null
      ? "His stock changes every visit."
      : `He last brought it on ${longDate(lastOffered)}; his stock changes every visit.`,
  baroPriceDetail: ({
    credits,
    ducats,
    lastOffered,
  }: {
    credits: number | null;
    ducats: number | null;
    lastOffered: string | null;
  }) => {
    const sold = listOf(
      [
        credits === null ? null : `${number(credits)} credits`,
        ducats === null ? null : `${number(ducats)} Orokin Ducats`,
      ].filter((one): one is string => one !== null),
    );
    const last = lastOffered === null ? "." : `; he last brought it on ${longDate(lastOffered)}.`;
    return `He sells it for ${sold}${last}`;
  },

  incubateDetail: ({ item }: { item: string }) =>
    `The breed is random; two Genetic Code Templates pass on their parents' traits, often but not always ${article(item)} ${item}.`,
  cystIncubateDetail: () => "With the cyst grown, choose Begin Incubation under Kubrow Breeding.",
  existingKavatDetail: () => "It is the one that gets infected.",
  infectDetail: () => "Wild Vasca roam the Plains at night; a bitten Kavat glows red.",
  imprintDetail: () =>
    "Use a Genetic Code Template on it in the Incubator; that cures it and keeps a Vasca imprint.",
  secondImprintDetail: () => "Breeding takes two imprints, so infect and imprint again.",
  breedDetail: () => "Use both imprints in the Incubator.",
  captureDetail: ({ species }: { species: string }) =>
    `Tranquilize a weakened ${species} in the Cambion Drift and capture it through Conservation.`,
  sonPartsDetail: ({ rank, cost }: { rank: string | null; cost: number | null }) => {
    const from = rank ? ` from ${rank}` : "";
    const standing = cost === null ? "" : `, for ${number(cost)} standing and up`;
    return `Son sells their blueprints${from}${standing}.`;
  },
  returnDetail: ({ species }: { species: string }) =>
    `Choose ${species} Revivification and pick the subspecies, Mutagen and Antigen.`,
  gildDetail: () => "At rank 30, Son gilds it under Experimental Procedures.",
  houndDetail: () => "Each vanquished Sister drops one Hound part at random; Legs assembles them.",

  vaultedDetail: ({ item }: { item: string }) =>
    `${item}'s relics no longer drop; Varzia brings them back in rotation.`,
  resurgenceDetail: ({ item, expiry }: { item: string; expiry: string | null }) =>
    expiry === null
      ? `${item} is back in Prime Resurgence.`
      : `${item} is back in Prime Resurgence until ${dayMonth(expiry)}.`,
  ayaDetail: ({ place, chance }: { place: string; chance: number | null }) =>
    chance === null
      ? `It drops in ${place} bounties.`
      : `Best odds: ${place} bounties, ${chance}% a run.`,
  varziaDetail: ({ location, expiry }: { location: string | null; expiry: string | null }) => {
    if (location === null) return "She sells vaulted relics for Aya; her stock rotates.";
    const until = expiry === null ? "" : ` until ${dayMonth(expiry)}`;
    return `Find her in ${location}${until}; she sells relics for Aya.`;
  },
  resurgenceRelicDetail: ({
    aya,
    rarity,
    intact,
    radiant,
  }: {
    aya: number;
    rarity: string;
    intact: number | null;
    radiant: number | null;
  }) => {
    const odds = [
      intact === null ? null : `${intact}% intact`,
      radiant === null ? null : `${radiant}% radiant`,
    ].filter((one): one is string => one !== null);
    return `${aya} Aya this rotation, then open it. ${rarity}${odds.length > 0 ? `: ${odds.join(" and ")}` : ""}.`;
  },
  wholeDetail: ({ regalAya }: { regalAya: number }) =>
    `${regalAya} Regal Aya at Varzia; Regal Aya is bought with platinum.`,

  otherWays: ({ ways }: { ways: readonly { title: string; brief: string | null }[] }) => {
    const listed = ways.map((way) => {
      const title = `${way.title.charAt(0).toLowerCase()}${way.title.slice(1)}`;
      return way.brief ? `${title} (${way.brief})` : title;
    });
    return `Or: ${listed.join("; ")}.`;
  },
  curatedVendorDetail: ({
    vendor,
    place,
    costs,
    rank,
    built,
    earned,
  }: {
    vendor: string;
    place: string | null;
    costs: readonly Cost[];
    rank: string | null;
    built: string | null;
    earned: string | null;
  }) =>
    [
      `${capital(vendor)}${place ? ` in ${place}` : ""} sells it for ${costsOf(costs)}`,
      rank ? `, at ${rank}` : "",
      built ? `; building it gives ${built}` : "",
      earned ? `; the currency comes from ${earned}s` : "",
      ".",
    ].join(""),
  copiesDetail: ({ vendor, costs }: { vendor: string; costs: readonly Cost[] }) =>
    `${vendor} sells extra copies for ${costsOf(costs)}.`,
  marketPriceDetail: ({
    credits,
    platinum,
    bundle,
    blueprint,
  }: {
    credits: number | null;
    platinum: number | null;
    bundle: string | null;
    blueprint: boolean;
  }) => {
    if (bundle) return `Only in the ${bundle}, for ${number(platinum ?? 0)} platinum.`;
    const sold = blueprint ? "Its blueprint is sold" : "Sold";
    const cost =
      credits === null ? `${number(platinum ?? 0)} platinum` : `${number(credits)} credits`;
    return `${sold} in your ship's Market for ${cost}.`;
  },
  questRewardDetail: ({ choice }: { choice: boolean }) =>
    choice
      ? "The quest lets you choose it as your starting weapon."
      : "The quest gives it as a reward.",
  junctionRewardDetail: ({ from }: { from: string | null }) =>
    from ? `On ${from}; clearing it gives the reward.` : "Clearing it gives the reward.",
  enigmaDetail: ({ chance }: { chance: number }) =>
    `Each solved puzzle has a ${chance}% chance to drop one part.`,
  anniversaryDetail: ({ year }: { year: number | null }) =>
    year === null
      ? "The anniversary alerts return every March."
      : `It marked the game's ${ordinal(year)} anniversary and returns with the alerts every March.`,
  unavailableDetail: ({
    reason,
    event,
    until,
  }: {
    reason: string;
    event: string | null;
    until: string | null;
  }) => {
    const date = until === null ? null : longDate(until);
    switch (reason) {
      case "founders":
        return `It came with the Founders packs, which closed on ${date ?? "1 November 2013"}.`;
      case "stream":
        return `It was a ${event ?? "Twitch"} drop${date ? ` on ${date}` : ""}.`;
      case "exclusive":
        return `It came with the ${event ?? "exclusive bundle"}${date ? `, sold until ${date}` : ""}.`;
      case "pack":
        return `It came with the ${event ?? "pack"}.`;
      case "promotion":
        return `It came from the ${event ?? "promotion"} challenges, which have ended.`;
      default:
        return `A seasonal item in your ship's Market${date ? `, last sold until ${date}` : ""}.`;
    }
  },
  raceDetail: ({ place }: { place: string }) =>
    `It runs on the ${place}; the active races change every day.`,
  bundledDetail: ({ things }: { things: readonly string[] }) =>
    `It comes with ${listOf(things)}, already fitted.`,
  primeAccessDetail: ({
    from,
    until,
    warframe,
    resurgence,
  }: {
    from: string;
    until: string | null;
    warframe: string;
    resurgence: boolean;
  }) => {
    const sale =
      until === null
        ? `On sale since ${longDate(from)}.`
        : `Sold from ${longDate(from)} until ${longDate(until)}.`;
    return resurgence ? `${sale} It returns when Varzia brings ${warframe} back.` : sale;
  },
  adversaryDetail: ({ chance }: { chance: number }) =>
    `About ${chance}% of them carry an Ephemera; only one carrying this one drops it.`,
  nightwaveDetail: ({ ranks }: { ranks: readonly Season[] }) =>
    `${listOf(ranks.map((one) => `Rank ${one.rank} in ${one.season}`))}.`,
  dropBlueprintDetail: ({ chance }: { chance: number | null }) =>
    chance === null ? "It drops this blueprint." : `${chance}% chance to drop the blueprint.`,
  scanDetail: ({ chance }: { chance: number }) => `Each scan has a ${chance}% chance to give one.`,
  cystDetail: ({ days }: { days: number }) =>
    `The cyst appears on the infected Warframe after a day and matures by day ${days}.`,
  dojoDetail: ({ room, credits }: { room: string; credits: number | null }) => {
    const cost = credits === null ? "" : `, for ${number(credits)} credits`;
    return `${room} in your clan dojo sells it without research${cost}.`;
  },
  eventDetail: ({
    vendor,
    costs,
    progress,
  }: {
    vendor: string | null;
    costs: readonly Cost[] | null;
    progress: number | null;
  }) => {
    if (vendor === null || costs === null) {
      return "A free reward that returns with every edition of the event.";
    }
    const once = progress === null ? "" : ` once Community Progress reaches ${progress}%`;
    return `${vendor} sells it for ${costsOf(costs)}${once}.`;
  },
  goalDetail: () => "Focus converted from Eidolon Shards does not count.",
  circuitWeeksDetail: ({
    mode,
    weeksAway,
    tier,
  }: {
    mode: string;
    weeksAway: number | null;
    tier: number | null;
  }) => {
    const reward =
      mode === "steelPath"
        ? "as the tier 5 or tier 10 reward"
        : tier === null
          ? "as a tier reward"
          : `as the tier ${tier} reward`;
    if (weeksAway === null) return `It rotates through the weekly choices, ${reward}.`;
    if (weeksAway === 0) return `It is in this week's choices, ${reward}.`;
    return `It returns to the choices in ${weeksAway} ${plural(weeksAway, "week", "weeks")}, ${reward}.`;
  },
  cavaleroDetail: ({ platinum, now }: { platinum: number; now: boolean }) => {
    const when = now
      ? ", while it is in this week's choices"
      : ", in the weeks it is in the choices";
    return `Cavalero in the Chrysalith sells it once for ${number(platinum)} platinum, with the resources to install it${when}.`;
  },
} as const;

export const STEPS = {
  highestChance: (title: string) => `${title} (Highest chance)`,
  optional: (title: string) => (title.endsWith("(Optional)") ? title : `${title} (Optional)`),
  alternative: (title: string) =>
    title.startsWith("Or ") ? title : `Or ${title.charAt(0).toLowerCase()}${title.slice(1)}`,
  relicAlternative: (relic: string, vaulted: boolean) =>
    vaulted ? `Or ${relic} (Vaulted)` : `Or ${relic}`,
  wiki: "Wiki",
  ourPage: "How to get it",
} as const;

export function detailLine(parts: readonly (string | null)[]): string | null {
  const kept = parts.filter((part): part is string => part !== null && part.length > 0);
  return kept.length > 0 ? kept.join(" ") : null;
}

export function briefLine(parts: readonly (string | null)[]): string {
  return joined(parts) ?? "";
}
