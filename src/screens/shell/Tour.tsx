"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

import { TOUR } from "@/content/tour";
import { Button } from "@/ui/Button/Button";

import styles from "./Tour.module.css";

export interface TourStep {
  key: string;
  anchor: string;
  title: string;
  body: string;
}

interface Spot {
  top: number;
  left: number;
  width: number;
  height: number;
  below: boolean;
}

const RING = 4;
const GAP = 12;
const EDGE = 16;
const CARD = 358;

function shown(selector: string): HTMLElement | null {
  const found = [...document.querySelectorAll<HTMLElement>(selector)];
  return found.find((one) => one.getClientRects().length > 0) ?? null;
}

function spotOf(selector: string): Spot | null {
  const rect = shown(selector)?.getBoundingClientRect();
  if (!rect) return null;
  const top = Math.max(0, rect.top - RING);
  const bottom = Math.min(window.innerHeight, rect.bottom + RING);
  return {
    top,
    left: rect.left - RING,
    width: rect.width + RING * 2,
    height: bottom - top,
    below: rect.top + rect.height / 2 < window.innerHeight / 2,
  };
}

function placed(spot: Spot | null): CSSProperties {
  if (!spot) return {};
  const width = Math.min(CARD, window.innerWidth - EDGE * 2);
  const centre = spot.left + spot.width / 2 - width / 2;
  const left = Math.max(EDGE, Math.min(centre, window.innerWidth - width - EDGE));
  const style: Record<string, string> = {
    "--spot-top": `${spot.top}px`,
    "--spot-left": `${spot.left}px`,
    "--spot-width": `${spot.width}px`,
    "--spot-height": `${spot.height}px`,
    "--card-left": `${left}px`,
    "--card-width": `${width}px`,
    ...(spot.below
      ? { "--card-top": `${spot.top + spot.height + GAP}px` }
      : { "--card-bottom": `${window.innerHeight - spot.top + GAP}px` }),
  };
  return style as CSSProperties;
}

export function Tour({ steps, end }: { steps: readonly TourStep[]; end: () => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const ids = useId();
  const [at, setAt] = useState(0);
  const [spot, setSpot] = useState<Spot | null>(null);
  const step = steps[at];

  useEffect(() => {
    const open = dialog.current;
    if (open && !open.open) open.showModal();
  }, []);

  useEffect(() => {
    if (!step) return;
    const place = () => setSpot(spotOf(step.anchor));
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [step]);

  if (!step) return null;
  const last = at === steps.length - 1;
  const close = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      className={styles.tour}
      style={placed(spot)}
      aria-labelledby={`${ids}-title`}
      aria-describedby={`${ids}-body`}
      onClose={() => void end()}
    >
      {spot && <span className={styles.spot} aria-hidden />}
      <section className={spot?.below ? styles.below : styles.above}>
        <p className={styles.step}>{TOUR.step(at + 1, steps.length)}</p>
        <h2 id={`${ids}-title`} className={styles.title}>
          {step.title}
        </h2>
        <p id={`${ids}-body`} className={styles.body}>
          {step.body}
        </p>
        <div className={styles.actions}>
          {!last && (
            <span className={styles.half}>
              <Button variant="text" onClick={close}>
                {TOUR.skip}
              </Button>
            </span>
          )}
          <span className={last ? styles.done : styles.half}>
            <Button key={step.key} autoFocus onClick={last ? close : () => setAt(at + 1)}>
              {last ? TOUR.done : TOUR.next}
            </Button>
          </span>
        </div>
      </section>
    </dialog>
  );
}
