import { redirect } from "next/navigation";

import { chromeOf } from "@/app/chrome";
import { requireScreen } from "@/app/screen";
import { readParam, type SearchParams } from "@/domain/types/next";
import { ItemScreen } from "@/screens/item/ItemScreen";
import { itemPage } from "@/screens/item/view";
import { openedFrom, tabHome } from "@/screens/shell/tabs";

import { itemOf } from "./item";

export default async function ItemPage({ searchParams }: { searchParams: SearchParams }) {
  const screen = await requireScreen();
  const query = await searchParams;
  const name = readParam(query, "name");
  const from = readParam(query, "from");
  const facts = name ? itemOf(screen, name) : null;
  if (!facts) redirect(tabHome(openedFrom(from)));
  const page = itemPage(facts, from, readParam(query, "view"));
  return (
    <ItemScreen key={`${facts.name}:${page.view}`} chrome={await chromeOf(screen)} page={page} />
  );
}
