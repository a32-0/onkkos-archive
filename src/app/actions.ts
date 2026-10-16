"use server";

import { redirect } from "next/navigation";

import { normalizeAccountId } from "@/domain/profile/account-id";
import { DEMO_ACCOUNT_IDS } from "@/infra/profile/fixture-source";
import { readProfile } from "@/infra/profile/read";
import { forgetAccount, writeAccountId } from "@/infra/session";
import { connectAfter, ROUTES } from "@/routes";
import type { ConnectState } from "@/screens/connect/state";

import { entranceAfter } from "./screen";

export async function connect(_previous: ConnectState, form: FormData): Promise<ConnectState> {
  const typed = form.get("accountId");
  const value = typeof typed === "string" ? typed : "";
  const accountId = normalizeAccountId(value);
  if (!accountId) return { value, reason: "invalid-id", retryAt: null };

  const read = await readProfile(accountId);
  if (!read.ok) {
    const retryAt =
      read.retryAfterSeconds === undefined
        ? null
        : Math.floor(Date.now() / 1000) + read.retryAfterSeconds;
    return { value, reason: read.reason, retryAt };
  }

  await writeAccountId(accountId);
  redirect(entranceAfter(read.profile));
}

export async function demo(form: FormData): Promise<void> {
  const accountId = form.get("profile") === "ordis" ? DEMO_ACCOUNT_IDS.ordis : DEMO_ACCOUNT_IDS.cy;
  const read = await readProfile(accountId);
  if (!read.ok) redirect(connectAfter(read.reason, null));
  await writeAccountId(accountId);
  redirect(entranceAfter(read.profile));
}

export async function disconnect(): Promise<void> {
  await forgetAccount();
  redirect(ROUTES.connect);
}
