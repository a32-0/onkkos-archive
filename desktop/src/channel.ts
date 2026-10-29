export type Channel = "tree" | "github" | "store";

export function channelOf(packaged: boolean, windowsStore: boolean | undefined): Channel {
  if (!packaged) return "tree";
  return windowsStore === true ? "store" : "github";
}
