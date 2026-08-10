import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

/**
 * Opaque one-shot tokens for email verification and password reset.
 * The full token is emailed to the user; only its SHA-256 hash is
 * stored in the DB, so a DB leak alone can't be replayed.
 */

const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;    //  1h

function newToken(): { plain: string; hash: string } {
  // 32 random bytes → 43-char base64url, plenty of entropy
  const plain = randomBytes(32)
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const hash = createHash("sha256").update(plain).digest("hex");
  return { plain, hash };
}

function hashOf(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

/** Constant-time compare — prevents timing-side-channel on lookup. */
function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf-8");
  const bb = Buffer.from(b, "utf-8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// ─── EMAIL VERIFICATION ──────────────────────────────────────────

export async function issueEmailVerificationToken(userId: string): Promise<string> {
  const { plain, hash } = newToken();
  // Invalidate any previous outstanding tokens for this user
  await prisma.verificationToken.deleteMany({
    where: { userId, usedAt: null },
  });
  await prisma.verificationToken.create({
    data: {
      userId,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + EMAIL_VERIFY_TTL_MS),
    },
  });
  return plain;
}

export async function consumeEmailVerificationToken(
  plain: string,
): Promise<{ ok: true; userId: string } | { ok: false; reason: string }> {
  const hash = hashOf(plain);
  const row = await prisma.verificationToken.findUnique({
    where: { tokenHash: hash },
  });
  if (!row) return { ok: false, reason: "Invalid or expired verification link." };
  if (row.usedAt) return { ok: false, reason: "This link has already been used." };
  if (row.expiresAt.getTime() < Date.now())
    return { ok: false, reason: "This verification link has expired." };
  if (!constantTimeEqual(hashOf(plain), row.tokenHash))
    return { ok: false, reason: "Invalid verification link." };

  await prisma.$transaction([
    prisma.verificationToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);
  return { ok: true, userId: row.userId };
}

// ─── PASSWORD RESET ──────────────────────────────────────────────

export async function issuePasswordResetToken(userId: string): Promise<string> {
  const { plain, hash } = newToken();
  await prisma.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  });
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    },
  });
  return plain;
}

export async function consumePasswordResetToken(
  plain: string,
): Promise<{ ok: true; userId: string } | { ok: false; reason: string }> {
  const hash = hashOf(plain);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hash },
  });
  if (!row) return { ok: false, reason: "Invalid or expired reset link." };
  if (row.usedAt) return { ok: false, reason: "This reset link has already been used." };
  if (row.expiresAt.getTime() < Date.now())
    return { ok: false, reason: "This reset link has expired." };
  if (!constantTimeEqual(hashOf(plain), row.tokenHash))
    return { ok: false, reason: "Invalid reset link." };
  await prisma.passwordResetToken.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });
  return { ok: true, userId: row.userId };
}
