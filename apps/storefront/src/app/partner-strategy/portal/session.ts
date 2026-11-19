import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Session infrastructure for the private partner strategy portal.
 *
 * - HMAC-SHA256 signed cookie, httpOnly, path-scoped.
 * - 20-minute TTL. When it expires the partner must re-enter the same
 *   access code to open a fresh session.
 * - Codes are per-partner and sourced from an env var so they can be
 *   rotated or revoked without a deploy.
 *
 * This module is server-only and must never be imported by a client
 * component.
 */

export const SESSION_COOKIE = 'gns_strategy_session';
export const SESSION_TTL_SECONDS = 20 * 60;

type Session = { partner: string; iat: number; exp: number };

function secret(): string {
  return (
    process.env.GNS_STRATEGY_SECRET ||
    'gns-strategy-dev-secret-CHANGE-ME-in-production'
  );
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
function b64urlDecode(s: string): Buffer {
  let t = s.replace(/-/g, '+').replace(/_/g, '/');
  while (t.length % 4) t += '=';
  return Buffer.from(t, 'base64');
}

export function signSession(partner: string): { token: string; expiresAt: number } {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + SESSION_TTL_SECONDS;
  const payload: Session = { partner, iat, exp };
  const p = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac('sha256', secret()).update(p).digest());
  return { token: `${p}.${sig}`, expiresAt: exp };
}

export function verifySession(token: string | undefined | null): Session | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [p, sig] = parts;
  const expected = b64url(createHmac('sha256', secret()).update(p).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(p).toString('utf8')) as Session;
    if (!payload || typeof payload.partner !== 'string' || typeof payload.exp !== 'number')
      return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Partner access-code registry.
 *
 * Format: comma-separated `partnerName:code` pairs in the env var
 *   GNS_STRATEGY_CODES="internal:GNS-INT-2026-XXXX,kamdhenu-review:KMD-2026-YYYY"
 *
 * If unset, a dev fallback is enabled so the portal is testable
 * out-of-box. Remove or override in production.
 */
function partnerCodes(): Record<string, string> {
  const raw = process.env.GNS_STRATEGY_CODES || '';
  const out: Record<string, string> = {};
  for (const pair of raw.split(',').map((s) => s.trim()).filter(Boolean)) {
    const idx = pair.indexOf(':');
    if (idx <= 0) continue;
    const name = pair.slice(0, idx).trim();
    const code = pair.slice(idx + 1).trim();
    if (name && code) out[code] = name;
  }
  if (Object.keys(out).length === 0) {
    out['GNS-STRATEGY-2026'] = 'internal-review';
  }
  return out;
}

export function validateCode(code: string): string | null {
  if (!code) return null;
  const trimmed = code.trim();
  const map = partnerCodes();
  return map[trimmed] ?? null;
}
