/**
 * Server-side session management for GNS Spices.
 * Each session is a row in `sessions`; the browser cookie holds an
 * HMAC-signed token of the session id.  Pattern mirrored from
 * B2B Growth Hub with a fresh cookie name + secret.
 */

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

const COOKIE_NAME = "gns_sess";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET env var missing/short (need 16+ chars).");
  }
  return s;
}

function b64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf-8") : buf;
  return b
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", getSecret()).update(payload).digest());
}

function makeSessionToken(sessionId: string): string {
  return `${b64url(sessionId)}.${sign(sessionId)}`;
}

export function parseSessionToken(token: string): string | null {
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const idEncoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let sessionId: string;
  try {
    const b64 = idEncoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "==".slice(0, (4 - (b64.length % 4)) % 4);
    sessionId = Buffer.from(padded, "base64").toString("utf-8");
  } catch {
    return null;
  }
  const expected = sign(sessionId);
  const a = Buffer.from(sig, "utf-8");
  const b = Buffer.from(expected, "utf-8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return sessionId;
}

export async function createSession(userId: string, userAgent?: string) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await prisma.session.create({
    data: { userId, expiresAt, userAgent: userAgent ?? null },
  });
  return { token: makeSessionToken(session.id), expiresAt, issuedAt: session.issuedAt };
}

export async function destroySession(sessionId: string): Promise<void> {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
}

export type CurrentSession = {
  session: { id: string; userId: string; expiresAt: Date; issuedAt: Date };
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    emailVerifiedAt: Date | null;
  };
};

export async function getCurrentSession(): Promise<CurrentSession | null> {
  const c = await cookies();
  const raw = c.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const sessionId = parseSessionToken(raw);
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          emailVerifiedAt: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  });
  if (!session || !session.user) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    return null;
  }
  if (session.user.deletedAt || session.user.isActive === false) return null;

  return {
    session: {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      issuedAt: session.issuedAt,
    },
    user: {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      phone: session.user.phone,
      emailVerifiedAt: session.user.emailVerifiedAt,
    },
  };
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export async function getSessionIdFromCookie(): Promise<string | null> {
  const c = await cookies();
  const raw = c.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return parseSessionToken(raw);
}
