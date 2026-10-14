const ACCOUNT_ID_RE = /^[0-9a-f]{24}$/;

export function normalizeAccountId(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  return ACCOUNT_ID_RE.test(trimmed) ? trimmed : null;
}
