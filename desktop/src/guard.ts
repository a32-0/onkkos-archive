import { timingSafeEqual } from "node:crypto";
import http, { type IncomingHttpHeaders, type RequestListener } from "node:http";

export const LAUNCH_HEADER = "x-launch-token";

function same(given: string | string[] | undefined, expected: string): boolean {
  if (typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function admitted(headers: IncomingHttpHeaders, token: string, host: string): boolean {
  return same(headers[LAUNCH_HEADER], token) && headers.host === host;
}

export function guarded(listener: RequestListener, token: string, host: string): RequestListener {
  return (request, response) => {
    if (admitted(request.headers, token, host)) {
      listener(request, response);
      return;
    }
    response.writeHead(403).end();
  };
}

export function guardEveryServer(token: string, host: string): void {
  const create = http.createServer;
  http.createServer = ((...args: unknown[]) => {
    const last = args.length - 1;
    if (typeof args[last] === "function") {
      args[last] = guarded(args[last] as RequestListener, token, host);
    }
    return (create as (...given: unknown[]) => http.Server)(...args);
  }) as typeof http.createServer;
}
