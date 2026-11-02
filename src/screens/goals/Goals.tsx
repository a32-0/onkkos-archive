import { GOALS } from "@/content/goals";
import { VOICE } from "@/content/voice";
import { Button } from "@/ui/Button/Button";
import { ChoiceCard } from "@/ui/ChoiceCard/ChoiceCard";
import { Divider } from "@/ui/Divider/Divider";
import { EmptyState } from "@/ui/EmptyState/EmptyState";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { RankCard } from "@/ui/RankCard/RankCard";
import { SearchCard } from "@/ui/SearchCard/SearchCard";

import { Link } from "../shell/Link";
import { Shell } from "../shell/Shell";
import type { RankCardView } from "../rank/state";
import type { ShellChrome } from "../shell/voice";
import styles from "./Goals.module.css";
import { GoalSearch } from "./GoalSearch";
import type { GoalCardView } from "./state";

export function Goals({
  chrome,
  cards,
  rank = null,
  skip,
}: {
  chrome: ShellChrome;
  cards: readonly GoalCardView[];
  rank?: RankCardView | null;
  skip: string;
}) {
  const any = cards.length > 0 || rank !== null;
  return (
    <Shell chrome={chrome} tab="goal" tabs>
      <div className={styles.page}>
        <div className={styles.column}>
          <div className={styles.intro}>
            {chrome.voice.on && <OnkkoLine place="top" line={VOICE.goals} />}
            <h1 className={styles.title}>{GOALS.title}</h1>
            <p className={styles.lead}>{GOALS.lead}</p>
          </div>
          <SearchCard title={GOALS.search.title} line={GOALS.search.line}>
            <GoalSearch />
          </SearchCard>
          {!any && <EmptyState icon="flag" title={GOALS.empty.title} line={GOALS.empty.line} />}
        </div>

        {any && (
          <div className={styles.cards}>
            <div className={styles.divider}>
              <Divider label={GOALS.suggestions} />
            </div>
            {rank && <RankCard {...rank} link={Link} />}
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
