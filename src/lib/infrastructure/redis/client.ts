import "server-only";
import Redis from "ioredis";
import { infrastructureEnv } from "../env";

let singleton: Redis | undefined;
export function getRedisClient(): Redis {
  if (!singleton) {
    singleton = new Redis(infrastructureEnv.redisUrl(), {
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 5000,
      maxRetriesPerRequest: 1,
      retryStrategy: (attempt) => attempt > 3 ? null : Math.min(attempt * 250, 1000),
      enableReadyCheck: true,
    });
    singleton.on("error", (error) => console.error("[HCIL][Redis] client error", error.message));
  }
  return singleton;
}

export async function redisPing(): Promise<string> {
  const client = getRedisClient();
  if (client.status === "wait" || client.status === "end") await client.connect();
  return client.ping();
}

const prefix = process.env.REDIS_KEY_PREFIX?.trim() || "hcil:prod:";
export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await getRedisClient().get(`${prefix}${key}`);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { await getRedisClient().del(`${prefix}${key}`); return null; }
}
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!Number.isSafeInteger(ttlSeconds) || ttlSeconds < 1) throw new Error("Cache TTL must be a positive integer");
  await getRedisClient().set(`${prefix}${key}`, JSON.stringify(value), "EX", ttlSeconds);
}
export async function cacheDelete(key: string): Promise<void> { await getRedisClient().del(`${prefix}${key}`); }

/** Fixed-window limiter. Use only for best-effort throttling, never authorization. */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> {
  if (!Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(windowSeconds) || windowSeconds < 1) throw new Error("Invalid rate-limit configuration");
  const client = getRedisClient();
  const redisKey = `${prefix}ratelimit:${key}`;
  const count = await client.incr(redisKey);
  if (count === 1) await client.expire(redisKey, windowSeconds);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}
