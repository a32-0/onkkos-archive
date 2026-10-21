import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { chromeOf } from "@/app/chrome";
import { requireScreen } from "@/app/screen";
import { readParam, type SearchParams } from "@/domain/types/next";
import { itemPage } from "@/screens/item/view";
import { openedFrom, tabHome } from "@/screens/shell/tabs";

import { itemOf } from "./item";
import { ItemTicks } from "./ItemTicks";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const name = readParam(await searchParams, "name");
  return name ? { title: name } : {};
}

export default async function ItemPage({ searchParams }: { searchParams: SearchParams }) {
  const screen = await requireScreen();
  const query = await searchParams;
  const name = readParam(query, "name");
  const from = readParam(query, "from");
  const facts = name ? await itemOf(screen, name) : null;
  if (!facts) redirect(tabHome(openedFrom(from)));
  const page = itemPage(facts, from, readParam(query, "view"));
  return (
    <ItemTicks key={`${facts.name}:${page.view}`} chrome={await chromeOf(screen)} page={page} />
  );
}
