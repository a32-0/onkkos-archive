import { NextResponse, type NextRequest } from "next/server";

import { placeCookie } from "@/infra/session";

export function proxy(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const query = request.nextUrl.searchParams;
  const cookie = placeCookie(query.get("system"), query.get("place"));
  if (cookie) response.cookies.set(cookie);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/system",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
