import { BAND } from "./failures";

export const CONNECT = {
  lead: "Onkko will read your public profile and tell you what's left. Nothing is written to your account.",
  fieldLabel: "Account ID",
  fieldPlaceholder: "4b2e9f17c3a85d06e1f74a9c",
  submit: "Connect",
  reading: "Onkko’s reading your codex...",
  whereTitle: "Where do I find this?",
  steps: [
    { text: "On a computer, log in at the official site:", link: "https://www.warframe.com" },
    {
      text: "In the same browser, open the developer tools (F12) and go to:",
      value: [
        { label: "On Firefox:", text: "Storage › Cookies" },
        { label: "On Chrome:", text: "Application › Cookies" },
      ],
    },
    { text: "Copy the 24-character value of the cookie:", value: [{ label: null, text: "gid" }] },
  ],
  exampleLead: "It will look something like this:",
  example: "gid   4b2e9f17c3a85d06e1f74a9c",
  publicNote:
    "It’s a safe public read endpoint, the same one the game uses to view another player.",
  demoTitle: "Explore with a demo",
  demo: (name: string, masteryRank: number) => `${name} (Mastery Rank ${masteryRank})`,
} as const;

export function connectError(reason: string, retryAt: number | null): string | null {
  switch (reason) {
    case "invalid-id":
      return BAND.invalidId;
    case "not-found":
      return BAND.notFound;
    case "upstream":
    case "throttled":
    case "circuit-open":
      return BAND.notAnswering(retryAt);
    case "malformed":
      return BAND.unreadable;
    case "limited":
      return BAND.limited(retryAt);
    default:
      return null;
  }
}
