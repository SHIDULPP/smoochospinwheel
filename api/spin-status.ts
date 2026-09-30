import { getRedis, readSpinRecord } from "./_lib/redis";
import {
  getClientIp,
  isSpunToday,
  json,
  todayKey,
} from "./_lib/spinDay";

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return json({ ok: false, message: "Method not allowed" }, 405);
  }

  try {
    const ip = getClientIp(request);
    const day = todayKey();
    const redis = getRedis();
    const existing = await readSpinRecord(redis, ip);
    const blocked = isSpunToday(existing);

    return json({
      ip,
      dayKey: day,
      allowed: !blocked,
      alreadySpun: blocked,
      prizeId: blocked ? existing!.prizeId : null,
      prizeLabel: blocked ? existing!.prizeLabel : null,
      at: blocked ? existing!.at : null,
      resetsAt: "midnight Asia/Kolkata",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "spin-status failed";
    return json({ ok: false, message }, 500);
  }
}
