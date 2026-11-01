"use client";

import { createPortal, useFormStatus } from "react-dom";

import { SHELL } from "@/content/nav";
import { LoadingCard } from "@/ui/LoadingCard/LoadingCard";

export function Wait() {
  return createPortal(<LoadingCard line={SHELL.wait} wait />, document.body);
}

export function FormWait() {
  return useFormStatus().pending ? <Wait /> : null;
}
