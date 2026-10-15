import { NextResponse } from "next/server";

import { toDisplayProfile } from "@/domain/profile/display";
import type { FailureReason } from "@/domain/types/profile";
import { readProfile } from "@/infra/profile/read";

const STATUS_BY_REASON: Record<FailureReason, number> = {
  "invalid-id": 400,
  "not-found": 404,
  limited: 429,
  throttled: 503,
  "circuit-open": 503,
  malformed: 502,
  upstream: 502,
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ accountId: string }> },
) {
  const { accountId } = await params;
  const result = await readProfile(accountId);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason, retryAfterSeconds: result.retryAfterSeconds },
      { status: STATUS_BY_REASON[result.reason] },
    );
  }

  return NextResponse.json(
    { display: toDisplayProfile(result.profile), profile: result.profile },
    {
      headers: {
        "x-wf-cache": result.cached ? "hit" : "miss",
        "cache-control": "private, max-age=60",
      },
    },
  );
}
