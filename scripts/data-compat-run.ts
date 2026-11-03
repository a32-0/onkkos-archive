import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const OWN_CHECK = path.join(root, "src", "infra", "data-check.ts");
const READS_DATA = /process\.cwd\(\),\s*"data"/;

function sourcesIn(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) return sourcesIn(full);
    return entry.name.endsWith(".ts") ? [full] : [];
  });
}

async function readEverything(): Promise<void> {
  if (existsSync(OWN_CHECK)) {
    const { readAllData } = (await import(pathToFileURL(OWN_CHECK).href)) as {
      readAllData: () => void;
    };
    readAllData();
    return;
  }
  const readers = sourcesIn(path.join(root, "src", "infra")).filter((file) =>
    READS_DATA.test(readFileSync(file, "utf8")),
  );
  for (const file of readers) {
    const exported = (await import(pathToFileURL(file).href)) as Record<string, unknown>;
    for (const value of Object.values(exported)) {
      if (typeof value === "function" && value.length === 0) await value();
    }
  }
}

interface Issue {
  path: (string | number)[];
  message: string;
  note?: string;
}

function told(error: unknown): string {
  const issues = (error as { issues?: Issue[] } | null)?.issues;
  if (!Array.isArray(issues)) return error instanceof Error ? error.message : String(error);
  return issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join(".")}: ${issue.note ?? issue.message}`)
    .join("\n");
}

try {
  await readEverything();
} catch (error) {
  process.stderr.write(`${told(error).slice(0, 1200)}\n`);
  process.exit(1);
}
