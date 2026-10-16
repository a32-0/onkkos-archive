import { connect, demo } from "@/app/actions";
import { readParam, type SearchParams } from "@/domain/types/next";
import { toDisplayProfile } from "@/domain/profile/display";
import { DEMO_ACCOUNT_IDS, loadFixtureProfile } from "@/infra/profile/fixture-source";
import { readAccountId } from "@/infra/session";
import { Connect } from "@/screens/connect/Connect";
import type { Demo } from "@/screens/connect/state";

const DEMOS = [
  { key: "ordis", accountId: DEMO_ACCOUNT_IDS.ordis },
  { key: "cy", accountId: DEMO_ACCOUNT_IDS.cy },
] as const;

function demos(): Demo[] {
  return DEMOS.flatMap(({ key, accountId }) => {
    const profile = loadFixtureProfile(accountId);
    if (!profile) return [];
    const { displayName, masteryRank } = toDisplayProfile(profile);
    return [{ key, name: displayName ?? key, masteryRank: masteryRank ?? 0 }];
  });
}

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
    />
  );
}
