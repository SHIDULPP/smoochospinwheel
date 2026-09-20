/** Café timezone — daily spin limit resets at midnight here. */
export const SPIN_TIMEZONE = "Asia/Kolkata";

export type SpinRecord = {
  prizeId: string;
  prizeLabel: string;
  at: string;
  dayKey: string;
};

export function todayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SPIN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function kvKeyForIp(ip: string): string {
  return `spin:ip:${ip}`;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function readSpinRecord(
  kv: KVNamespace,
  ip: string,
): Promise<SpinRecord | null> {
  const raw = await kv.get(kvKeyForIp(ip));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SpinRecord;
  } catch {
    return null;
  }
}

export function isSpunToday(record: SpinRecord | null): boolean {
  return Boolean(record && record.dayKey === todayKey());
}
