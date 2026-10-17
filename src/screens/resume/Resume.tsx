import Link from "next/link";

import { RESUME } from "@/content/catch-up";
import { VOICE } from "@/content/voice";
import { Button } from "@/ui/Button/Button";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";

import { Shell } from "../shell/Shell";
import type { ShellChrome } from "../shell/voice";
import styles from "./Resume.module.css";
import { ResumePicker } from "./ResumePicker";
import type { ResumeAction, ResumeMonth, ResumeUpdate } from "./state";

export function Resume({
  chrome,
  onboarding,
  updates,
  months,
  choose,
  skip,
}: {
  chrome: ShellChrome;
  onboarding: boolean;
  updates: readonly ResumeUpdate[];
  months: readonly ResumeMonth[];
  choose: ResumeAction;
  skip: string;
}) {
  return (
    <Shell chrome={chrome} tab="resume" tabs={!onboarding}>
      <div className={styles.page}>
        <div className={styles.intro}>
          {chrome.voice.on && <OnkkoLine place="top" line={VOICE.resume} />}
          <div>
            <h1 className={styles.title}>{RESUME.title}</h1>
            <p className={styles.lead}>{RESUME.lead}</p>
          </div>
        </div>

        <section className={styles.panel}>
          <div className={styles.area}>
            <ResumePicker
              updates={updates}
              months={months}
              step={onboarding ? "resume" : null}
              choose={choose}
            />
          </div>
        </section>

        <div className={styles.actions}>
          <Button variant="secondary" href={skip} link={Link}>
            {RESUME.skip}
          </Button>
        </div>
      </div>
    </Shell>
  );
}
