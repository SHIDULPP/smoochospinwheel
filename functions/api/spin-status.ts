import {
  getClientIp,
  isSpunToday,
  json,
  readSpinRecord,
  todayKey,
} from "../_lib/spinStore";

interface Env {
  SPIN_KV: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
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
};
