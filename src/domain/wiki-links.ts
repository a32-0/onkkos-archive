const PAGE = "https://wiki.warframe.com/w/";
const FILE = "https://wiki.warframe.com/images/";

export function wikiUrl(title: string): string {
  return PAGE + encodeURIComponent(title.replace(/ /g, "_"));
}

export function wikiFileUrl(file: string): string {
  return FILE + encodeURIComponent(file.replace(/ /g, "_"));
}
