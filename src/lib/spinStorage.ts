import type { Prize } from "../config/prizes";

const USED_KEY = "lucky_spinner_used";
const PRIZE_KEY = "lucky_spinner_prize";
const DAY_KEY = "lucky_spinner_day";
/** Set after the browser's first-ever completed spin (first-visit odds). */
const FIRST_SPIN_KEY = "lucky_spinner_first_spin_done";

const TIMEZONE = "Asia/Kolkata";

export function todayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** True if this browser already spun today (Asia/Kolkata). */
export function hasSpun(): boolean {
  try {
    if (localStorage.getItem(USED_KEY) !== "true") return false;
    return localStorage.getItem(DAY_KEY) === todayKey();
  } catch {
    return false;
  }
}

/** True until this browser completes its first-ever spin. */
export function isFirstTimeSpinner(): boolean {
  try {
    return localStorage.getItem(FIRST_SPIN_KEY) !== "true";
  } catch {
    return true;
  }
}

export function markFirstSpinDone(): void {
  try {
    localStorage.setItem(FIRST_SPIN_KEY, "true");
  } catch {
    // ignore
  }
}

export function getSavedPrize(): Prize | null {
  try {
    if (!hasSpun()) return null;
    const raw = localStorage.getItem(PRIZE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Prize;
  } catch {
    return null;
  }
}

export function saveSpinResult(prize: Prize): void {
  try {
    localStorage.setItem(USED_KEY, "true");
    localStorage.setItem(DAY_KEY, todayKey());
    localStorage.setItem(PRIZE_KEY, JSON.stringify(prize));
    localStorage.setItem(FIRST_SPIN_KEY, "true");
  } catch {
    // Storage may be unavailable (private mode quota); ignore
  }
}
