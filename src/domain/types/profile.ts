interface RawMission {
  Tag: string;
  Completes?: number;
  Tier?: number;
}

interface RawAffiliation {
  Tag: string;
  Standing?: number;
  Title?: number;
}

interface RawXpItem {
  ItemType: string;
  XP?: number;
}

type RawPlayerSkills = Record<string, number>;

interface RawChallengeProgress {
  Name: string;
  Progress?: number;
}

interface RawLoadOutInventory {
  XPInfo?: RawXpItem[];
  [key: string]: unknown;
}

interface RawScan {
  type: string;
  scans?: number;
}

interface RawStats {
  MissionsCompleted?: number;
  TimePlayedSec?: number;
  Scans?: RawScan[];
  [key: string]: unknown;
}

export interface RawProfile {
  AccountId?: unknown;
  DisplayName?: string;
  ActiveAvatarImageType?: string;
  PlatformNames?: string[];
  PlayerLevel?: number;
  GuildId?: unknown;
  GuildName?: string;
  Created?: unknown;
  Missions?: RawMission[];
  Affiliations?: RawAffiliation[];
  LoadOutInventory?: RawLoadOutInventory;
  PlayerSkills?: RawPlayerSkills;
  ChallengeProgress?: RawChallengeProgress[];
  UnlockedOperator?: boolean;
  Stats?: RawStats;
  [key: string]: unknown;
}

export interface RawProfileResponse {
  Results?: RawProfile[];
  Stats?: RawStats;
  [key: string]: unknown;
}

export type FailureReason =
  "invalid-id" | "not-found" | "limited" | "throttled" | "circuit-open" | "upstream" | "malformed";
