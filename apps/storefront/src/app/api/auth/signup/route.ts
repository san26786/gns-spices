import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  hashPassword,
  normalizeEmail,
  validateEmail,
  validatePassword,
} from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { issueEmailVerificationToken } from "@/lib/auth/verify-token";
import { sendVerificationEmail } from "@/lib/email/mailer";
import {
  checkSignupRateLimit,
  getClientIp,
  isDisposableEmail,
  recordSignupAttempt,
} from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

/** Minimum time (ms) between page-render and submission. Real humans
 *  take longer than 1.5s to fill even a short form; bots submit
 *  instantly. Rejected silently so scrapers can't tune around it. */
const MIN_FORM_TIME_MS = 1500;

const ALLOWED_TITLES = new Set([
  "Mr", "Mrs", "Ms", "Miss", "Mx", "Dr", "Prof", "Rev", "Sir", "Dame", "Other",
]);

type Body = {
  email?: unknown;
  password?: unknown;
  title?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
  location?: unknown;
  address?: unknown;
  /** Honeypot · MUST stay empty. Bots fill in every form field. */
  website?: unknown;
  /** Client-side epoch ms when the form was opened. */
  formOpenedAt?: unknown;
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  // ─── Honeypot ─────────────────────────────────────────────
  // A hidden input named `website` sits in the form; only bots fill
  // it. Silently succeed so we don't teach them what triggered the
  // reject.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true, message: "Thanks — please check your email." });
  }

  // ─── Form-timing check ────────────────────────────────────
  const openedAt = Number(body.formOpenedAt);
  if (!Number.isFinite(openedAt) || Date.now() - openedAt < MIN_FORM_TIME_MS) {
    // Same silent success so bots can't detect this either
    return NextResponse.json({ ok: true, message: "Thanks — please check your email." });
  }

  // ─── Field parsing + validation ───────────────────────────
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const rawTitle = String(body.title ?? "").trim();
  const title = ALLOWED_TITLES.has(rawTitle) ? rawTitle : null;
  const firstName = String(body.firstName ?? "").trim().slice(0, 60) || null;
  const lastName = String(body.lastName ?? "").trim().slice(0, 60) || null;
  const phone = String(body.phone ?? "").trim().slice(0, 32) || null;
  const location = String(body.location ?? "").trim().slice(0, 120) || null;
  const address = String(body.address ?? "").trim().slice(0, 400) || null;

  const emailCheck = validateEmail(email);
  if (!emailCheck.ok)
    return NextResponse.json({ ok: false, error: emailCheck.reason }, { status: 400 });
  const pwCheck = validatePassword(password);
  if (!pwCheck.ok)
    return NextResponse.json({ ok: false, error: pwCheck.reason }, { status: 400 });
  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please use a real, non-disposable email address." },
      { status: 400 },
    );
  }
  if (!firstName || !lastName) {
    return NextResponse.json(
      { ok: false, error: "First and last name are required." },
      { status: 400 },
    );
  }

  // ─── Rate limit (IP + email) ─────────────────────────────
  const rl = await checkSignupRateLimit(ip, email);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: rl.reason }, { status: 429 });
  }
  // Record the attempt regardless of outcome so throttling works
  await recordSignupAttempt(ip, email);

  // ─── Existing account? Respond silently (don't leak) ──────
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({
      ok: true,
      message: "If that email isn't already registered we've sent a verification link.",
    });
  }

  // ─── Create user + send verification email ───────────────
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      title,
      firstName,
      lastName,
      phone,
      location,
      address,
    },
  });

  try {
    const token = await issueEmailVerificationToken(user.id);
    await sendVerificationEmail(email, token, firstName);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[signup] verification email failed:", e);
    // Continue anyway · user can request a fresh link
  }

  // ─── Session · user is logged in but access-gated on
  //     emailVerifiedAt for protected routes. ─────────────
  const ua = req.headers.get("user-agent") ?? undefined;
  const { token: sessToken, expiresAt } = await createSession(user.id, ua);
  await setSessionCookie(sessToken, expiresAt);

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      title: user.title,
      location: user.location,
      emailVerifiedAt: user.emailVerifiedAt,
    },
    message: "Account created. Please check your email to verify before signing in.",
  });
}
