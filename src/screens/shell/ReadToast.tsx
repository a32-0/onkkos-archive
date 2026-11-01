"use client";

import { useEffect, useState } from "react";

import { SHELL } from "@/content/nav";
import { Toast } from "@/ui/Toast/Toast";

import type { ShellPlayer } from "./read-cycle";

const SHOWN_KEY = "wf_toasts";
const STAY_MS = 6000;

function shownKeys(): string[] {
  try {
    const shown: unknown = JSON.parse(window.sessionStorage.getItem(SHOWN_KEY) ?? "[]");
    return Array.isArray(shown) ? shown.filter((key) => typeof key === "string") : [];
  } catch {
    return [];
  }
}

function remember(key: string) {
  try {
    window.sessionStorage.setItem(SHOWN_KEY, JSON.stringify([...shownKeys(), key].slice(-20)));
  } catch {}
}

export function ReadToast({ player }: { player: ShellPlayer }) {
  const [shown, setShown] = useState<string | null>(null);
  const [held, setHeld] = useState(false);
  const toast = player.toast;
  const key = toast?.key ?? null;
  const connected = toast?.kind === "connected";

  useEffect(() => {
    if (key === null) return;
    if (connected) document.cookie = "wf_toast=; Max-Age=0; Path=/; SameSite=Lax";
    if (shownKeys().includes(key)) return;
    const arrive = window.setTimeout(() => {
      remember(key);
      setHeld(false);
      setShown(key);
    });
    return () => window.clearTimeout(arrive);
  }, [key, connected]);

  useEffect(() => {
    if (shown === null || held) return;
    const leave = window.setTimeout(() => setShown(null), STAY_MS);
    return () => window.clearTimeout(leave);
  }, [shown, held]);

  if (key === null || shown !== key) return null;
  return (
    <Toast
      line={connected ? SHELL.connected(player.name) : SHELL.updated}
      onDismiss={() => {
        setHeld(false);
        setShown(null);
      }}
      onHold={setHeld}
    />
  );
}
