export function oneIn(chance: number | null): number | null {
  if (chance === null || chance <= 0 || chance > 100) return null;
  return Math.round(100 / chance);
}

export function buildHours(seconds: number | null): number | null {
  if (seconds === null || seconds <= 0) return null;
  return Math.round(seconds / 3600);
}

export function buildMinutes(seconds: number | null): number | null {
  if (seconds === null || seconds <= 0 || seconds >= 3600) return null;
  return Math.max(Math.round(seconds / 60), 1);
}
