import { NextResponse } from "next/server";

import { readAllData } from "@/infra/data-check";
import { appVersion } from "@/infra/edition";

const PRIVATE = { "cache-control": "private, no-store" };
const SHOWN_ISSUES = 5;

interface Issue {
  path: PropertyKey[];
  message: string;
}

function reasonOf(error: unknown): string {
  const issues = (error as { issues?: Issue[] } | null)?.issues;
  if (Array.isArray(issues)) {
    return issues
      .slice(0, SHOWN_ISSUES)
      .map((issue) => `${issue.path.map(String).join(".")}: ${issue.message}`)
      .join("; ");
  }
  return error instanceof Error ? error.message : "unknown";
}

export function GET() {
  if (appVersion() === null) return new NextResponse(null, { status: 404 });
  try {
    readAllData();
    return NextResponse.json({ ok: true }, { headers: PRIVATE });
  } catch (error) {
    return NextResponse.json(
      { ok: false, reason: reasonOf(error) },
      { status: 500, headers: PRIVATE },
    );
  }
}
