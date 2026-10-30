import Image from "next/image";
import Link from "next/link";

import { FIND_ID } from "@/content/onboarding";
import { ROUTES, WARFRAME_SITE } from "@/routes";
import { TopBar } from "@/ui/TopBar/TopBar";

import edgeChrome from "./edge-chrome.png";
import firefox from "./firefox.png";
import styles from "./FindId.module.css";

const SHOTS = {
  firefox: { src: firefox, width: 1513, height: 496 },
  "edge-chrome": { src: edgeChrome, width: 1864, height: 901 },
} as const;

export function FindId() {
  return (
    <>
      <TopBar title={FIND_ID.title} back={ROUTES.connect} backLabel={FIND_ID.back} link={Link} />
      <main className={styles.page}>
        <p className={styles.lead}>
          {FIND_ID.lead}
          <a className={styles.site} href={WARFRAME_SITE} target="_blank" rel="noreferrer">
            {FIND_ID.site}
          </a>
          {FIND_ID.leadEnd}
        </p>
        {FIND_ID.browsers.map(({ key, name, steps, shot }) => (
          <section key={key} className={styles.card}>
            <h2 className={styles.label}>{name}</h2>
            <ol className={styles.steps}>
              {steps.map((step, index) => (
                <li key={index}>
                  {step.map((part, at) =>
                    typeof part === "string" ? (
                      part
                    ) : (
                      <strong key={at} className={styles.strong}>
                        {part.strong}
                      </strong>
                    ),
                  )}
                </li>
              ))}
            </ol>
            <Image className={styles.shot} {...SHOTS[key]} alt={shot} sizes="100vw" />
          </section>
        ))}
      </main>
    </>
  );
}
