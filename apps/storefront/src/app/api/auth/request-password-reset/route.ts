import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { normalizeEmail, validateEmail } from "@/lib/auth/password";
import { issuePasswordResetToken } from "@/lib/auth/verify-token";
import { sendPasswordResetEmail } from "@/lib/email/mailer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const email = normalizeEmail(body.email);
  const check = validateEmail(email);
  if (!check.ok) return NextResponse.json({ ok: false, error: check.reason }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  // Don't reveal whether the account exists
  if (user) {
    try {
      const token = await issuePasswordResetToken(user.id);
      await sendPasswordResetEmail(email, token, user.firstName);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[password-reset-request] email failed:", e);
    }
  }
  return NextResponse.json({
    ok: true,
    message: "If that email is registered, we've sent a password reset link.",
  });
}
