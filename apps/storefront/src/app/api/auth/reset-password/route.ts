import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { consumePasswordResetToken } from "@/lib/auth/verify-token";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { token?: unknown; password?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!token) return NextResponse.json({ ok: false, error: "Missing token." }, { status: 400 });
  const check = validatePassword(password);
  if (!check.ok) return NextResponse.json({ ok: false, error: check.reason }, { status: 400 });

  const result = await consumePasswordResetToken(token);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.update({
    where: { id: result.userId },
    data: { passwordHash },
  });

  // Invalidate all existing sessions for this user, then start a fresh one
  await prisma.session.deleteMany({ where: { userId: user.id } });
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
  });
}
