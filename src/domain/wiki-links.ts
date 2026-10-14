const PAGE = "https://wiki.warframe.com/w/";

export function wikiUrl(title: string): string {
  return PAGE + encodeURIComponent(title.replace(/ /g, "_"));
}
