export interface RewardTarget {
  name: string;
  group: string;
}

const COUNT_PREFIX = /^[\d,]+\s*[Xx]?\s+/;
const PARENTHETICAL = /\s*\([^)]*\)\s*/g;
const BLUEPRINT_SUFFIX = / blueprint$/;
const RELIC_SUFFIX = / relic$/;
const CURRENCY = /^[\d,]+\s+(credits|endo)\b/i;

export function isCurrency(raw: string): boolean {
  return CURRENCY.test(raw.trim()) || /\bcredits cache$/i.test(raw.trim());
}

export function normalizeRewardName(raw: string): string {
  return raw
    .replace(COUNT_PREFIX, "")
    .replace(PARENTHETICAL, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function registerTarget(
  index: Map<string, RewardTarget>,
  key: string,
  target: RewardTarget,
): void {
  const normalized = normalizeRewardName(key);
  if (normalized.length === 0 || index.has(normalized)) return;
  index.set(normalized, target);
}

export function resolveReward(
  index: ReadonlyMap<string, RewardTarget>,
  raw: string,
): RewardTarget | null {
  if (isCurrency(raw)) return null;

  const normalized = normalizeRewardName(raw);
  const direct = index.get(normalized);
  if (direct) return direct;

  const withoutBlueprint = normalized.replace(BLUEPRINT_SUFFIX, "");
  const stripped = index.get(withoutBlueprint);
  if (stripped) return stripped;

  if (RELIC_SUFFIX.test(normalized)) {
    const intact = index.get(`${normalized.replace(RELIC_SUFFIX, "")} intact`);
    if (intact) return intact;
  }

  return null;
}
