"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { SheetHeader } from "../SheetHeader/SheetHeader";
import styles from "./Sheet.module.css";

export type SheetAlign = "start" | "end";

export function Sheet({
  label,
  wordmark,
  closeLabel,
  open,
  onClose,
  align = "end",
  children,
}: {
  label: string;
  wordmark: string;
  closeLabel: string;
  open: boolean;
  onClose: () => void;
  align?: SheetAlign;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      element.focus();
    }
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className={styles[align]}
      aria-label={label}
      tabIndex={-1}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <SheetHeader wordmark={wordmark} closeLabel={closeLabel} onClose={onClose} />
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
