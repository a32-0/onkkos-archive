import { chromeOf } from "@/app/chrome";
import { requireScreen } from "@/app/screen";
import { readParam, type SearchParams } from "@/domain/types/next";
import { Profile } from "@/screens/shell/Profile";
import { openedFrom, tabHome } from "@/screens/shell/tabs";

export default async function ProfilePage({ searchParams }: { searchParams: SearchParams }) {
  const screen = await requireScreen();
  const tab = openedFrom(readParam(await searchParams, "from"));
  return <Profile chrome={await chromeOf(screen)} tab={tab} back={tabHome(tab)} />;
}
