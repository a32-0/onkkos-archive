import { BAND } from "./failures";

export const CONNECT = {
  lead: "Onkko will read your public profile and tell you what's left. Nothing is written to your account.",
  demoLead: "This is a demo: two players' archives to explore. Nothing here reads an account.",
  fieldLabel: "Account ID",
  fieldPlaceholder: "4b2e9f17c3a85d06e1f74a9c",
  readsNote:
    "This device can read 2 profiles from Warframe every 12 hours, and a wrong ID uses one. Check it’s the gid value before you connect.",
  submit: "Connect",
  reading: "Onkko is reading your archive...",
  whereTitle: "Where do I find this?",
  steps: [
    { text: "On a computer, log in at the official site:", link: "https://www.warframe.com" },
    {
      text: "In the same browser, open the developer tools, pressing F12, and in the side or down panel go to:",
      value: [
        { label: "On Firefox:", text: "Storage › Cookies" },
        { label: "On Edge or Chrome:", text: "Application › Cookies" },
      ],
    },
    { text: "Copy the 24-character value of the cookie:", value: [{ label: null, text: "gid" }] },
  ],
  exampleLead: "It will look something like this:",
  example: "gid   4b2e9f17c3a85d06e1f74a9c",
  moreHelp: "Help me find my ID",
  publicNote:
    "It’s safe: it’s the same public profile the game shows when you look at another player. We only remember your ID on this device, and Disconnect forgets it.",
  demoTitle: "Explore with a demo",
  demoLine: (masteryRank: number, about: string) => `Mastery Rank ${masteryRank}. ${about}`,
  demoAbout: {
    ordis: "A player starting out, with most of the archive still ahead.",
    cy: "A player far along, with what's left after years of play.",
  },
  ownTitle: "Your own account",
  ownLine:
    "The app reads your profile from your own computer, through your own connection. For Windows and Linux.",
  store: "Download from the Microsoft Store",
  download: "Or from GitHub, for Windows and Linux",
} as const;

export const FIND_ID = {
  title: "Find your ID",
  back: "Back",
  lead: "Where the “gid” cookie is, in what each browser shows. Do it on a computer, logged in at ",
  site: "www.warframe.com",
  leadEnd: ".",
  browsers: [
    {
      key: "firefox",
      name: "Firefox",
      steps: [
        [{ strong: "Press F12" }, " to open the developer tools."],
        ["Go to Storage › Cookies › https://www.warframe.com."],
        ["Type “gid” in the filter, and copy its ", { strong: "Value" }, "."],
      ],
      shot: "Firefox's developer tools on Storage › Cookies › https://www.warframe.com, filtered by gid: one row, the gid cookie, with its value in the Value column.",
    },
    {
      key: "edge-chrome",
      name: "Edge or Chrome",
      steps: [
        [{ strong: "Press F12" }, " to open the developer tools."],
        ["Go to Application › Cookies › https://www.warframe.com."],
        ["Type “gid” in the filter, and copy its ", { strong: "Value" }, "."],
      ],
      shot: "Edge's developer tools on Application › Cookies › https://www.warframe.com, filtered by gid: one row, the gid cookie, with its value in the Value column.",
    },
  ],
} as const;

export function connectError(
  reason: string,
  retryAt: number | null,
  local: string | null = null,
): string | null {
  switch (reason) {
    case "invalid-id":
      return BAND.invalidId;
    case "not-found":
      return BAND.notFound;
    case "upstream":
    case "throttled":
    case "circuit-open":
      return BAND.notAnswering(retryAt, local);
    case "malformed":
      return BAND.unreadable;
    case "limited":
      return BAND.limited(retryAt, local);
    default:
      return null;
  }
}
