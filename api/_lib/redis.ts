import { Redis } from "@upstash/redis";
import type { SpinRecord } from "./spinDay";
import { redisKeyForIp } from "./spinDay";

/** Works with Vercel KV or plain Upstash env vars. */
export function getRedis(): Redis {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Redis env: set KV_REST_API_URL + KV_REST_API_TOKEN (Vercel KV) or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN",
    );
  }

  return new Redis({ url, token });
}

export async function readSpinRecord(
  redis: Redis,
  ip: string,
): Promise<SpinRecord | null> {
  const value = await redis.get<SpinRecord | string>(redisKeyForIp(ip));
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as SpinRecord;
    } catch {
      return null;
    }
  }
  return value;
}

export async function writeSpinRecord(
  redis: Redis,
  ip: string,
  record: SpinRecord,
): Promise<void> {
  // ~36h TTL so keys expire after the IST day window
  await redis.set(redisKeyForIp(ip), record, { ex: 60 * 60 * 36 });
}
