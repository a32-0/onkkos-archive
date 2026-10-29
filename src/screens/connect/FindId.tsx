import Image from "next/image";
import Link from "next/link";

import { FIND_ID } from "@/content/onboarding";
import { ROUTES } from "@/routes";
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
        <p className={styles.lead}>{FIND_ID.lead}</p>
        {FIND_ID.browsers.map(({ key, name, steps, shot }) => (
          <section key={key} className={styles.card}>
            <h2 className={styles.label}>{name}</h2>
            <ol className={styles.steps}>
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <Image className={styles.shot} {...SHOTS[key]} alt={shot} sizes="100vw" />
          </section>
        ))}
      </main>
    </>
  );
}
