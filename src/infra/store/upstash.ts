import "server-only";

import { Redis } from "@upstash/redis";

import type { Store } from "./store";

let client: Redis | null = null;

export function upstashStore(): Store | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  client ??= new Redis({ url, token, automaticDeserialization: false });
  const redis = client;
  return {
    async getMany(keys) {
      if (keys.length === 0) return [];
      return redis.mget<(string | null)[]>(...keys);
    },
    async set(key, value, ttlMs) {
      await redis.set(key, value, { px: ttlMs });
    },
    async setIfAbsent(key, value, ttlMs) {
      return (await redis.set(key, value, { nx: true, px: ttlMs })) === "OK";
    },
    async increment(key, ttlMs) {
      const [, count, left] = await redis
        .pipeline()
        .set(key, "0", { nx: true, px: ttlMs })
        .incr(key)
        .pttl(key)
        .exec<[unknown, number, number]>();
      return { count, ttlMs: left };
    },
    async remove(...keys) {
      if (keys.length > 0) await redis.del(...keys);
    },
  };
}
