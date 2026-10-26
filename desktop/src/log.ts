import { createWriteStream, statSync, type WriteStream } from "node:fs";
import path from "node:path";

import { app } from "electron";

const LOG = "app.log";
const LIMIT_BYTES = 1_000_000;

let stream: WriteStream | null = null;

function sizeOf(file: string): number {
  try {
    return statSync(file).size;
  } catch {
    return 0;
  }
}

function logStream(): WriteStream {
  if (stream) return stream;
  const file = path.join(app.getPath("userData"), LOG);
  stream = createWriteStream(file, { flags: sizeOf(file) > LIMIT_BYTES ? "w" : "a" });
  return stream;
}

function write(text: string): void {
  const stamp = new Date().toISOString();
  for (const line of text.split("\n")) if (line.trim()) logStream().write(`${stamp} ${line}\n`);
}

function told(parts: unknown[]): string {
  return parts
    .map((part) => (part instanceof Error ? (part.stack ?? part.message) : String(part)))
    .join(" ");
}

export function keepLog(): void {
  const warn = console.warn.bind(console);
  const error = console.error.bind(console);
  console.warn = (...parts: unknown[]) => {
    write(told(parts));
    warn(...parts);
  };
  console.error = (...parts: unknown[]) => {
    write(told(parts));
    error(...parts);
  };
}

export function logFrom(output: NodeJS.ReadableStream | null, echo: NodeJS.WriteStream): void {
  output?.on("data", (chunk: Buffer) => {
    write(chunk.toString("utf8"));
    echo.write(chunk);
  });
}
