import type { Metadata } from "next";
import { PAGE_TITLES } from "@/content/app";
import { connect, demo } from "@/app/actions";
import { readParam, type SearchParams } from "@/domain/types/next";
import { toDisplayProfile } from "@/domain/profile/display";
import { isDemoSite } from "@/infra/edition";
import { DEMO_ACCOUNT_IDS, loadFixtureProfile } from "@/infra/profile/fixture-source";
import { readAccountId } from "@/infra/session";
import { Connect } from "@/screens/connect/Connect";
import type { Demo } from "@/screens/connect/state";

const DEMOS = [
  { key: "ordis", accountId: DEMO_ACCOUNT_IDS.ordis, icon: "rocket-launch" },
  { key: "cy", accountId: DEMO_ACCOUNT_IDS.cy, icon: "military-tech" },
] as const;

function demos(): Demo[] {
  return DEMOS.flatMap(({ key, accountId, icon }) => {
    const profile = loadFixtureProfile(accountId);
    if (!profile) return [];
    const { displayName, masteryRank } = toDisplayProfile(profile);
    return [{ key, name: displayName ?? key, masteryRank: masteryRank ?? 0, icon }];
  });
}

export const metadata: Metadata = { title: PAGE_TITLES.connect };

export default async function ConnectPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const retry = readParam(query, "retry");
  return (
    <Connect
      initial={{
        value: (await readAccountId()) ?? "",
        reason: readParam(query, "reason"),
        retryAt: retry && /^\d+$/.test(retry) ? Number(retry) : null,
      }}
      demos={demos()}
      connect={connect}
      demo={demo}
      demoSite={isDemoSite()}
    />
  );
}
