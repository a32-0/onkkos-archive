import Link from "next/link";

import { APP } from "@/content/app";
import { FEATURES } from "@/content/features";
import { VOICE } from "@/content/voice";
import { ROUTES } from "@/routes";
import { Button } from "@/ui/Button/Button";
import { ChoiceCard } from "@/ui/ChoiceCard/ChoiceCard";
import { Header } from "@/ui/Header/Header";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";

import styles from "./TwoWaysIn.module.css";

export function TwoWaysIn({ name, skip }: { name: string | null; skip: string }) {
  return (
    <div className={styles.screen}>
      <Header variant="wordmark" wordmark={APP.name} />
      <main className={styles.page}>
        <div className={styles.intro}>
          <OnkkoLine place="top" line={VOICE.features(name)} accent={name} />
          <div>
            <h1 className={styles.title}>{FEATURES.title}</h1>
            <p className={styles.lead}>{FEATURES.lead}</p>
          </div>
        </div>

        <div className={styles.cards}>
          <ChoiceCard
            use="two-ways-in"
            href={ROUTES.catchUp}
            icon="hourglass"
            title={FEATURES.catchUp.title}
            line={FEATURES.catchUp.line}
            link={Link}
          />
          <ChoiceCard
            use="two-ways-in"
            href={ROUTES.goals}
            icon="flag"
            title={FEATURES.goals.title}
            line={FEATURES.goals.line}
            link={Link}
          />
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" href={skip} link={Link}>
            {FEATURES.skip}
          </Button>
          <Button variant="text" href={ROUTES.connect} link={Link}>
            {FEATURES.back}
          </Button>
        </div>
      </main>
    </div>
  );
}
