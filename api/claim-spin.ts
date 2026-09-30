import { getRedis, readSpinRecord, writeSpinRecord } from "./_lib/redis";
import {
  getClientIp,
  isSpunToday,
  json,
  todayKey,
  type SpinRecord,
} from "./_lib/spinDay";

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, message: "Method not allowed" }, 405);
  }

  try {
    const ip = getClientIp(request);
    const day = todayKey();
    const redis = getRedis();
    const existing = await readSpinRecord(redis, ip);

    if (isSpunToday(existing)) {
      return json(
        {
          ok: false,
          allowed: false,
          alreadySpun: true,
          prizeId: existing!.prizeId,
          prizeLabel: existing!.prizeLabel,
          at: existing!.at,
          dayKey: existing!.dayKey,
          message: "This IP has already spun today. Try again tomorrow.",
        },
        409,
      );
    }

    let body: { prizeId?: string; prizeLabel?: string };
    try {
      body = (await request.json()) as {
        prizeId?: string;
        prizeLabel?: string;
      };
    } catch {
      return json({ ok: false, message: "Invalid JSON body" }, 400);
    }

    if (!body.prizeId) {
      return json({ ok: false, message: "prizeId required" }, 400);
    }

    const record: SpinRecord = {
      prizeId: body.prizeId,
      prizeLabel: body.prizeLabel ?? body.prizeId,
      at: new Date().toISOString(),
      dayKey: day,
    };

    await writeSpinRecord(redis, ip, record);

    return json({
      ok: true,
      allowed: true,
      ip,
      ...record,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "claim-spin failed";
    return json({ ok: false, message }, 500);
  }
}
