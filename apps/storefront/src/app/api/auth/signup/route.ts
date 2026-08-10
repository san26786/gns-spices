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

export const runtime = "nodejs";

type Body = {
  email?: unknown;
  password?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const firstName = String(body.firstName ?? "").trim().slice(0, 60) || null;
  const lastName = String(body.lastName ?? "").trim().slice(0, 60) || null;
  const phone = String(body.phone ?? "").trim().slice(0, 32) || null;

  const emailCheck = validateEmail(email);
  if (!emailCheck.ok) return NextResponse.json({ ok: false, error: emailCheck.reason }, { status: 400 });
  const pwCheck = validatePassword(password);
  if (!pwCheck.ok) return NextResponse.json({ ok: false, error: pwCheck.reason }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Don't leak that the email exists — respond OK but do nothing
    return NextResponse.json({
      ok: true,
      message: "If an account with that email doesn't already exist, we've sent a verification link.",
    });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, phone },
  });

  // Issue + email verification token
  try {
    const token = await issueEmailVerificationToken(user.id);
    await sendVerificationEmail(email, token, firstName);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[signup] verification email failed:", e);
    // Continue anyway — user can request another via resend-verification
  }

  // Log the user in — session cookie
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
      emailVerifiedAt: user.emailVerifiedAt,
    },
    message: "Account created. Please check your email to verify.",
  });
}
