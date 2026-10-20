import Link from "next/link";

import { SUMMARY } from "@/content/catch-up";
import { VOICE } from "@/content/voice";
import { catchUpCategoryRoute, updatesRoute } from "@/routes";
import { Button } from "@/ui/Button/Button";
import { Divider } from "@/ui/Divider/Divider";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { FeaturedCard } from "@/ui/FeaturedCard/FeaturedCard";
import { List, ListEntry } from "@/ui/List/List";
import { ListItem } from "@/ui/ListItem/ListItem";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";

import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import type { SummaryCardView, SummarySection } from "./state";
import styles from "./Summary.module.css";

export function Summary({
  chrome,
  onboarding,
  card,
  sections,
  month,
  skip,
}: {
  chrome: ShellChrome;
  onboarding: boolean;
  card: SummaryCardView;
  sections: readonly SummarySection[];
  month: string;
  skip: string;
}) {
  const empty = sections.length === 0;
  const step = onboarding ? "summary" : null;
  return (
    <Shell chrome={chrome} tab="resume" tabs={!onboarding}>
      <div className={styles.page}>
        <div className={styles.intro}>
          {chrome.voice.on && <OnkkoLine place="top" line={VOICE.summary} />}
          <h1 className={styles.title}>{SUMMARY.title}</h1>
          {!empty && <p className={styles.lead}>{SUMMARY.lead}</p>}
        </div>
        <FeaturedCard {...card} href={updatesRoute("resume", step)} link={Link} />
        {empty ? (
          <EmptyState
            icon="hourglass"
            title={SUMMARY.nothingNew(month)}
            line={SUMMARY.nothingNewLine}
          />
        ) : (
          sections.map((section) => (
            <section key={section.id} className={styles.section}>
              <Divider label={section.label} />
              <List label={section.label}>
                {section.groups.map((group) => (
                  <ListEntry key={group.id}>
                    <ListItem
                      href={catchUpCategoryRoute(group.key, step)}
                      icon={group.icon}
                      symbol={group.symbol}
                      title={group.name}
                      badge={group.count}
                      link={Link}
                    />
                  </ListEntry>
                ))}
              </List>
            </section>
          ))
        )}
        <Button variant="secondary" href={skip} link={Link}>
          {SUMMARY.skip}
        </Button>
      </div>
    </Shell>
  );
}
