import { prisma } from "@/lib/db/prisma";

/**
 * Cheap Postgres-backed rate limiting for the signup endpoint.
 * Keeps a rolling ledger in the `signup_attempts` table; every
 * successful call also opportunistically prunes rows older than
 * 24 hours so the table stays small.
 */

const IP_MAX_PER_HOUR = 5;
const IP_MAX_PER_DAY = 20;
const EMAIL_MAX_PER_HOUR = 3;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export type RateLimitOk = { ok: true };
export type RateLimitFail = { ok: false; reason: string };

/** Extract the caller's IP from Vercel / standard proxy headers. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

export async function checkSignupRateLimit(
  ip: string,
  email: string,
): Promise<RateLimitOk | RateLimitFail> {
  const now = Date.now();
  const oneHourAgo = new Date(now - HOUR_MS);
  const oneDayAgo = new Date(now - DAY_MS);

  const [ipHour, ipDay, emailHour] = await Promise.all([
    prisma.signupAttempt.count({
      where: { ip, createdAt: { gte: oneHourAgo } },
    }),
    prisma.signupAttempt.count({
      where: { ip, createdAt: { gte: oneDayAgo } },
    }),
    prisma.signupAttempt.count({
      where: { email, createdAt: { gte: oneHourAgo } },
    }),
  ]);

  if (ipHour >= IP_MAX_PER_HOUR) {
    return { ok: false, reason: "Too many attempts. Please try again in an hour." };
  }
  if (ipDay >= IP_MAX_PER_DAY) {
    return { ok: false, reason: "Too many attempts today. Please try again tomorrow." };
  }
  if (emailHour >= EMAIL_MAX_PER_HOUR) {
    return { ok: false, reason: "This email has been used too many times. Please try again in an hour." };
  }
  return { ok: true };
}

export async function recordSignupAttempt(ip: string, email: string): Promise<void> {
  try {
    await prisma.signupAttempt.create({ data: { ip, email } });
    // Opportunistic prune — delete rows older than 24h. Cheap query
    // with our indexes on (ip, createdAt) and (email, createdAt).
    // Fire and forget · don't await.
    void prisma.signupAttempt
      .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - DAY_MS) } } })
      .catch(() => {});
  } catch {
    // Non-fatal · we don't want the ledger failing to break signup
  }
}

/** A tiny list of throw-away email domains. Not exhaustive, but
 *  catches the most common ones without needing an external service. */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "tempmail.com",
  "trashmail.com",
  "guerrillamail.com",
  "yopmail.com",
  "throwawaymail.com",
  "getnada.com",
  "sharklasers.com",
  "maildrop.cc",
  "temp-mail.org",
  "dispostable.com",
  "fakeinbox.com",
]);

export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain);
}
