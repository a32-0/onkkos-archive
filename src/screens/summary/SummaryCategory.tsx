import Link from "next/link";

import { SUMMARY } from "@/content/catch-up";
import { VOICE } from "@/content/voice";
import { List, ListEntry } from "@/ui/List/List";
import { MoreLine } from "@/ui/MoreLine/MoreLine";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { SummaryRow } from "@/ui/SummaryRow/SummaryRow";

import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import type { SummaryGroup } from "./state";
import styles from "./Summary.module.css";

export function SummaryCategory({
  chrome,
  onboarding,
  group,
  back,
}: {
  chrome: ShellChrome;
  onboarding: boolean;
  group: SummaryGroup;
  back: string;
}) {
  return (
    <Shell chrome={chrome} tab="resume" tabs={!onboarding} bar={{ title: group.name, back }}>
      <div className={styles.page}>
        <div className={styles.intro}>
          {chrome.voice.on && <OnkkoLine place="top" line={VOICE.summary} />}
          <p className={styles.lead}>{SUMMARY.categoryLead}</p>
        </div>
        {group.tiles.length > 0 && (
          <List label={group.name}>
            {group.tiles.map((tile) => (
              <ListEntry key={tile.name}>
                <SummaryRow
                  href={tile.href}
                  name={tile.name}
                  reading={tile.reading || undefined}
                  place={tile.place || undefined}
                  art={tile.art}
                  compact
                  link={Link}
                />
              </ListEntry>
            ))}
          </List>
        )}
        {group.more && <MoreLine text={group.more} />}
      </div>
    </Shell>
  );
}
