import Link from "next/link";

import { GOALS } from "@/content/goals";
import { VOICE } from "@/content/voice";
import { Button } from "@/ui/Button/Button";
import { ChoiceCard } from "@/ui/ChoiceCard/ChoiceCard";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { SearchCard } from "@/ui/SearchCard/SearchCard";

import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import styles from "./Goals.module.css";
import { GoalSearch } from "./GoalSearch";
import type { GoalCardView } from "./state";

export function Goals({
  chrome,
  cards,
  skip,
}: {
  chrome: ShellChrome;
  cards: readonly GoalCardView[];
  skip: string;
}) {
  return (
    <Shell chrome={chrome} tab="goal" tabs>
      <div className={styles.page}>
        <div className={styles.column}>
          <div className={styles.intro}>
            {chrome.voice.on && <OnkkoLine place="top" line={VOICE.goals} />}
            <div>
              <h1 className={styles.title}>{GOALS.title}</h1>
              <p className={styles.lead}>{GOALS.lead}</p>
            </div>
          </div>
          <SearchCard title={GOALS.search.title} line={GOALS.search.line}>
            <GoalSearch />
          </SearchCard>
          {cards.length === 0 && (
            <EmptyState icon="flag" title={GOALS.empty.title} line={GOALS.empty.line} />
          )}
        </div>

        {cards.length > 0 && (
          <div className={styles.cards}>
            {cards.map((card) => (
              <ChoiceCard
                key={card.id}
                use="goal"
                href={card.href}
                icon={card.icon}
                title={card.title}
                line={card.line}
                link={Link}
              />
            ))}
          </div>
        )}

        <div className={styles.column}>
          <Button variant="secondary" href={skip} link={Link}>
            {GOALS.skip}
          </Button>
        </div>
      </div>
    </Shell>
  );
}
