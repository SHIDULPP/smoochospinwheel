export type SpinStatus = {
  allowed: boolean;
  alreadySpun: boolean;
  prizeId: string | null;
  prizeLabel: string | null;
  at: string | null;
  ip?: string;
};

export type ClaimSpinResult = {
  ok: boolean;
  allowed: boolean;
  alreadySpun?: boolean;
  prizeId?: string;
  prizeLabel?: string;
  message?: string;
};

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string };
    if (data.message) return data.message;
  } catch {
    // ignore
  }
  return `Request failed (${res.status})`;
}

export async function fetchSpinStatus(): Promise<SpinStatus> {
  const res = await fetch("/api/spin-status", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as SpinStatus;
}

export async function claimSpin(prize: {
  id: string;
  label: string;
}): Promise<ClaimSpinResult> {
  const res = await fetch("/api/claim-spin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prizeId: prize.id, prizeLabel: prize.label }),
  });
  const data = (await res.json()) as ClaimSpinResult;
  if (res.status === 409) {
    return { ...data, ok: false, allowed: false, alreadySpun: true };
  }
  if (!res.ok) {
    throw new Error(data.message ?? `claim-spin failed (${res.status})`);
  }
  return data;
}
