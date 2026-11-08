import { z } from "zod";

import { missionTags } from "@/domain/graph/star-chart";
import { nodesOfType } from "@/domain/profile/nodes";
import type { RawProfile } from "@/domain/types/profile";

export const rawEvidence = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("flag"), field: z.string() }),
  z.object({ kind: z.literal("affiliation"), tag: z.string() }),
  z.object({ kind: z.literal("mission"), tag: z.string() }),
  z.object({ kind: z.literal("mission_type"), type: z.string() }),
  z.object({ kind: z.literal("item"), type: z.string() }),
  z.object({ kind: z.literal("ability"), prefix: z.string() }),
]);

export type Evidence = z.infer<typeof rawEvidence>;

const rawRule = z.object({
  quest: z.string(),
  evidence: rawEvidence,
  source: z.url(),
  note: z.string().optional(),
});

const rawEvidenceSchema = z.object({
  version: z.number(),
  last_verified: z.string().optional(),
  rules: z.array(rawRule),
});

type EvidenceRule = z.infer<typeof rawRule>;

type EvidenceKind = EvidenceRule["evidence"]["kind"];

export interface QuestEvidenceRules {
  version: number;
  lastVerified?: string;
  rules: EvidenceRule[];
}

interface QuestProof {
  quest: string;
  via: EvidenceKind;
  source: string;
  note?: string;
}

export type ConfirmedQuests = ReadonlyMap<string, QuestProof[]>;

interface ProfileFacts {
  missions: Set<string>;
  affiliations: Set<string>;
  items: Set<string>;
}

export function normalizeEvidenceRules(input: unknown): QuestEvidenceRules {
  const raw = rawEvidenceSchema.parse(input);
  const rules: QuestEvidenceRules = { version: raw.version, rules: raw.rules };
  if (raw.last_verified !== undefined) rules.lastVerified = raw.last_verified;
  return rules;
}

function profileFacts(profile: RawProfile): ProfileFacts {
  return {
    missions: missionTags(profile),
    affiliations: new Set(
      (profile.Affiliations ?? [])
        .map((affiliation) => affiliation?.Tag)
        .filter((tag): tag is string => typeof tag === "string"),
    ),
    items: new Set(
      (profile.LoadOutInventory?.XPInfo ?? [])
        .map((entry) => entry?.ItemType)
        .filter((type): type is string => typeof type === "string"),
    ),
  };
}

export function provenBy(evidence: readonly Evidence[], profile: RawProfile): boolean {
  if (evidence.length === 0) return false;
  const facts = profileFacts(profile);
  return evidence.some((one) => matchEvidence(one, profile, facts));
}

export function confirmedQuests(rules: QuestEvidenceRules, profile: RawProfile): ConfirmedQuests {
  const facts = profileFacts(profile);
  const confirmed = new Map<string, QuestProof[]>();
  for (const rule of rules.rules) {
    if (!matchEvidence(rule.evidence, profile, facts)) continue;
    const proof: QuestProof = { quest: rule.quest, via: rule.evidence.kind, source: rule.source };
    if (rule.note !== undefined) proof.note = rule.note;
    confirmed.set(rule.quest, [...(confirmed.get(rule.quest) ?? []), proof]);
  }
  return confirmed;
}

function usedAbility(profile: RawProfile, prefix: string): boolean {
  const abilities = profile.Stats?.Abilities;
  return (
    Array.isArray(abilities) &&
    abilities.some(
      (ability: { type?: unknown; used?: unknown }) =>
        typeof ability?.type === "string" &&
        ability.type.startsWith(prefix) &&
        typeof ability.used === "number" &&
        ability.used > 0,
    )
  );
}

function matchEvidence(evidence: Evidence, profile: RawProfile, facts: ProfileFacts): boolean {
  switch (evidence.kind) {
    case "flag":
      return profile[evidence.field] === true;
    case "affiliation":
      return facts.affiliations.has(evidence.tag);
    case "mission":
      return facts.missions.has(evidence.tag);
    case "mission_type":
      return nodesOfType(evidence.type).some((node) => facts.missions.has(node.tag));
    case "item":
      return facts.items.has(evidence.type);
    case "ability":
      return usedAbility(profile, evidence.prefix);
  }
}
