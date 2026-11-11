"use client";

import { GOALS } from "@/content/goals";
import { VOICE } from "@/content/voice";
import { ROUTES } from "@/routes";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { RankOverview } from "@/ui/RankOverview/RankOverview";

import { Steps } from "../item/steps/Steps";
import { Link } from "../shell/Link";
import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import styles from "./Rank.module.css";
import type { RankPageView } from "./state";

export function RankScreen({ chrome, page }: { chrome: ShellChrome; page: RankPageView }) {
  return (
    <Shell chrome={chrome} tab="goal" tabs bar={{ title: GOALS.title, back: ROUTES.goals }}>
      <div className={styles.page}>
        <div className={styles.head}>
          {chrome.voice.on && <OnkkoLine place="top" line={VOICE.itemOwned} />}
          <div className={styles.heading}>
            <p className={styles.kicker}>{page.kicker}</p>
            <h1 className={styles.name}>{page.name}</h1>
          </div>
          <RankOverview {...page.overview} link={Link} />
        </div>
        <Steps view={page.steps} />
      </div>
    </Shell>
  );
}
