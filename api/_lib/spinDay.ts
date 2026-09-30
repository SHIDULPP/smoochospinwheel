/** Café timezone — daily spin limit resets at midnight IST. */
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

export function redisKeyForIp(ip: string): string {
  return `spin:ip:${ip}`;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
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

export function isSpunToday(record: SpinRecord | null): boolean {
  return Boolean(record && record.dayKey === todayKey());
}
