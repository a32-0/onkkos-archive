"use server";

import { redirect } from "next/navigation";

import { forgetAccount } from "@/infra/session";
import { ROUTES } from "@/routes";

export async function disconnect(): Promise<void> {
  await forgetAccount();
  redirect(ROUTES.connect);
}
