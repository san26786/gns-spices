import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  destroySession,
  getSessionIdFromCookie,
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const sid = await getSessionIdFromCookie();
  if (sid) await destroySession(sid);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
