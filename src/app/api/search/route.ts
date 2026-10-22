import { NextResponse, type NextRequest } from "next/server";

import { targetInputs } from "@/app/targets";
import { readScreen } from "@/infra/screen";
import { suggestionRows } from "@/screens/goals/view";

const PRIVATE = { "cache-control": "private, no-store" };
const MIN_TERM = 2;

export async function GET(request: NextRequest) {
  const read = await readScreen();
  if (read.state !== "ok") {
    return NextResponse.json({ results: [] }, { status: 401, headers: PRIVATE });
  }
  const term = request.nextUrl.searchParams.get("q") ?? "";
  const results =
    term.trim().length < MIN_TERM ? [] : suggestionRows(targetInputs(read.screen, term));
  return NextResponse.json({ results }, { headers: PRIVATE });
}
