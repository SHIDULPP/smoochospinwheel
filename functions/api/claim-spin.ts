import {
  getClientIp,
  isSpunToday,
  json,
  kvKeyForIp,
  readSpinRecord,
  todayKey,
  type SpinRecord,
} from "../_lib/spinStore";

interface Env {
  SPIN_KV: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const ip = getClientIp(context.request);
  const day = todayKey();

  if (!context.env.SPIN_KV) {
    return json(
      {
        ok: false,
        message: "SPIN_KV binding missing. Bind a KV namespace named SPIN_KV.",
      },
      500,
    );
  }

  const existing = await readSpinRecord(context.env.SPIN_KV, ip);
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
    body = (await context.request.json()) as {
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

  // Expire shortly after next midnight IST (~36h buffer covers edge cases)
  await context.env.SPIN_KV.put(kvKeyForIp(ip), JSON.stringify(record), {
    expirationTtl: 60 * 60 * 36,
  });

  return json({
    ok: true,
    allowed: true,
    ip,
    ...record,
  });
};
