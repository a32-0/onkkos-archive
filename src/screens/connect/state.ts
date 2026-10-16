export interface ConnectState {
  value: string;
  reason: string | null;
  retryAt: number | null;
}

export type ConnectAction = (previous: ConnectState, form: FormData) => Promise<ConnectState>;

export interface Demo {
  key: string;
  name: string;
  masteryRank: number;
}
