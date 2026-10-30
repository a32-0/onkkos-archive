import Link from "next/link";

import { APP } from "@/content/app";
import { CONNECT } from "@/content/onboarding";
import { LATEST_RELEASE, ROUTES, STORE_LISTING } from "@/routes";
import { VOICE } from "@/content/voice";
import { Button } from "@/ui/Button/Button";
import { ChoiceCard } from "@/ui/ChoiceCard/ChoiceCard";
import { Header } from "@/ui/Header/Header";
import { OnkkoLine } from "@/ui/OnkkoLine/OnkkoLine";

import styles from "./Connect.module.css";
import { ConnectForm } from "./ConnectForm";
import storeBadge from "./microsoft-store.svg";
import type { ConnectAction, ConnectState, Demo } from "./state";

export function Connect({
  initial,
  demos,
  connect,
  demo,
  demoSite,
}: {
  initial: ConnectState;
  demos: readonly Demo[];
  connect: ConnectAction;
  demo: (form: FormData) => Promise<void>;
  demoSite: boolean;
}) {
  return (
    <>
      <Header variant="wordmark" wordmark={APP.name} />
      <main className={styles.page}>
        <div className={styles.intro}>
          <OnkkoLine place="top" line={VOICE.connect} />
          <p className={styles.lead}>{demoSite ? CONNECT.demoLead : CONNECT.lead}</p>
        </div>

        {!demoSite && <ConnectForm connect={connect} initial={initial} />}

        {!demoSite && (
          <section className={styles.card}>
            <h2 className={styles.label}>{CONNECT.whereTitle}</h2>
            <ol className={styles.steps}>
              {CONNECT.steps.map((step, index) => (
                <li key={step.text} className={styles.step}>
                  <span className={styles.numeral} aria-hidden>
                    {index + 1}
                  </span>
                  <div className={styles.stepText}>
                    <p className={styles.text}>{step.text}</p>
                    <div className={styles.box}>
                      {"link" in step ? (
                        <a className={styles.url} href={step.link} target="_blank" rel="noreferrer">
                          {step.link}
                        </a>
                      ) : (
                        step.value.map(({ label, text }) => (
                          <span key={text} className={styles.line}>
                            {label && <strong className={styles.strong}>{label} </strong>}
                            {text}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <Button variant="secondary" href={ROUTES.findId} link={Link}>
              {CONNECT.moreHelp}
            </Button>
            <div className={styles.example}>
              <p className={styles.text}>{CONNECT.exampleLead}</p>
              <div className={styles.box}>
                <code className={styles.mono}>{CONNECT.example}</code>
              </div>
            </div>
            <hr className={styles.rule} />
            <p className={styles.note}>{CONNECT.publicNote}</p>
          </section>
        )}

        <section className={styles.demo}>
          <h2 className={styles.label}>{CONNECT.demoTitle}</h2>
          <form action={demo} className={styles.demos}>
            {demos.map(({ key, name, masteryRank, icon }) => (
              <ChoiceCard
                key={key}
                use="two-ways-in"
                submit={{ name: "profile", value: key }}
                icon={icon}
                title={name}
                line={CONNECT.demoLine(masteryRank, CONNECT.demoAbout[key])}
              />
            ))}
          </form>
        </section>

        {demoSite && (
          <section className={styles.card}>
            <h2 className={styles.label}>{CONNECT.ownTitle}</h2>
            <p className={styles.lead}>{CONNECT.ownLine}</p>
            <a className={styles.store} href={STORE_LISTING} target="_blank" rel="noreferrer">
              <img
                src={storeBadge.src}
                width={storeBadge.width}
                height={storeBadge.height}
                alt={CONNECT.store}
              />
            </a>
            <Button variant="text" href={LATEST_RELEASE} external>
              {CONNECT.download}
            </Button>
          </section>
        )}
      </main>
    </>
  );
}
