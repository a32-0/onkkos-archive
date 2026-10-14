export interface Store {
  getMany(keys: string[]): Promise<(string | null)[]>;
  set(key: string, value: string, ttlMs: number): Promise<void>;
  setIfAbsent(key: string, value: string, ttlMs: number): Promise<boolean>;
  increment(key: string, ttlMs: number): Promise<{ count: number; ttlMs: number }>;
  remove(...keys: string[]): Promise<void>;
}

export const storeKeys = {
  profile: (id: string) => `wf:profile:${id}`,
  notFound: (id: string) => `wf:notfound:${id}`,
  lock: (id: string) => `wf:lock:${id}`,
  budget: (visitor: string) => `wf:budget:${visitor}`,
  refusals: "wf:circuit:refusals",
  circuit: "wf:circuit:open",
} as const;
