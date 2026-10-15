import "server-only";

import { redirect } from "next/navigation";

import { readScreen, type Screen } from "@/infra/screen";
import { connectAfter, ROUTES } from "@/routes";

export async function requireScreen(): Promise<Screen> {
  const read = await readScreen();
  if (read.state === "no-account") redirect(ROUTES.connect);
  if (read.state === "failed") redirect(connectAfter(read.reason, read.retryAt));
  return read.screen;
}
