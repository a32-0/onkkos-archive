const SAID_BY_GROUP: Readonly<Record<string, string>> = {
  honoria: " Honoria",
  ephemera: " Ephemera",
  incarnons: " Incarnon Genesis",
  relics: " Intact",
};

export function shortName(name: string, group: string): string {
  const said = SAID_BY_GROUP[group];
  return said && name.endsWith(said) && name.length > said.length
    ? name.slice(0, -said.length)
    : name;
}
