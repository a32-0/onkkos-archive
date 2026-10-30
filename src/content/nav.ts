const RANK_TITLES = [
  "Unranked",
  "Initiate",
  "Silver Initiate",
  "Gold Initiate",
  "Novice",
  "Silver Novice",
  "Gold Novice",
  "Disciple",
  "Silver Disciple",
  "Gold Disciple",
  "Seeker",
  "Silver Seeker",
  "Gold Seeker",
  "Hunter",
  "Silver Hunter",
  "Gold Hunter",
  "Eagle",
  "Silver Eagle",
  "Gold Eagle",
  "Tiger",
  "Silver Tiger",
  "Gold Tiger",
  "Dragon",
  "Silver Dragon",
  "Gold Dragon",
  "Sage",
  "Silver Sage",
  "Gold Sage",
  "Master",
  "Middle Master",
  "True Master",
] as const;

const LEGENDARY_FROM = RANK_TITLES.length;

export const NAV = {
  label: "Sections",
  navigation: "Navigation",
  resume: "Resume",
  goal: "Goal",
} as const;

export const SHELL = {
  profile: "Profile",
  back: "Back",
  masteryRank: (rank: number) => `Mastery Rank ${rank}`,
  rankTitle: (rank: number) =>
    rank >= LEGENDARY_FROM
      ? `Legendary ${rank - LEGENDARY_FROM + 1}`
      : (RANK_TITLES[rank] ?? RANK_TITLES[0]),
  disconnect: "Disconnect",
  disconnectTitle: "Disconnect?",
  disconnectBody:
    "This device will forget your ID. Next time you’ll need to paste it again. Your Warframe account isn’t touched.",
  cancel: "Cancel",
  settings: "Settings",
  language: "Language",
  english: "English",
  spanish: "Español",
  onkko: "Onkko’s Phrases",
  tutorial: "Tutorial",
  reset: "Reset",
  about: "About",
  version: "Version",
  releaseNotes: (version: string) => `Version ${version}: release notes on GitHub`,
  updates: "Updates",
  check: "Check",
  checking: "Checking…",
  upToDate: "Up to date",
  downloading: (version: string) => `Downloading ${version}…`,
  installsOnRestart: (version: string) => `${version} installs on restart`,
  restartNow: "Restart now",
  unreachable: "Couldn’t reach GitHub",
  throughStore: "Through the Microsoft Store",
  on: "On",
  off: "Off",
  age: (minutes: number, fresh: boolean) => {
    if (minutes < 1) return fresh ? "just now" : "less than a minute ago";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  },
  readCycle: (age: string, next: string, local: string | null) => [
    { text: "Data is read every " },
    { text: "12 hours", strong: true },
    { text: ". The last read was " },
    { text: `${age},`, strong: true },
    { text: " and the next one will be at " },
    local === null
      ? { text: `${next} hours UTC.`, strong: true }
      : { text: `${local} your local time.`, strong: true },
  ],
} as const;
