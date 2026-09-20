import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin, PreviewServer, ViteDevServer } from "vite";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "ip-spins.json");
/** Café timezone — daily limit resets at midnight here. */
const TIMEZONE = "Asia/Kolkata";

type SpinRecord = {
  prizeId: string;
  prizeLabel: string;
  at: string;
  /** Calendar day key in Asia/Kolkata, e.g. "2026-09-20" */
  dayKey: string;
};

type SpinDb = Record<string, SpinRecord>;

function todayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function isSpunToday(record: SpinRecord | undefined): boolean {
  return Boolean(record && record.dayKey === todayKey());
}

function ensureDb(): SpinDb {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, "{}", "utf8");
      return {};
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as SpinDb;
  } catch {
    return {};
  }
}

function saveDb(db: SpinDb): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // ignore persistence errors
  }
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]!.trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(",")[0]!.trim();
  }
  const raw = req.socket.remoteAddress ?? "unknown";
  return raw.replace(/^::ffff:/, "");
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function attachSpinApi(middlewares: Connect.Server): void {
  middlewares.use(async (req, res, next) => {
    const url = req.url?.split("?")[0] ?? "";
    if (!url.startsWith("/api/")) return next();

    const day = todayKey();

    if (req.method === "GET" && url === "/api/spin-status") {
      const ip = getClientIp(req);
      const db = ensureDb();
      const existing = db[ip];
      const blocked = isSpunToday(existing);
      return sendJson(res, 200, {
        ip,
        dayKey: day,
        allowed: !blocked,
        alreadySpun: blocked,
        prizeId: blocked ? existing!.prizeId : null,
        prizeLabel: blocked ? existing!.prizeLabel : null,
        at: blocked ? existing!.at : null,
        resetsAt: "midnight Asia/Kolkata",
      });
    }

    if (req.method === "POST" && url === "/api/claim-spin") {
      try {
        const ip = getClientIp(req);
        const db = ensureDb();
        const existing = db[ip];
        if (isSpunToday(existing)) {
          return sendJson(res, 409, {
            ok: false,
            allowed: false,
            alreadySpun: true,
            prizeId: existing!.prizeId,
            prizeLabel: existing!.prizeLabel,
            at: existing!.at,
            dayKey: existing!.dayKey,
            message: "This IP has already spun today. Try again tomorrow.",
          });
        }

        const body = (await readJson(req)) as {
          prizeId?: string;
          prizeLabel?: string;
        };
        if (!body.prizeId) {
          return sendJson(res, 400, { ok: false, message: "prizeId required" });
        }

        const record: SpinRecord = {
          prizeId: body.prizeId,
          prizeLabel: body.prizeLabel ?? body.prizeId,
          at: new Date().toISOString(),
          dayKey: day,
        };
        db[ip] = record;
        saveDb(db);

        return sendJson(res, 200, {
          ok: true,
          allowed: true,
          ip,
          ...record,
        });
      } catch {
        return sendJson(res, 500, { ok: false, message: "Claim failed" });
      }
    }

    return sendJson(res, 404, { ok: false, message: "Not found" });
  });
}

/** Adds /api/spin-status and /api/claim-spin (1 spin per IP per day). */
export function spinIpLimitPlugin(): Plugin {
  return {
    name: "spin-ip-limit",
    configureServer(server: ViteDevServer) {
      attachSpinApi(server.middlewares);
    },
    configurePreviewServer(server: PreviewServer) {
      attachSpinApi(server.middlewares);
    },
  };
}
