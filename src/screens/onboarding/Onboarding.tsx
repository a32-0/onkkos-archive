import Image from "next/image";
import Link from "next/link";

import { APP } from "@/content/app";
import { VOICE } from "@/content/voice";
import { ROUTES } from "@/routes";
import { Button } from "@/ui/Button/Button";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";
import { Wordmark } from "@/ui/Wordmark/Wordmark";

import art from "./art.png";
import styles from "./Onboarding.module.css";

export function Onboarding() {
  return (
    <main className={styles.page}>
      <Image className={styles.art} src={art} alt="" fill sizes="100vw" preload />
      <div className={styles.scrim} />
      <div className={styles.frame}>
        <div className={styles.spacer} />
        <Wordmark size="splash" label={APP.name} />
        <div className={styles.content}>
          <Button href={ROUTES.connect} link={Link}>
            {VOICE.onboardingEnter}
          </Button>
          <OnkkoLine place="art" line={VOICE.onboarding} />
        </div>
      </div>
    </main>
  );
}
