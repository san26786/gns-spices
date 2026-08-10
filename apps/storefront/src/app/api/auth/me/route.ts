import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const cur = await getCurrentSession();
  if (!cur) return NextResponse.json({ ok: true, user: null });
  return NextResponse.json({
    ok: true,
    user: {
      id: cur.user.id,
      email: cur.user.email,
      firstName: cur.user.firstName,
      lastName: cur.user.lastName,
      phone: cur.user.phone,
      emailVerifiedAt: cur.user.emailVerifiedAt,
    },
  });
}
