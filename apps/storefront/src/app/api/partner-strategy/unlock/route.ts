import { NextRequest, NextResponse } from 'next/server';
import {
  validateCode,
  signSession,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from '@/app/partner-strategy/portal/session';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = typeof body?.code === 'string' ? body.code : '';
  const partner = validateCode(code);
  if (!partner) {
    return NextResponse.json(
      { ok: false, error: 'Invalid access code' },
      { status: 401 },
    );
  }
  const { token, expiresAt } = signSession(partner);
  const res = NextResponse.json({ ok: true, partner, expiresAt });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
