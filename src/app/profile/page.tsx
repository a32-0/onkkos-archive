import type { Metadata } from "next";
import { PAGE_TITLES } from "@/content/app";
import { checkUpdates, restartNow } from "@/app/actions";
import { chromeOf } from "@/app/chrome";
import { rankOf } from "@/app/rank";
import { playerOf, requireScreen } from "@/app/screen";
import { appVersion, fromStore } from "@/infra/edition";
import { readParam, type SearchParams } from "@/domain/types/next";
import { Profile } from "@/screens/shell/Profile";
import { ROUTES } from "@/routes";
import { profileRank } from "@/screens/rank/view";
import { openedFrom, tabHome } from "@/screens/shell/tabs";

export const metadata: Metadata = { title: PAGE_TITLES.profile };

export default async function ProfilePage({ searchParams }: { searchParams: SearchParams }) {
  const screen = await requireScreen();
  const tab = openedFrom(readParam(await searchParams, "from"));
  const progress = rankOf(screen);
  const rank = progress && profileRank(progress, playerOf(screen).avatar, ROUTES.rank);
  return (
    <Profile
      chrome={await chromeOf(screen)}
      tab={tab}
      back={tabHome(tab)}
      version={appVersion()}
      check={checkUpdates}
      restart={restartNow}
      store={fromStore()}
      rank={rank}
    />
  );
}
