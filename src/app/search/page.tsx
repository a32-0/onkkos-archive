import type { Metadata } from "next";
import { PAGE_TITLES } from "@/content/app";
import { chromeOf } from "@/app/chrome";
import { requireScreen } from "@/app/screen";
import { targetInputs } from "@/app/targets";
import { readParam, type SearchParams } from "@/domain/types/next";
import { AdvancedSearch } from "@/screens/search/AdvancedSearch";
import { parseFilters, searchPage } from "@/screens/search/view";

export const metadata: Metadata = { title: PAGE_TITLES.search };

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const screen = await requireScreen();
  const query = await searchParams;
  const filters = parseFilters((name) => readParam(query, name));
  return (
    <AdvancedSearch
      chrome={await chromeOf(screen)}
      filters={filters}
      page={searchPage(targetInputs(screen, filters.term), filters)}
    />
  );
}
