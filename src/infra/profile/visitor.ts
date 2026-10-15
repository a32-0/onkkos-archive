import "server-only";

import { headers } from "next/headers";

const LOCAL_VISITOR = "local";

export async function visitorKey(): Promise<string> {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return list.get("x-real-ip")?.trim() || LOCAL_VISITOR;
}
