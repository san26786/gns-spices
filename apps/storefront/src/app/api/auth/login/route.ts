import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { normalizeEmail, verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Do bcrypt.compare on a dummy hash if the user doesn't exist, to avoid
  // timing-based user enumeration. Cheap enough for a login endpoint.
  const DUMMY = "$2b$12$C6UzMDM.H6dfI/f/IKcEeu1/Aq/tX6VbAO4t1oW1H1jH0AwGZLZUC";
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY);
  if (!user || !ok || user.deletedAt || user.isActive === false) {
    return NextResponse.json(
      { ok: false, error: "Email or password is incorrect." },
      { status: 401 },
    );
  }

  const ua = req.headers.get("user-agent") ?? undefined;
  const { token, expiresAt } = await createSession(user.id, ua);
  await setSessionCookie(token, expiresAt);

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
