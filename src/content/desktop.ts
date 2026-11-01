export const DESKTOP = {
  opening: "Onkko is opening the archive...",
  cantStart: ["Onkko's Archive couldn't start.", "Please restart the app."],
  restart: "Restart",
  ready: (version: string) => `${version} installs on restart. Restart now from Profile.`,
} as const;
