import {
  catalogByUniqueName,
  type CatalogIngredient,
  type CatalogItem,
} from "@/domain/catalog/items";

interface PartRow {
  name: string;
  count: number;
  imageUrl: string | null;
}

interface Component {
  name: string;
  count: number;
  imageUrl: string | null;
}

export interface Dossier {
  item: CatalogItem;
  parts: PartRow[];
  builtFrom: Component[];
  usedIn: Component[];
  buildSeconds: number | null;
}

const MAIN_BLUEPRINT = "Blueprint";

export function dossier(item: CatalogItem, catalog: CatalogItem[]): Dossier {
  const recipe = item.recipe;
  const arsenal = catalogByUniqueName(catalog);
  const isArsenal = (entry: CatalogIngredient) =>
    entry.uniqueName !== null && arsenal.has(entry.uniqueName);

  return {
    item,
    parts: (recipe?.parts ?? []).map((part) => ({
      name: part.name,
      count: part.count,
      imageUrl: part.name === MAIN_BLUEPRINT ? (item.imageUrl ?? part.imageUrl) : part.imageUrl,
    })),
    builtFrom: (recipe?.ingredients ?? []).filter(isArsenal).map((entry) => {
      const source = arsenal.get(entry.uniqueName ?? "");
      return {
        name: source?.name ?? entry.name,
        count: entry.count,
        imageUrl: source?.imageUrl ?? entry.imageUrl,
      };
    }),
    usedIn: usedInIndex(catalog).get(item.uniqueName) ?? [],
    buildSeconds: recipe?.buildSeconds ?? null,
  };
}

const usedIn = new WeakMap<CatalogItem[], Map<string, Component[]>>();

function usedInIndex(catalog: CatalogItem[]): Map<string, Component[]> {
  const cachedIndex = usedIn.get(catalog);
  if (cachedIndex) return cachedIndex;
  const arsenal = catalogByUniqueName(catalog);
  const index = new Map<string, Component[]>();
  for (const consumer of catalog) {
    for (const ingredient of consumer.recipe?.ingredients ?? []) {
      if (ingredient.uniqueName === null || !arsenal.has(ingredient.uniqueName)) continue;
      if (ingredient.uniqueName === consumer.uniqueName) continue;
      const list = index.get(ingredient.uniqueName) ?? [];
      list.push({ name: consumer.name, count: ingredient.count, imageUrl: consumer.imageUrl });
      index.set(ingredient.uniqueName, list);
    }
  }
  for (const list of index.values()) list.sort((a, b) => a.name.localeCompare(b.name));
  usedIn.set(catalog, index);
  return index;
}
