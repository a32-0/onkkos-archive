import type { IconName } from "@/ui/Icon/glyphs";

export interface ConnectState {
  value: string;
  reason: string | null;
  retryAt: number | null;
}

export type ConnectAction = (previous: ConnectState, form: FormData) => Promise<ConnectState>;

export interface Demo {
  key: "ordis" | "cy";
  name: string;
  masteryRank: number;
  icon: IconName;
}
